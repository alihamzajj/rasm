import { Check, X, Phone } from "lucide-react";
import { getBusiness, getBusinessItems } from "@/lib/business";
import { respondToItemAction } from "@/app/actions";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR, prettyDate } from "@/lib/utils";

export const metadata = { title: "Booking requests" };

export default async function RequestsPage() {
  const biz = (await getBusiness())!;
  const items = await getBusinessItems(biz.listings);
  const open = items.filter((i) => i.status === "requested" && i.booking.status === "confirmed");
  const history = items.filter((i) => !(i.status === "requested" && i.booking.status === "confirmed")).reverse();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl">New requests <span className="font-sans text-base text-ink-muted">({open.length})</span></h2>
        <p className="mt-1 text-sm text-ink-muted">The customer has already paid the advance and the date is locked for you. Accept to confirm, or decline to free the date and refund the customer&apos;s advance for your part.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {open.length === 0 && <p className="rounded-[6px] border border-dashed border-line bg-white p-6 text-sm text-ink-muted md:col-span-2">You&apos;re all caught up.</p>}
          {open.map((i) => (
            <article key={i.id} className="rounded-[6px] border border-gold/50 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{i.booking.code}</p>
                  <h3 className="mt-1 text-lg">{i.booking.eventName}</h3>
                  <p className="text-sm text-ink-muted">{prettyDate(i.booking.eventDate)}{i.booking.guests ? ` · ${i.booking.guests} guests` : ""}</p>
                </div>
                <StatusBadge status={i.status} />
              </div>
              <p className="mt-3 text-sm">{i.label.split(" · ")[1]}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted"><Phone className="h-3.5 w-3.5" /> {i.booking.customer.name} · {i.booking.customer.phone}</p>
              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-sm text-ink-muted">Advance paid {formatPKR(i.advance)}</span>
                <span className="font-display text-xl text-maroon">{formatPKR(i.price)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <form action={respondToItemAction} className="flex-1">
                  <input type="hidden" name="itemId" value={i.id} />
                  <input type="hidden" name="decision" value="accept" />
                  <Button className="w-full" size="sm"><Check /> Accept</Button>
                </form>
                <form action={respondToItemAction} className="flex-1">
                  <input type="hidden" name="itemId" value={i.id} />
                  <input type="hidden" name="decision" value="decline" />
                  <Button className="w-full" size="sm" variant="outline"><X /> Decline</Button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl">History</h2>
        <div className="mt-4 overflow-x-auto rounded-[6px] border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-wider text-ink-muted">
              <tr><th className="p-3">Booking</th><th className="p-3">Event date</th><th className="p-3">Customer</th><th className="p-3">Package</th><th className="p-3">Status</th><th className="p-3 text-right">Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.map((i) => (
                <tr key={i.id}>
                  <td className="p-3 font-bold text-maroon">{i.booking.code}</td>
                  <td className="p-3">{prettyDate(i.booking.eventDate, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="p-3">{i.booking.customer.name}</td>
                  <td className="p-3 text-ink-muted">{i.label.split(" · ")[1]}</td>
                  <td className="p-3"><StatusBadge status={i.booking.status === "cancelled" ? "cancelled" : i.booking.status === "completed" ? "completed" : i.status} /></td>
                  <td className="p-3 text-right font-semibold">{formatPKR(i.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
