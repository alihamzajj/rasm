/**
 * Exports the seeded SQLite database to src/lib/demo/seed.json for the browser-only demo.
 * Dates are saved relative to the export day, so the demo always looks current.
 * Run: npm run db:seed && npm run demo:export
 */
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const json = <T,>(s: string, fb: T): T => {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fb;
  }
};

async function main() {
  const [users, halls, vendors, packages, availability, bookings, items, payments, reviews, settings] = await Promise.all([
    prisma.user.findMany(),
    prisma.hall.findMany(),
    prisma.vendor.findMany(),
    prisma.package.findMany(),
    prisma.availability.findMany(),
    prisma.booking.findMany(),
    prisma.bookingItem.findMany(),
    prisma.payment.findMany(),
    prisma.review.findMany(),
    prisma.setting.findMany(),
  ]);
  const data = {
    exportedOn: dayKey(new Date()),
    exportedAt: new Date().toISOString(),
    users: users.map(({ createdAt, ...u }) => u),
    halls: halls.map((h) => ({ ...h, amenities: json<string[]>(h.amenities, []), photos: json<string[]>(h.photos, []), createdAt: h.createdAt.toISOString() })),
    vendors: vendors.map((v) => ({ ...v, photos: json<string[]>(v.photos, []), createdAt: v.createdAt.toISOString() })),
    packages,
    availability: availability.map((a) => ({ ...a, heldUntil: a.heldUntil?.toISOString() ?? null })),
    bookings: bookings.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })),
    items,
    payments: payments.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    reviews: reviews.map(({ photos, ...r }) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    commissionPercent: Number(settings.find((s) => s.key === "commissionPercent")?.value ?? 10),
  };
  writeFileSync("src/lib/demo/seed.json", JSON.stringify(data));
  console.log(`Exported ${halls.length} halls, ${vendors.length} vendors, ${bookings.length} bookings, ${availability.length} dates`);
}

main().finally(() => prisma.$disconnect());
