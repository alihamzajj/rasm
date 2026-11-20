import "server-only";
import { prisma } from "./db";
import { parseJSON } from "./utils";
import { releaseExpiredHolds } from "./booking";
import type { Hall, Vendor, Package, Prisma } from "@prisma/client";

export type HallView = Omit<Hall, "amenities" | "photos"> & { amenities: string[]; photos: string[]; reviewCount: number; packages?: Package[] };
export type VendorView = Omit<Vendor, "photos"> & { photos: string[]; reviewCount: number; minPrice: number; packages: Package[] };

export const toHallView = (h: Hall & { packages?: Package[] }, reviewCount = 0): HallView => ({
  ...h,
  amenities: parseJSON<string[]>(h.amenities, []),
  photos: parseJSON<string[]>(h.photos, []),
  reviewCount,
});

export async function reviewCounts(targetType: "hall" | "vendor") {
  const rows = await prisma.review.groupBy({ by: ["targetId"], where: { targetType }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.targetId, r._count._all]));
}

/** Ids of halls / vendors that are NOT free on the given date. */
export async function unavailableIdsOn(date: string) {
  await releaseExpiredHolds();
  const rows = await prisma.availability.findMany({ where: { date, status: { in: ["booked", "blocked", "held"] } }, select: { hallId: true, vendorId: true } });
  return {
    halls: new Set(rows.map((r) => r.hallId).filter(Boolean) as string[]),
    vendors: new Set(rows.map((r) => r.vendorId).filter(Boolean) as string[]),
  };
}

export async function getVendorsView(where: Prisma.VendorWhereInput = {}) {
  const [vendors, counts] = await Promise.all([
    prisma.vendor.findMany({ where: { approved: "approved", ...where }, include: { packages: { orderBy: { price: "asc" } } } }),
    reviewCounts("vendor"),
  ]);
  return vendors.map<VendorView>((v) => ({
    ...v,
    photos: parseJSON<string[]>(v.photos, []),
    reviewCount: counts.get(v.id) ?? 0,
    minPrice: v.packages[0]?.price ?? 0,
  }));
}

export async function getCommission() {
  const s = await prisma.setting.findUnique({ where: { key: "commissionPercent" } });
  return Number(s?.value ?? 10);
}
