/**
 * Booking engine for the browser-only demo. Pure functions: each takes the current DB and
 * returns a new one (or throws). Same rules as the server version:
 *  - starting checkout HOLDS the hall date and every vendor date for 15 minutes
 *  - payment confirms only if every slot is still free or held by this booking
 *  - expired holds count as free and are cleaned up on every write
 */
import type { DB, CartLine, DayStatus, Hall, Vendor } from "./types";
import { ADVANCE_RATE, HOLD_MINUTES } from "../constants";

export class SlotConflictError extends Error {
  constructor(public labels: string[]) {
    super(`No longer available on this date: ${labels.join(", ")}`);
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clone = (db: DB): DB => structuredClone(db);
const code = () => "RSM-" + Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");

const isActive = (a: { status: string; heldUntil: string | null }, now: number) =>
  a.status === "booked" || a.status === "blocked" || (a.status === "held" && !!a.heldUntil && new Date(a.heldUntil).getTime() > now);

const slotMatch = (type: string, refId: string, date: string) => (a: DB["availability"][number]) =>
  a.date === date && (type === "hall" ? a.hallId === refId : a.vendorId === refId);

/** Remove holds whose 15 minutes have passed. */
export function releaseExpiredHolds(db: DB, now = Date.now()): DB {
  const next = clone(db);
  next.availability = next.availability.filter((a) => !(a.status === "held" && (!a.heldUntil || new Date(a.heldUntil).getTime() <= now)));
  return next;
}

/** Booked, blocked and actively held dates for one hall or vendor. */
export function unavailableDates(db: DB, target: { hallId?: string; vendorId?: string }, now = Date.now()): DayStatus[] {
  return db.availability
    .filter((a) => (target.hallId ? a.hallId === target.hallId : a.vendorId === target.vendorId) && isActive(a, now))
    .map((a) => ({ date: a.date, status: a.status as DayStatus["status"] }))
    .sort((x, y) => x.date.localeCompare(y.date));
}

export function unavailableIdsOn(db: DB, date: string, now = Date.now()) {
  const rows = db.availability.filter((a) => a.date === date && isActive(a, now));
  return { halls: new Set(rows.map((r) => r.hallId).filter(Boolean) as string[]), vendors: new Set(rows.map((r) => r.vendorId).filter(Boolean) as string[]) };
}

function priceLines(db: DB, lines: CartLine[], guests: number) {
  return lines.map((line) => {
    const pkg = db.packages.find((p) => p.id === line.packageId);
    if (line.type === "hall") {
      const hall = db.halls.find((h) => h.id === line.refId);
      if (!hall || !pkg || pkg.hallId !== hall.id) throw new Error("This hall or menu is no longer available. Remove it and add it again.");
      return { ...line, label: `${hall.name} · ${pkg.name}`, price: hall.basePrice + pkg.price * guests };
    }
    const vendor = db.vendors.find((v) => v.id === line.refId);
    if (!vendor || !pkg || pkg.vendorId !== vendor.id) throw new Error("This vendor or package is no longer available. Remove it and add it again.");
    return { ...line, label: `${vendor.businessName} · ${pkg.name}`, price: pkg.price };
  });
}

export function startCheckout(db: DB, input: { customerId: string; eventName: string; eventDate: string; guests: number; lines: CartLine[] }, now = Date.now()) {
  const next = releaseExpiredHolds(db, now);
  const priced = priceLines(next, input.lines, input.guests);
  const conflicts: string[] = [];
  for (const line of priced) {
    const row = next.availability.find(slotMatch(line.type, line.refId, input.eventDate));
    if (row && row.status !== "free") {
      const owner = row.status === "held" && row.heldByBooking ? next.bookings.find((b) => b.id === row.heldByBooking) : undefined;
      if (owner?.customerId !== input.customerId) conflicts.push(line.label.split(" · ")[0]);
    }
  }
  if (conflicts.length) throw new SlotConflictError(conflicts);

  const total = priced.reduce((a, b) => a + b.price, 0);
  const bookingId = uid();
  const heldUntil = new Date(now + HOLD_MINUTES * 60_000).toISOString();
  const booking = {
    id: bookingId, code: code(), customerId: input.customerId, eventName: input.eventName || "Wedding event", eventDate: input.eventDate,
    guests: input.guests, status: "pending", totalAmount: total, advanceAmount: Math.round(total * ADVANCE_RATE), createdAt: new Date(now).toISOString(),
  };
  next.bookings.push(booking);
  priced.forEach((p) => next.items.push({ id: uid(), bookingId, type: p.type, refId: p.refId, packageId: p.packageId, label: p.label, price: p.price, status: "requested" }));
  for (const line of priced) {
    const row = next.availability.find(slotMatch(line.type, line.refId, input.eventDate));
    if (row) Object.assign(row, { status: "held", heldUntil, heldByBooking: bookingId });
    else next.availability.push({ id: uid(), hallId: line.type === "hall" ? line.refId : null, vendorId: line.type === "vendor" ? line.refId : null, date: input.eventDate, status: "held", heldUntil, heldByBooking: bookingId });
  }
  return { db: next, result: { bookingId, code: booking.code, heldUntil } };
}

export function confirmPayment(db: DB, bookingId: string, customerId: string, method: string, now = Date.now()) {
  const next = releaseExpiredHolds(db, now);
  const booking = next.bookings.find((b) => b.id === bookingId);
  if (!booking || booking.customerId !== customerId) throw new Error("Booking not found");
  if (booking.status === "confirmed") return next;
  if (booking.status !== "pending") throw new Error("This booking can no longer be paid");
  const items = next.items.filter((i) => i.bookingId === bookingId);
  const conflicts: string[] = [];
  for (const it of items) {
    const row = next.availability.find(slotMatch(it.type, it.refId, booking.eventDate));
    const ok = !row || row.status === "free" || (row.status === "held" && row.heldByBooking === bookingId);
    if (!ok) conflicts.push(it.label.split(" · ")[0]);
  }
  if (conflicts.length) throw new SlotConflictError(conflicts);
  for (const it of items) {
    const row = next.availability.find(slotMatch(it.type, it.refId, booking.eventDate));
    const data = { status: "booked", heldUntil: null, heldByBooking: bookingId };
    if (row) Object.assign(row, data);
    else next.availability.push({ id: uid(), hallId: it.type === "hall" ? it.refId : null, vendorId: it.type === "vendor" ? it.refId : null, date: booking.eventDate, ...data });
  }
  next.payments.push({ id: uid(), bookingId, amount: booking.advanceAmount, status: "paid", method, createdAt: new Date(now).toISOString() });
  booking.status = "confirmed";
  return next;
}

export function cancelHold(db: DB, bookingId: string): DB {
  const next = clone(db);
  next.availability = next.availability.filter((a) => !(a.heldByBooking === bookingId && a.status === "held"));
  const b = next.bookings.find((x) => x.id === bookingId);
  if (b && b.status === "pending") b.status = "cancelled";
  return next;
}

export function cancelBooking(db: DB, bookingId: string, customerId: string): DB {
  const next = clone(db);
  const b = next.bookings.find((x) => x.id === bookingId && x.customerId === customerId);
  if (!b || (b.status !== "pending" && b.status !== "confirmed")) return db;
  next.availability = next.availability.filter((a) => a.heldByBooking !== b.id);
  if (b.status === "confirmed") next.payments.push({ id: uid(), bookingId: b.id, amount: b.advanceAmount, status: "refunded", method: "card", createdAt: new Date().toISOString() });
  b.status = "cancelled";
  return next;
}

// ---------------- owner / vendor ----------------
export function ownsListing(db: DB, userId: string, kind: string, id: string) {
  return kind === "hall" ? db.halls.some((h) => h.id === id && h.ownerId === userId) : db.vendors.some((v) => v.id === id && v.userId === userId);
}

export function toggleBlockDate(db: DB, userId: string, kind: "hall" | "vendor", id: string, date: string, now = Date.now()) {
  if (!ownsListing(db, userId, kind, id)) throw new Error("Not your listing");
  const next = releaseExpiredHolds(db, now);
  const row = next.availability.find(slotMatch(kind, id, date));
  if (row && (row.status === "booked" || row.status === "held")) throw new Error(`This date is ${row.status} by a customer and can't be changed here.`);
  if (row) {
    next.availability = next.availability.filter((a) => a !== row);
    return { db: next, status: "free" as const };
  }
  next.availability.push({ id: uid(), hallId: kind === "hall" ? id : null, vendorId: kind === "vendor" ? id : null, date, status: "blocked", heldUntil: null, heldByBooking: null });
  return { db: next, status: "blocked" as const };
}

export function respondToItem(db: DB, userId: string, itemId: string, decision: "accept" | "decline"): DB {
  const next = clone(db);
  const item = next.items.find((i) => i.id === itemId);
  if (!item || !ownsListing(next, userId, item.type, item.refId)) return db;
  const booking = next.bookings.find((b) => b.id === item.bookingId)!;
  item.status = decision === "accept" ? "accepted" : "declined";
  if (decision === "decline") {
    next.availability = next.availability.filter((a) => !(slotMatch(item.type, item.refId, booking.eventDate)(a) && a.heldByBooking === booking.id));
    if (booking.status === "confirmed")
      next.payments.push({ id: uid(), bookingId: booking.id, amount: Math.round(item.price * ADVANCE_RATE), status: "refunded", method: "card", createdAt: new Date().toISOString() });
  }
  return next;
}

export function updateHall(db: DB, userId: string, id: string, patch: Partial<Hall>): DB {
  if (!ownsListing(db, userId, "hall", id)) return db;
  const next = clone(db);
  Object.assign(next.halls.find((h) => h.id === id)!, patch);
  return next;
}

export function updateVendor(db: DB, userId: string, id: string, patch: Partial<Vendor>): DB {
  if (!ownsListing(db, userId, "vendor", id)) return db;
  const next = clone(db);
  Object.assign(next.vendors.find((v) => v.id === id)!, patch);
  return next;
}

export function savePackage(db: DB, userId: string, kind: "hall" | "vendor", ownerId: string, pkg: { id?: string; name: string; description: string; price: number }): DB {
  if (!ownsListing(db, userId, kind, ownerId)) return db;
  const next = clone(db);
  const existing = pkg.id ? next.packages.find((p) => p.id === pkg.id) : undefined;
  if (existing) Object.assign(existing, { name: pkg.name, description: pkg.description, price: pkg.price });
  else next.packages.push({ id: uid(), hallId: kind === "hall" ? ownerId : null, vendorId: kind === "vendor" ? ownerId : null, name: pkg.name, description: pkg.description, price: pkg.price });
  return next;
}

export function deletePackage(db: DB, userId: string, packageId: string): DB {
  const pkg = db.packages.find((p) => p.id === packageId);
  if (!pkg) return db;
  const ok = pkg.hallId ? ownsListing(db, userId, "hall", pkg.hallId) : ownsListing(db, userId, "vendor", pkg.vendorId!);
  if (!ok) return db;
  const next = clone(db);
  next.packages = next.packages.filter((p) => p.id !== packageId);
  return next;
}

// ---------------- list your business / admin ----------------
const NEW_PHOTO = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=70";

export function listBusiness(db: DB, f: Record<string, string>): DB {
  const next = clone(db);
  const kind = f.kind === "vendor" ? "vendor" : "hall";
  let user = next.users.find((u) => u.email === f.email);
  if (!user) {
    user = { id: uid(), name: f.contactName || "New partner", email: f.email || `partner${Date.now()}@example.pk`, phone: f.phone || "", role: kind === "hall" ? "hall_owner" : "vendor" };
    next.users.push(user);
  }
  const now = new Date().toISOString();
  if (kind === "hall") {
    const id = uid();
    next.halls.push({
      id, ownerId: user.id, name: f.businessName, city: f.city, area: f.area || "—", type: f.type || "banquet", description: f.description || "",
      capacityMin: Number(f.capacityMin || 100), capacityMax: Number(f.capacityMax || 500), pricePerHead: Number(f.pricePerHead || 2500), basePrice: Number(f.basePrice || 250000),
      amenities: ["Air conditioning", "Parking"], photos: [NEW_PHOTO], rating: 0, approved: "pending", createdAt: now,
    });
    next.packages.push({ id: uid(), hallId: id, vendorId: null, name: "Classic menu", description: "Standard wedding menu", price: Number(f.pricePerHead || 2500) });
  } else {
    const id = uid();
    next.vendors.push({ id, userId: user.id, category: f.category, businessName: f.businessName, city: f.city, description: f.description || "", photos: [NEW_PHOTO], rating: 0, approved: "pending", createdAt: now });
    next.packages.push({ id: uid(), hallId: null, vendorId: id, name: "Standard package", description: "Our most popular package", price: Number(f.startingPrice || 50000) });
  }
  return next;
}

export function reviewListing(db: DB, kind: "hall" | "vendor", id: string, decision: "approve" | "reject"): DB {
  const next = clone(db);
  const rec = kind === "hall" ? next.halls.find((h) => h.id === id) : next.vendors.find((v) => v.id === id);
  if (rec) rec.approved = decision === "approve" ? "approved" : "rejected";
  return next;
}

export function setCommission(db: DB, value: number): DB {
  return { ...db, commissionPercent: Math.min(50, Math.max(0, value)) };
}
