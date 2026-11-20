import "server-only";
import { prisma } from "./db";
import { getCurrentUser } from "./session";
import { parseJSON } from "./utils";
import { ADVANCE_RATE } from "./constants";

export type Listing = {
  kind: "hall" | "vendor";
  id: string;
  name: string;
  city: string;
  photos: string[];
  approved: string;
};

/** The current owner/vendor and their listings (halls or vendor profiles). */
export async function getBusiness() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "hall_owner" && user.role !== "vendor")) return null;
  const listings: Listing[] =
    user.role === "hall_owner"
      ? (await prisma.hall.findMany({ where: { ownerId: user.id } })).map((h) => ({ kind: "hall", id: h.id, name: h.name, city: h.city, photos: parseJSON(h.photos, []), approved: h.approved }))
      : (await prisma.vendor.findMany({ where: { userId: user.id } })).map((v) => ({ kind: "vendor", id: v.id, name: v.businessName, city: v.city, photos: parseJSON(v.photos, []), approved: v.approved }));
  return { user, listings };
}

/** All booking lines for the given listings, newest event first. */
export async function getBusinessItems(listings: Listing[]) {
  const ids = listings.map((l) => l.id);
  const items = await prisma.bookingItem.findMany({
    where: { refId: { in: ids }, booking: { status: { not: "pending" } } },
    include: { booking: { include: { customer: { select: { name: true, phone: true } } } } },
    orderBy: { booking: { eventDate: "asc" } },
  });
  return items.map((i) => ({ ...i, advance: Math.round(i.price * ADVANCE_RATE) }));
}
