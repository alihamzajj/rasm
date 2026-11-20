import type { DB, User } from "./types";
import { ADVANCE_RATE } from "../constants";

export const reviewsFor = (db: DB, targetType: string, id: string) =>
  db.reviews.filter((r) => r.targetType === targetType && r.targetId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const reviewCount = (db: DB, targetType: string, id: string) => db.reviews.filter((r) => r.targetType === targetType && r.targetId === id).length;

export const packagesFor = (db: DB, kind: "hall" | "vendor", id: string) =>
  db.packages.filter((p) => (kind === "hall" ? p.hallId === id : p.vendorId === id)).sort((a, b) => a.price - b.price);

export const approvedHalls = (db: DB) => db.halls.filter((h) => h.approved === "approved");

export function hallCard(db: DB, h: DB["halls"][number]) {
  return { ...h, reviewCount: reviewCount(db, "hall", h.id) };
}

export function vendorView(db: DB, v: DB["vendors"][number]) {
  const packages = packagesFor(db, "vendor", v.id);
  return { ...v, packages, minPrice: packages[0]?.price ?? 0, reviewCount: reviewCount(db, "vendor", v.id) };
}

export const approvedVendors = (db: DB) => db.vendors.filter((v) => v.approved === "approved").map((v) => vendorView(db, v));

export type Listing = { kind: "hall" | "vendor"; id: string; name: string; city: string; photos: string[]; approved: string };

export function getBusiness(db: DB, user: User | null) {
  if (!user || (user.role !== "hall_owner" && user.role !== "vendor")) return null;
  const listings: Listing[] =
    user.role === "hall_owner"
      ? db.halls.filter((h) => h.ownerId === user.id).map((h) => ({ kind: "hall", id: h.id, name: h.name, city: h.city, photos: h.photos, approved: h.approved }))
      : db.vendors.filter((v) => v.userId === user.id).map((v) => ({ kind: "vendor", id: v.id, name: v.businessName, city: v.city, photos: v.photos, approved: v.approved }));
  return { user, listings };
}

/** Booking lines for the given listings (excluding unpaid checkouts), soonest event first. */
export function getBusinessItems(db: DB, listings: Listing[]) {
  const ids = new Set(listings.map((l) => l.id));
  return db.items
    .filter((i) => ids.has(i.refId))
    .map((i) => {
      const booking = db.bookings.find((b) => b.id === i.bookingId)!;
      const customer = db.users.find((u) => u.id === booking.customerId);
      return { ...i, advance: Math.round(i.price * ADVANCE_RATE), booking: { ...booking, customer: { name: customer?.name ?? "Customer", phone: customer?.phone ?? "" } } };
    })
    .filter((i) => i.booking.status !== "pending")
    .sort((a, b) => a.booking.eventDate.localeCompare(b.booking.eventDate));
}

export const paidFor = (db: DB, bookingId: string) => db.payments.filter((p) => p.bookingId === bookingId && p.status === "paid").reduce((a, p) => a + p.amount, 0);
