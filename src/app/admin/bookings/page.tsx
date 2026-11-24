"use client";
import { useTitle } from "@/lib/use-title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/demo/store";
import { paidFor } from "@/lib/demo/selectors";
import { CITIES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR, prettyDate } from "@/lib/utils";

export default function AdminBookings() {
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) ?? "";
  const status = get("status"), city = get("city"), from = get("from"), to = get("to"), q = get("q");
  const db = useDemo((s) => s.db);
  const cityHalls = new Set(db.halls.filter((h) => h.city === city).map((h) => h.id));
  const needle = q.toLowerCase();
  const bookings = db.bookings
    .map((b) => ({ ...b, customer: db.users.find((u) => u.id === b.customerId) ?? { name: "—" }, items: db.items.filter((i) => i.bookingId === b.id) }))
    .filter((b) => (!status || b.status === status) && (!from || b.eventDate >= from) && (!to || b.eventDate <= to))
    .filter((b) => !q || b.code.toLowerCase().includes(needle) || b.eventName.toLowerCase().includes(needle) || b.customer.name.toLowerCase().includes(needle))
    .filter((b) => !city || b.items.some((i) => i.type === "hall" && cityHalls.has(i.refId)))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  const total = bookings.reduce((a, b) => a + b.totalAmount, 0);

  useTitle("Admin · All bookings");
  return (
    <div>
      <form key={sp.toString()} method="get" className="grid gap-3 rounded-[6px] border border-line bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
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
              const paid = paidFor(db, b.id);
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
