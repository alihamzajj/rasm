import raw from "./seed.json";
import type { DB } from "./types";

const keyToDate = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
const dateToKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Fresh demo data. The seed was exported on `exportedOn`; every date is moved forward by the
 * number of days since then, so upcoming bookings stay upcoming whenever someone opens the demo.
 */
export function freshDB(today = new Date()): DB {
  const data = structuredClone(raw) as unknown as DB & { exportedOn: string; exportedAt: string };
  const shiftDays = Math.round((keyToDate(dateToKey(today)).getTime() - keyToDate(data.exportedOn).getTime()) / 86_400_000);
  const shiftKey = (k: string) => {
    const d = keyToDate(k);
    d.setDate(d.getDate() + shiftDays);
    return dateToKey(d);
  };
  const shiftIso = (s: string | null) => (s ? new Date(new Date(s).getTime() + shiftDays * 86_400_000).toISOString() : s);

  return {
    users: data.users,
    halls: data.halls.map((h) => ({ ...h, createdAt: shiftIso(h.createdAt)! })),
    vendors: data.vendors.map((v) => ({ ...v, createdAt: shiftIso(v.createdAt)! })),
    packages: data.packages,
    availability: data.availability.map((a) => ({ ...a, date: shiftKey(a.date), heldUntil: shiftIso(a.heldUntil) })),
    bookings: data.bookings.map((b) => ({ ...b, eventDate: shiftKey(b.eventDate), createdAt: shiftIso(b.createdAt)! })),
    items: data.items,
    payments: data.payments.map((p) => ({ ...p, createdAt: shiftIso(p.createdAt)! })),
    reviews: data.reviews.map((r) => ({ ...r, createdAt: shiftIso(r.createdAt)! })),
    commissionPercent: data.commissionPercent,
  };
}
