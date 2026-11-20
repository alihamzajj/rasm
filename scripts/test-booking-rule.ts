/**
 * Checks the double-booking rule against the dev database.
 * Run: npm run test:booking
 */
import { prisma } from "../src/lib/db";
import { startCheckout, confirmPayment, releaseExpiredHolds, SlotConflictError } from "../src/lib/booking";

let failed = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
};

async function main() {
  const hall = await prisma.hall.findFirstOrThrow({ where: { approved: "approved" }, include: { packages: true } });
  const vendor = await prisma.vendor.findFirstOrThrow({ where: { approved: "approved" }, include: { packages: true } });
  const [a, b] = await prisma.user.findMany({ where: { role: "customer" }, take: 2 });
  // a date far in the future that nothing else uses
  const date = "2030-03-14";
  await prisma.availability.deleteMany({ where: { date } });
  const lines = [
    { type: "hall" as const, refId: hall.id, packageId: hall.packages[0].id },
    { type: "vendor" as const, refId: vendor.id, packageId: vendor.packages[0].id },
  ];
  const created: string[] = [];

  // 1. A holds the slots
  const holdA = await startCheckout({ customerId: a.id, eventName: "Test A", eventDate: date, guests: 300, lines });
  created.push(holdA.bookingId);
  const held = await prisma.availability.findMany({ where: { date, heldByBooking: holdA.bookingId, status: "held" } });
  check("checkout holds the hall and every vendor date", held.length === 2);
  check("hold lasts 15 minutes", Math.abs(held[0].heldUntil!.getTime() - Date.now() - 15 * 60_000) < 10_000);

  // 2. B cannot hold the same slots while A's hold is active
  try {
    const r = await startCheckout({ customerId: b.id, eventName: "Test B", eventDate: date, guests: 300, lines });
    created.push(r.bookingId);
    check("second customer is blocked while held", false);
  } catch (e) {
    check("second customer is blocked while held", e instanceof SlotConflictError);
  }

  // 3. A's hold expires -> released automatically -> B can hold
  await prisma.availability.updateMany({ where: { heldByBooking: holdA.bookingId }, data: { heldUntil: new Date(Date.now() - 1000) } });
  const holdB = await startCheckout({ customerId: b.id, eventName: "Test B", eventDate: date, guests: 300, lines });
  created.push(holdB.bookingId);
  check("expired hold is released and someone else can hold", true);

  // 4. A tries to pay late -> refused, because B now holds the slots
  try {
    await confirmPayment(holdA.bookingId, a.id, "card");
    check("late payment after losing the hold is refused", false);
  } catch (e) {
    check("late payment after losing the hold is refused", e instanceof SlotConflictError);
  }

  // 5. B pays in time -> confirmed, slots booked
  const confirmed = await confirmPayment(holdB.bookingId, b.id, "card");
  const booked = await prisma.availability.count({ where: { date, status: "booked", heldByBooking: holdB.bookingId } });
  check("payment in time confirms the booking and books every slot", confirmed.status === "confirmed" && booked === 2);

  // 6. nobody can hold a booked slot
  try {
    const r = await startCheckout({ customerId: a.id, eventName: "Test C", eventDate: date, guests: 300, lines });
    created.push(r.bookingId);
    check("booked slot cannot be held again", false);
  } catch (e) {
    check("booked slot cannot be held again", e instanceof SlotConflictError);
  }

  // 7. two customers racing for the same free slot: exactly one wins
  const raceDate = "2030-03-15";
  await prisma.availability.deleteMany({ where: { date: raceDate } });
  const race = await Promise.allSettled([
    startCheckout({ customerId: a.id, eventName: "Race A", eventDate: raceDate, guests: 300, lines }),
    startCheckout({ customerId: b.id, eventName: "Race B", eventDate: raceDate, guests: 300, lines }),
  ]);
  race.forEach((r) => r.status === "fulfilled" && created.push(r.value.bookingId));
  check("concurrent checkouts: exactly one gets the hold", race.filter((r) => r.status === "fulfilled").length === 1);

  // cleanup
  await prisma.availability.deleteMany({ where: { date: { in: [date, raceDate] } } });
  await prisma.booking.deleteMany({ where: { id: { in: created } } });
  await releaseExpiredHolds();
  console.log(failed ? `\n${failed} check(s) failed` : "\nAll booking-rule checks passed");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
