/**
 * Checks the booking rules of the browser demo engine.
 * Run: npm run test:booking
 */
import { freshDB } from "../src/lib/demo/seed";
import { startCheckout, confirmPayment, toggleBlockDate, respondToItem, unavailableDates, SlotConflictError } from "../src/lib/demo/engine";

let failed = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
};
const throwsConflict = (fn: () => unknown) => {
  try {
    fn();
    return false;
  } catch (e) {
    return e instanceof SlotConflictError;
  }
};

let db = freshDB();
const hall = db.halls.find((h) => h.id && h.approved === "approved" && h.ownerId === "demo-hall-owner")!;
const vendor = db.vendors.find((v) => v.userId === "demo-vendor")!;
const hallPkg = db.packages.find((p) => p.hallId === hall.id)!;
const vendorPkg = db.packages.find((p) => p.vendorId === vendor.id)!;
const lines = [
  { type: "hall" as const, refId: hall.id, packageId: hallPkg.id },
  { type: "vendor" as const, refId: vendor.id, packageId: vendorPkg.id },
];
const other = db.users.find((u) => u.role === "customer" && u.id !== "demo-customer")!;
const date = "2031-05-10";
const t0 = Date.now();

check("seed loads 12 approved halls", db.halls.filter((h) => h.approved === "approved").length === 12);
check("seed loads 5 vendors in each of 8 categories", new Set(db.vendors.filter((v) => v.approved === "approved").map((v) => v.category)).size === 8);
check("upcoming demo booking is still in the future", db.bookings.some((b) => b.customerId === "demo-customer" && b.status === "confirmed" && new Date(b.eventDate) > new Date()));

const a = startCheckout(db, { customerId: "demo-customer", eventName: "A", eventDate: date, guests: 300, lines }, t0);
db = a.db;
check("checkout holds the hall and the vendor", db.availability.filter((x) => x.heldByBooking === a.result.bookingId && x.status === "held").length === 2);
check("held date shows as unavailable", unavailableDates(db, { hallId: hall.id }, t0).some((d) => d.date === date && d.status === "held"));
check("second customer is blocked while held", throwsConflict(() => startCheckout(db, { customerId: other.id, eventName: "B", eventDate: date, guests: 300, lines }, t0 + 60_000)));

const later = t0 + 16 * 60_000;
check("hold expires after 15 minutes", !unavailableDates(db, { hallId: hall.id }, later).some((d) => d.date === date));
const b = startCheckout(db, { customerId: other.id, eventName: "B", eventDate: date, guests: 300, lines }, later);
db = b.db;
check("someone else can hold after expiry", true);
check("late payment is refused", throwsConflict(() => confirmPayment(db, a.result.bookingId, "demo-customer", "card", later + 1000)));
db = confirmPayment(db, b.result.bookingId, other.id, "card", later + 1000);
check("payment in time confirms and books both dates", db.bookings.find((x) => x.id === b.result.bookingId)!.status === "confirmed" && db.availability.filter((x) => x.heldByBooking === b.result.bookingId && x.status === "booked").length === 2);
check("booked date cannot be held", throwsConflict(() => startCheckout(db, { customerId: "demo-customer", eventName: "C", eventDate: date, guests: 300, lines }, later + 2000)));

let blocked = false;
try { toggleBlockDate(db, "demo-hall-owner", "hall", hall.id, date); } catch { blocked = true; }
check("owner cannot block a booked date", blocked);
const r = toggleBlockDate(db, "demo-hall-owner", "hall", hall.id, "2031-06-01");
check("owner can block a free date", r.status === "blocked");

const item = db.items.find((i) => i.bookingId === b.result.bookingId && i.type === "vendor")!;
db = respondToItem(db, "demo-vendor", item.id, "decline");
check("declining frees that vendor's date", !unavailableDates(db, { vendorId: vendor.id }, later).some((d) => d.date === date));

console.log(failed ? `\n${failed} check(s) failed` : "\nAll demo booking checks passed");
process.exit(failed ? 1 : 0);
