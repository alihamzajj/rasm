"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, getCurrentUser, getCustomerId, DEMO_USERS } from "@/lib/session";
import { startCheckout, confirmPayment, releaseBookingHolds, releaseExpiredHolds, SlotConflictError, type CartLine } from "@/lib/booking";
import { ADVANCE_RATE } from "@/lib/constants";

// ---------------- fake auth ----------------
export async function loginAsAction(formData: FormData) {
  const id = String(formData.get("userId"));
  const demo = DEMO_USERS.find((u) => u.id === id);
  if (!demo) return;
  cookies().set(SESSION_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  redirect(String(formData.get("next") || demo.home));
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect("/");
}

// ---------------- checkout ----------------
export type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string; conflicts?: string[] };

export async function startCheckoutAction(input: { eventName: string; eventDate: string; guests: number; lines: CartLine[] }): Promise<ActionResult<{ bookingId: string; code: string; heldUntil: string }>> {
  if (!input.eventDate) return { ok: false, error: "Pick an event date first." };
  if (!input.lines.length) return { ok: false, error: "Your package is empty." };
  try {
    const customerId = await getCustomerId();
    const data = await startCheckout({ ...input, customerId });
    return { ok: true, data };
  } catch (e) {
    if (e instanceof SlotConflictError) return { ok: false, error: e.message, conflicts: e.labels };
    return { ok: false, error: (e as Error).message };
  }
}

export async function payAction(input: { bookingId: string; method: string }): Promise<ActionResult<{ code: string }>> {
  try {
    // simulate gateway latency
    await new Promise((r) => setTimeout(r, 900));
    const customerId = await getCustomerId();
    const b = await confirmPayment(input.bookingId, customerId, input.method);
    revalidatePath("/bookings");
    return { ok: true, data: { code: b.code } };
  } catch (e) {
    if (e instanceof SlotConflictError) return { ok: false, error: e.message, conflicts: e.labels };
    return { ok: false, error: (e as Error).message };
  }
}

export async function cancelHoldAction(bookingId: string) {
  await releaseBookingHolds(bookingId);
  await prisma.booking.updateMany({ where: { id: bookingId, status: "pending" }, data: { status: "cancelled" } });
}

export async function cancelBookingAction(formData: FormData) {
  const id = String(formData.get("bookingId"));
  const customerId = await getCustomerId();
  const b = await prisma.booking.findFirst({ where: { id, customerId } });
  if (!b || (b.status !== "pending" && b.status !== "confirmed")) return;
  await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { heldByBooking: b.id } });
    await tx.booking.update({ where: { id: b.id }, data: { status: "cancelled" } });
    if (b.status === "confirmed") await tx.payment.create({ data: { bookingId: b.id, amount: b.advanceAmount, status: "refunded", method: "card" } });
  });
  revalidatePath("/bookings");
}

// ---------------- owner / vendor ----------------
async function requireBusiness() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "hall_owner" && user.role !== "vendor")) throw new Error("Log in as a hall owner or vendor");
  return user;
}

/** Make sure the listing (hall or vendor) belongs to the current user. */
async function ownsListing(userId: string, kind: "hall" | "vendor", id: string) {
  if (kind === "hall") return !!(await prisma.hall.findFirst({ where: { id, ownerId: userId } }));
  return !!(await prisma.vendor.findFirst({ where: { id, userId } }));
}

export async function toggleBlockDateAction(input: { kind: "hall" | "vendor"; id: string; date: string }): Promise<ActionResult<{ status: string }>> {
  const user = await requireBusiness();
  if (!(await ownsListing(user.id, input.kind, input.id))) return { ok: false, error: "Not your listing" };
  await releaseExpiredHolds();
  const where = input.kind === "hall" ? { hallId: input.id, date: input.date } : { vendorId: input.id, date: input.date };
  const row = await prisma.availability.findFirst({ where });
  if (row && (row.status === "booked" || row.status === "held")) return { ok: false, error: `This date is ${row.status} by a customer and can't be changed here.` };
  if (row) {
    await prisma.availability.delete({ where: { id: row.id } });
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { status: "free" } };
  }
  await prisma.availability.create({ data: { ...where, status: "blocked" } });
  revalidatePath("/dashboard", "layout");
  return { ok: true, data: { status: "blocked" } };
}

export async function respondToItemAction(formData: FormData) {
  const user = await requireBusiness();
  const itemId = String(formData.get("itemId"));
  const decision = String(formData.get("decision")) === "accept" ? "accepted" : "declined";
  const item = await prisma.bookingItem.findUnique({ where: { id: itemId }, include: { booking: true } });
  if (!item || !(await ownsListing(user.id, item.type as "hall" | "vendor", item.refId))) return;
  await prisma.$transaction(async (tx) => {
    await tx.bookingItem.update({ where: { id: itemId }, data: { status: decision } });
    if (decision === "declined") {
      // free the date and refund this line's share of the advance
      const where = item.type === "hall" ? { hallId: item.refId, date: item.booking.eventDate } : { vendorId: item.refId, date: item.booking.eventDate };
      await tx.availability.deleteMany({ where: { ...where, heldByBooking: item.bookingId } });
      if (item.booking.status === "confirmed")
        await tx.payment.create({ data: { bookingId: item.bookingId, amount: Math.round(item.price * ADVANCE_RATE), status: "refunded", method: "card" } });
    }
  });
  revalidatePath("/dashboard", "layout");
}

