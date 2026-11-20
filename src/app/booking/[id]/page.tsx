import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { FireworksBanner } from "@/components/fireworks-banner";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR, prettyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking confirmed" };

export default async function BookingConfirmed({ params }: { params: { id: string } }) {
  const b = await prisma.booking.findUnique({ where: { id: params.id }, include: { items: true, payments: true } });
  if (!b) notFound();
  const paid = b.payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  const confirmed = b.status === "confirmed" || b.status === "completed";

  const head = (
    <>
      <CheckCircle2 className={`mx-auto h-12 w-12 ${confirmed ? "text-gold-soft" : "text-ivory/60"}`} />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-soft">{confirmed ? "Mubarak ho!" : "Booking"}</p>
      <h1 className="mt-2 text-3xl text-ivory md:text-5xl">{confirmed ? "Your booking is confirmed" : `Booking ${b.status}`}</h1>
      <OrnamentDivider light className="mt-5" />
      <p className="mt-4 text-ivory/80">Booking ID</p>
      <p className="font-display text-3xl tracking-widest text-gold-soft">{b.code}</p>
    </>
  );

  return (
    <div>
      {confirmed ? <FireworksBanner>{head}</FireworksBanner> : <section className="bg-maroon-dark py-16 text-center"><div className="container">{head}</div></section>}
      <div className="container max-w-3xl py-12">
        <div className="rounded-[6px] border border-line bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl">{b.eventName}</h2>
              <p className="text-ink-muted">{prettyDate(b.eventDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{b.guests ? ` · ${b.guests} guests` : ""}</p>
            </div>
            <StatusBadge status={b.status} />
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {b.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="eyebrow mr-2 !text-[10px]">{i.type}</span>
                  {i.label}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={i.status} />
                  <span className="font-semibold">{formatPKR(i.price)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-1 text-sm sm:ml-auto sm:max-w-xs">
            <div className="flex justify-between"><span>Total</span><span className="font-bold">{formatPKR(b.totalAmount)}</span></div>
            <div className="flex justify-between text-emerald-700"><span>Advance paid</span><span className="font-bold">{formatPKR(paid)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Balance due to vendors</span><span>{formatPKR(b.totalAmount - paid)}</span></div>
          </div>
          <p className="mt-6 rounded-[5px] bg-cream p-3 text-sm text-ink-muted">
            Each hall and vendor will now confirm your request from their dashboard. Your dates are locked and no one else can book them.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/bookings">Go to my bookings</Link></Button>
          <Button asChild variant="outline"><Link href="/planner">Open the wedding planner</Link></Button>
        </div>
      </div>
    </div>
  );
}
