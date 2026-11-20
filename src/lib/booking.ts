import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { ADVANCE_RATE, HOLD_MINUTES } from "./constants";

type Tx = Prisma.TransactionClient;

export type CartLine = { type: "hall" | "vendor"; refId: string; packageId: string };

export class SlotConflictError extends Error {
  constructor(public labels: string[]) {
    super(`No longer available on this date: ${labels.join(", ")}`);
  }
}

const slotWhere = (type: "hall" | "vendor", refId: string, date: string) =>
  type === "hall" ? { hallId: refId, date } : { vendorId: refId, date };

/** Release every hold whose heldUntil has passed. Called before any availability read/write. */
export async function releaseExpiredHolds(tx: Tx | typeof prisma = prisma) {
  const res = await tx.availability.deleteMany({ where: { status: "held", heldUntil: { lt: new Date() } } });
  return res.count;
}

/** Dates that are not bookable (booked, blocked, or held by someone right now). */
export async function getUnavailableDates(target: { hallId?: string; vendorId?: string }) {
  await releaseExpiredHolds();
  const rows = await prisma.availability.findMany({
    where: { ...target, status: { in: ["booked", "blocked", "held"] } },
    select: { date: true, status: true, heldUntil: true },
    orderBy: { date: "asc" },
  });
  return rows.map((r) => ({ date: r.date, status: r.status as "booked" | "blocked" | "held" }));
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "RSM-" + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Price every line from the database, never from the client. */
async function priceLines(tx: Tx, lines: CartLine[], guests: number) {
  const priced = [];
  for (const line of lines) {
    const pkg = await tx.package.findUnique({ where: { id: line.packageId } });
    if (line.type === "hall") {
      const hall = await tx.hall.findUnique({ where: { id: line.refId } });
      if (!hall || !pkg || pkg.hallId !== hall.id) throw new Error("Hall or menu not found");
      priced.push({ ...line, label: `${hall.name} · ${pkg.name}`, price: hall.basePrice + pkg.price * guests });
    } else {
      const vendor = await tx.vendor.findUnique({ where: { id: line.refId } });
      if (!vendor || !pkg || pkg.vendorId !== vendor.id) throw new Error("Vendor or package not found");
      priced.push({ ...line, label: `${vendor.businessName} · ${pkg.name}`, price: pkg.price });
    }
  }
  return priced;
}

/**
 * Start checkout: create a pending booking and HOLD the hall date and every vendor date
 * for 15 minutes, all inside one transaction. Throws SlotConflictError if any slot is taken.
 */
export async function startCheckout(input: {
  customerId: string;
  eventName: string;
  eventDate: string;
  guests: number;
  lines: CartLine[];
}) {
  const heldUntil = new Date(Date.now() + HOLD_MINUTES * 60_000);
  try {
    return await prisma.$transaction(async (tx) => {
      await releaseExpiredHolds(tx);
      const priced = await priceLines(tx, input.lines, input.guests);

      // 1. check every slot first
      const conflicts: string[] = [];
      const existing = [];
      for (const line of priced) {
        const row = await tx.availability.findFirst({ where: slotWhere(line.type, line.refId, input.eventDate) });
        if (row && row.status !== "free") {
          let ownHold = false;
          if (row.status === "held" && row.heldByBooking) {
            const owner = await tx.booking.findUnique({ where: { id: row.heldByBooking }, select: { customerId: true } });
            ownHold = owner?.customerId === input.customerId; // re-starting your own checkout
          }
          if (!ownHold) conflicts.push(line.label.split(" · ")[0]);
        }
        existing.push(row);
      }
      if (conflicts.length) throw new SlotConflictError(conflicts);

      // 2. create the pending booking
      const total = priced.reduce((a, b) => a + b.price, 0);
      const booking = await tx.booking.create({
        data: {
          code: makeCode(),
          customerId: input.customerId,
          eventName: input.eventName || "Wedding event",
          eventDate: input.eventDate,
          guests: input.guests,
          status: "pending",
          totalAmount: total,
          advanceAmount: Math.round(total * ADVANCE_RATE),
          items: { create: priced.map((p) => ({ type: p.type, refId: p.refId, packageId: p.packageId, label: p.label, price: p.price })) },
        },
      });

      // 3. hold every slot
      for (let i = 0; i < priced.length; i++) {
        const line = priced[i];
        const row = existing[i];
        if (row) {
          await tx.availability.update({ where: { id: row.id }, data: { status: "held", heldUntil, heldByBooking: booking.id } });
        } else {
          // the unique index on (hallId,date)/(vendorId,date) stops two customers holding the same slot
          await tx.availability.create({ data: { ...slotWhere(line.type, line.refId, input.eventDate), status: "held", heldUntil, heldByBooking: booking.id } });
        }
      }
      return { bookingId: booking.id, code: booking.code, heldUntil: heldUntil.toISOString() };
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new SlotConflictError(["one of your selections (someone just took it)"]);
    }
    throw e;
  }
}

/**
 * Mock payment succeeded: confirm only if every slot is still free or held by THIS booking.
 */
export async function confirmPayment(bookingId: string, customerId: string, method: string) {
  return prisma.$transaction(async (tx) => {
    await releaseExpiredHolds(tx);
    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { items: true } });
    if (!booking || booking.customerId !== customerId) throw new Error("Booking not found");
    if (booking.status === "confirmed") return booking;
    if (booking.status !== "pending") throw new Error("This booking can no longer be paid");

    const conflicts: string[] = [];
    const rows = [];
    for (const it of booking.items) {
      const row = await tx.availability.findFirst({ where: slotWhere(it.type as "hall" | "vendor", it.refId, booking.eventDate) });
      const ok = !row || row.status === "free" || (row.status === "held" && row.heldByBooking === booking.id);
      if (!ok) conflicts.push(it.label.split(" · ")[0]);
      rows.push(row);
    }
    if (conflicts.length) throw new SlotConflictError(conflicts);

    for (let i = 0; i < booking.items.length; i++) {
      const it = booking.items[i];
      const row = rows[i];
      const data = { status: "booked", heldUntil: null, heldByBooking: booking.id };
      if (row) await tx.availability.update({ where: { id: row.id }, data });
      else await tx.availability.create({ data: { ...slotWhere(it.type as "hall" | "vendor", it.refId, booking.eventDate), ...data } });
    }
    await tx.payment.create({ data: { bookingId: booking.id, amount: booking.advanceAmount, status: "paid", method } });
    return tx.booking.update({ where: { id: booking.id }, data: { status: "confirmed" } });
  });
}

/** Customer walks away from checkout: drop the holds straight away. */
export async function releaseBookingHolds(bookingId: string) {
  await prisma.availability.deleteMany({ where: { heldByBooking: bookingId, status: "held" } });
}
