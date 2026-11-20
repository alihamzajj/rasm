import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CITIES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR, prettyDate } from "@/lib/utils";

export const metadata = { title: "All bookings" };

type SP = { status?: string; city?: string; from?: string; to?: string; q?: string };

export default async function AdminBookings({ searchParams }: { searchParams: SP }) {
  const { status = "", city = "", from = "", to = "", q = "" } = searchParams;
  const where: Prisma.BookingWhereInput = {};
  if (status) where.status = status;
  if (from || to) where.eventDate = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
  if (q) where.OR = [{ code: { contains: q.toUpperCase() } }, { eventName: { contains: q } }, { customer: { name: { contains: q } } }];

  let bookings = await prisma.booking.findMany({ where, include: { customer: true, items: true, payments: true }, orderBy: { eventDate: "desc" } });
  if (city) {
    const hallIds = new Set((await prisma.hall.findMany({ where: { city }, select: { id: true } })).map((h) => h.id));
    bookings = bookings.filter((b) => b.items.some((i) => i.type === "hall" && hallIds.has(i.refId)));
  }
  const total = bookings.reduce((a, b) => a + b.totalAmount, 0);

  return (
    <div>
      <form method="get" className="grid gap-3 rounded-[6px] border border-line bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
        <input name="q" defaultValue={q} placeholder="Code, event or customer" className="field lg:col-span-2" aria-label="Search" />
        <select name="status" defaultValue={status} className="field" aria-label="Status">
          <option value="">All statuses</option>
          {["pending", "confirmed", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="city" defaultValue={city} className="field" aria-label="City">
          <option value="">All cities</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="date" name="from" defaultValue={from} className="field" aria-label="Event date from" />
        <input type="date" name="to" defaultValue={to} className="field" aria-label="Event date to" />
        <div className="flex gap-2 sm:col-span-3 lg:col-span-6">
          <Button size="sm">Filter</Button>
          <Button size="sm" variant="ghost" asChild><Link href="/admin/bookings">Reset</Link></Button>
          <p className="ml-auto self-center text-sm text-ink-muted"><b className="text-maroon">{bookings.length}</b> bookings · {formatPKR(total)}</p>
        </div>
      </form>
      <div className="mt-4 overflow-x-auto rounded-[6px] border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wider text-ink-muted">
            <tr><th className="p-3">Code</th><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Advance</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {bookings.map((b) => {
              const paid = b.payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
              return (
                <tr key={b.id} className="align-top">
                  <td className="p-3 whitespace-nowrap font-bold text-maroon">{b.code}</td>
                  <td className="p-3">{b.eventName}</td>
                  <td className="p-3 whitespace-nowrap">{prettyDate(b.eventDate, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="p-3">{b.customer.name}</td>
                  <td className="p-3 text-xs text-ink-muted">{b.items.map((i) => i.label.split(" · ")[0]).join(", ")}</td>
                  <td className="p-3"><StatusBadge status={b.status} /></td>
                  <td className="p-3 text-right font-semibold">{formatPKR(b.totalAmount)}</td>
                  <td className="p-3 text-right">{paid ? <span className="text-emerald-700">{formatPKR(paid)}</span> : <span className="text-ink-muted">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
