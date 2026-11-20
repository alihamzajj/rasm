import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser, getCustomerId } from "@/lib/session";
import { cancelBookingAction } from "@/app/actions";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Reveal } from "@/components/motion/reveal";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR, prettyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My bookings" };

const TABS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default async function MyBookings({ searchParams }: { searchParams: { status?: string } }) {
  const user = await getCurrentUser();
  const customerId = await getCustomerId();
  const status = TABS.includes(searchParams.status as (typeof TABS)[number]) ? searchParams.status! : "all";
  const bookings = await prisma.booking.findMany({
    where: { customerId, ...(status !== "all" ? { status } : {}) },
    include: { items: true, payments: true },
    orderBy: { eventDate: "desc" },
  });

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
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
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
              const paid = b.payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
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
                      <StatusBadge status={b.status} />
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
                          <form action={cancelBookingAction}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <Button size="sm" variant="ghost" className="text-rose-700">Cancel</Button>
                          </form>
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