export async function updateListingAction(formData: FormData) {
  const user = await requireBusiness();
  const kind = String(formData.get("kind")) as "hall" | "vendor";
  const id = String(formData.get("id"));
  if (!(await ownsListing(user.id, kind, id))) return;
  const photos = String(formData.get("photos") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => /^https:\/\/images\.(unsplash|pexels)\.com\//.test(s));
  if (kind === "hall") {
    const amenities = String(formData.get("amenities") || "").split(",").map((s) => s.trim()).filter(Boolean);
    await prisma.hall.update({
      where: { id },
      data: {
        name: String(formData.get("name")),
        area: String(formData.get("area")),
        city: String(formData.get("city")),
        type: String(formData.get("type")),
        description: String(formData.get("description")),
        capacityMin: Number(formData.get("capacityMin")),
        capacityMax: Number(formData.get("capacityMax")),
        pricePerHead: Number(formData.get("pricePerHead")),
        basePrice: Number(formData.get("basePrice")),
        amenities: JSON.stringify(amenities),
        ...(photos.length ? { photos: JSON.stringify(photos) } : {}),
      },
    });
  } else {
    await prisma.vendor.update({
      where: { id },
      data: {
        businessName: String(formData.get("name")),
        city: String(formData.get("city")),
        description: String(formData.get("description")),
        ...(photos.length ? { photos: JSON.stringify(photos) } : {}),
      },
    });
  }
  revalidatePath("/", "layout");
  redirect("/dashboard/listing?saved=1");
}

export async function savePackageAction(formData: FormData) {
  const user = await requireBusiness();
  const kind = String(formData.get("kind")) as "hall" | "vendor";
  const ownerId = String(formData.get("ownerId"));
  if (!(await ownsListing(user.id, kind, ownerId))) return;
  const pkgId = String(formData.get("packageId") || "");
  const data = { name: String(formData.get("name")), description: String(formData.get("description")), price: Number(formData.get("price")) };
  if (pkgId) await prisma.package.update({ where: { id: pkgId }, data });
  else await prisma.package.create({ data: { ...data, ...(kind === "hall" ? { hallId: ownerId } : { vendorId: ownerId }) } });
  revalidatePath("/", "layout");
}

export async function deletePackageAction(formData: FormData) {
  const user = await requireBusiness();
  const pkg = await prisma.package.findUnique({ where: { id: String(formData.get("packageId")) } });
  if (!pkg) return;
  const ok = pkg.hallId ? await ownsListing(user.id, "hall", pkg.hallId) : await ownsListing(user.id, "vendor", pkg.vendorId!);
  if (!ok) return;
  await prisma.package.delete({ where: { id: pkg.id } });
  revalidatePath("/", "layout");
}

// ---------------- list your business ----------------
export async function listBusinessAction(formData: FormData) {
  const kind = String(formData.get("kind"));
  const name = String(formData.get("contactName") || "New partner");
  const email = String(formData.get("email") || `partner${Date.now()}@example.pk`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, phone: String(formData.get("phone") || ""), role: kind === "hall" ? "hall_owner" : "vendor" },
  });
  const city = String(formData.get("city"));
  const photo = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=70";
  if (kind === "hall") {
    await prisma.hall.create({
      data: {
        ownerId: user.id,
        name: String(formData.get("businessName")),
        city,
        area: String(formData.get("area") || "—"),
        type: String(formData.get("type") || "banquet"),
        description: String(formData.get("description") || ""),
        capacityMin: Number(formData.get("capacityMin") || 100),
        capacityMax: Number(formData.get("capacityMax") || 500),
        pricePerHead: Number(formData.get("pricePerHead") || 2500),
        basePrice: Number(formData.get("basePrice") || 250000),
        photos: JSON.stringify([photo]),
        amenities: JSON.stringify(["Air conditioning", "Parking"]),
        approved: "pending",
        packages: { create: [{ name: "Classic menu", description: "Standard wedding menu", price: Number(formData.get("pricePerHead") || 2500) }] },
      },
    });
  } else {
    await prisma.vendor.create({
      data: {
        userId: user.id,
        category: String(formData.get("category")),
        businessName: String(formData.get("businessName")),
        city,
        description: String(formData.get("description") || ""),
        photos: JSON.stringify([photo]),
        approved: "pending",
        packages: { create: [{ name: "Standard package", description: "Our most popular package", price: Number(formData.get("startingPrice") || 50000) }] },
      },
    });
  }
  revalidatePath("/admin");
  redirect("/list-your-business?sent=1");
}

// ---------------- admin ----------------
async function requireAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") throw new Error("Admins only");
}

export async function reviewListingAction(formData: FormData) {
  await requireAdmin();
  const kind = String(formData.get("kind"));
  const id = String(formData.get("id"));
  const approved = String(formData.get("decision")) === "approve" ? "approved" : "rejected";
  if (kind === "hall") await prisma.hall.update({ where: { id }, data: { approved } });
  else await prisma.vendor.update({ where: { id }, data: { approved } });
  revalidatePath("/", "layout");
}

export async function setCommissionAction(formData: FormData) {
  await requireAdmin();
  const v = Math.min(50, Math.max(0, Number(formData.get("commission"))));
  await prisma.setting.upsert({ where: { key: "commissionPercent" }, update: { value: String(v) }, create: { key: "commissionPercent", value: String(v) } });
  revalidatePath("/admin", "layout");
}
