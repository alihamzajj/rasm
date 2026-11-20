import { cookies } from "next/headers";
import { prisma } from "./db";

/** Fake auth for the prototype: the chosen demo user id lives in a cookie. */
export const SESSION_COOKIE = "rasm_user";

export const DEMO_USERS = [
  { id: "demo-customer", role: "customer", label: "Customer", name: "Ayesha Khan", home: "/bookings" },
  { id: "demo-hall-owner", role: "hall_owner", label: "Hall owner", name: "Imran Sheikh", home: "/dashboard" },
  { id: "demo-vendor", role: "vendor", label: "Vendor", name: "Sara Malik", home: "/dashboard" },
  { id: "demo-admin", role: "admin", label: "Admin", name: "Rasm Admin", home: "/admin" },
] as const;

export async function getCurrentUser() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/** Customer actions fall back to the demo customer so the flow never dead-ends. */
export async function getCustomerId() {
  const u = await getCurrentUser();
  return u?.role === "customer" ? u.id : "demo-customer";
}
