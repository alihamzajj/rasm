"use client";
import { useTitle } from "@/lib/use-title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Users } from "lucide-react";
import { useDemo, useCurrentUser, useCustomerId } from "@/lib/demo/store";
import { cancelBooking } from "@/lib/demo/engine";
import { toast } from "@/store/toast";
import { paidFor } from "@/lib/demo/selectors";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Reveal } from "@/components/motion/reveal";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DaysToGo } from "@/components/booking-actions";
import { formatPKR, prettyDate } from "@/lib/utils";

const TABS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default function MyBookings() {
  const user = useCurrentUser();
  const customerId = useCustomerId();
  const db = useDemo((s) => s.db);
  const apply = useDemo((s) => s.apply);
  const q = useSearchParams().get("status") ?? "";
  const status = TABS.includes(q as (typeof TABS)[number]) ? q : "all";
  const bookings = db.bookings
    .filter((b) => b.customerId === customerId && (status === "all" || b.status === status))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
    .map((b) => ({ ...b, items: db.items.filter((i) => i.bookingId === b.id) }));

  useTitle("My bookings");
  return (
    <div>
      <section className="border-b border-line bg-cream py-10 text-center">
        <div className="container">
          <p className="eyebrow">{user?.role === "customer" ? user.name : "Demo customer: Ayesha Khan"}</p>
          <h1 className="mt-2 text-3xl md:text-4xl">My bookings</h1>
          <OrnamentDivider className="mt-4" />
        </div>
      </section>
      <div className="container max-w-4xl py-10">
        <div className="scroll-x mb-6 flex gap-2 pb-1">
          {TABS.map((t) => (
            <Link key={t} href={t === "all" ? "/bookings" : `/bookings?status=${t}`} className={`shrink-0 rounded-[4px] border px-3 py-1.5 text-sm capitalize ${status === t ? "border-maroon bg-maroon text-ivory" : "border-line bg-white hover:border-gold"}`}>
              {t}
            </Link>
          ))}
        </div>
        {bookings.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-xl text-maroon">No bookings here yet</p>
            <Button asChild className="mt-4"><Link href="/halls">Find a hall</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => {
              const paid = paidFor(db, b.id);
              return (
                <Reveal key={b.id} delay={i * 0.05}>
                  <article className="rounded-[6px] border border-line bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="eyebrow">{b.code}</p>
                        <h2 className="mt-1 text-xl">{b.eventName}</h2>
                        <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {prettyDate(b.eventDate)}</span>
                          {b.guests > 0 && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.guests} guests</span>}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={b.status} />
                        {(b.status === "confirmed" || b.status === "pending") && <DaysToGo date={b.eventDate} />}
                      </div>
                    </div>
                    <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
                      {b.items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between gap-3">
                          <span className="text-ink-muted">{it.label}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            {b.status !== "pending" && b.status !== "cancelled" && <StatusBadge status={it.status} />}
                            <span className="font-semibold">{formatPKR(it.price)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                      <p className="text-sm">
                        Total <b className="text-maroon">{formatPKR(b.totalAmount)}</b>
                        <span className="text-ink-muted"> · advance {paid ? `paid ${formatPKR(paid)}` : `due ${formatPKR(b.advanceAmount)}`}</span>
                      </p>
                      <div className="flex gap-2">
                        {b.status === "pending" && <span className="text-xs text-gold-text">Awaiting payment — the hold has expired. Start again from your package.</span>}
                        {(b.status === "confirmed" || b.status === "completed") && (
                          <Button asChild size="sm" variant="outline"><Link href={`/booking/${b.id}`}>View</Link></Button>
                        )}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <Button size="sm" variant="ghost" className="text-rose-700" onClick={() => { apply((d) => cancelBooking(d, b.id, customerId)); toast(`${b.eventName} cancelled`, b.status === "confirmed" ? `${formatPKR(b.advanceAmount)} advance refunded` : undefined, "warning"); }}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
