"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, RefreshCw, Plus, Building2, CalendarDays, Users, Loader2, AlertTriangle, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useCart, cartTotals } from "@/store/cart";
import { CATEGORIES, categoryByKey } from "@/lib/constants";
import { formatPKR, prettyDate, toDateKey } from "@/lib/utils";
import { useDemo, useCustomerId } from "@/lib/demo/store";
import { startCheckout, SlotConflictError } from "@/lib/demo/engine";

export function PackageBuilder({ policy }: { policy: ReactNode }) {
  const router = useRouter();
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const customerId = useCustomerId();
  const [error, setError] = useState<{ msg: string; conflicts?: string[] } | null>(null);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-96 animate-pulse rounded-[6px] bg-cream" />;

  const totals = cartTotals(cart);
  const empty = !cart.hall && cart.vendors.length === 0;
  const missing = CATEGORIES.filter((c) => !cart.vendors.some((v) => v.category === c.key));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkout = () => {
    setError(null);
    startTransition(() => {
      const lines = [
        ...(cart.hall ? [{ type: "hall" as const, refId: cart.hall.hallId, packageId: cart.hall.packageId }] : []),
        ...cart.vendors.map((v) => ({ type: "vendor" as const, refId: v.vendorId, packageId: v.packageId })),
      ];
      try {
        const { db, result } = startCheckout(useDemo.getState().db, { customerId, eventName: cart.eventName, eventDate: cart.eventDate, guests: cart.hall ? cart.guests : 0, lines });
        useDemo.setState({ db });
        cart.setPending(result);
        router.push(`/checkout?b=${result.bookingId}`);
      } catch (e) {
        setError(e instanceof SlotConflictError ? { msg: e.message, conflicts: e.labels } : { msg: (e as Error).message });
      }
    });
  };

  if (empty) {
    return (
      <div className="mx-auto max-w-xl rounded-[6px] border border-dashed border-line bg-white p-10 text-center">
        <Building2 className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-4 font-display text-2xl text-maroon">Your package is empty</p>
        <p className="mt-2 text-sm text-ink-muted">Start with a wedding hall, then add a photographer, decorator, caterer and more to the same booking.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/halls">Find a hall</Link></Button>
          <Button asChild variant="outline"><Link href="/vendors">Browse vendors</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* event details */}
        <div className="grid gap-4 rounded-[6px] border border-line bg-white p-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="ev">Event</label>
            <input id="ev" className="field" value={cart.eventName} onChange={(e) => cart.setEvent({ eventName: e.target.value })} placeholder="e.g. Baraat" />
          </div>
          <div>
            <label className="label flex items-center gap-1" htmlFor="dt"><CalendarDays className="h-3.5 w-3.5" /> Date</label>
            <input id="dt" type="date" className="field" min={toDateKey(tomorrow)} value={cart.eventDate} onChange={(e) => cart.setEvent({ eventDate: e.target.value })} />
          </div>
          <div>
            <label className="label flex items-center gap-1" htmlFor="gs"><Users className="h-3.5 w-3.5" /> Guests</label>
            <input id="gs" type="number" className="field" min={20} step={10} value={cart.guests} onChange={(e) => cart.setEvent({ guests: Number(e.target.value) })} />
          </div>
          <p className="text-xs text-ink-muted sm:col-span-3">Everything in your package is booked for the same date. Availability is checked again when you continue.</p>
        </div>

        {/* hall */}
        <div>
          <h2 className="mb-3 text-xl">Marriage hall</h2>
          {cart.hall ? (
            <LineCard
              photo={cart.hall.photo}
              title={cart.hall.name}
              subtitle={`${cart.hall.packageName} · ${formatPKR(cart.hall.perHead)}/head × ${cart.guests} + ${formatPKR(cart.hall.basePrice)} hall fee`}
              price={totals.hallLine}
              changeHref={`/halls/${cart.hall.hallId}`}
              onRemove={() => cart.setHall(null)}
            />
          ) : (
            <Link href="/halls" className="flex items-center justify-center gap-2 rounded-[6px] border border-dashed border-gold bg-white p-6 text-sm font-bold text-maroon hover:bg-cream">
              <Plus className="h-4 w-4" /> Add a marriage hall
            </Link>
          )}
        </div>

        {/* vendors */}
        <div>
          <h2 className="mb-3 text-xl">Vendors</h2>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {cart.vendors.map((v) => (
                <motion.div key={v.vendorId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <LineCard
                    photo={v.photo}
                    title={v.businessName}
                    tag={categoryByKey(v.category)?.label}
                    subtitle={v.packageName}
                    price={v.price}
                    changeHref={`/vendors/${categoryByKey(v.category)?.slug}`}
                    onRemove={() => cart.removeVendor(v.vendorId)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {missing.length > 0 && (
            <div className="mt-4">
              <p className="label">Add more services</p>
              <div className="flex flex-wrap gap-2">
                {missing.map((c) => (
                  <Link key={c.key} href={`/vendors/${c.slug}${cart.eventDate ? `?date=${cart.eventDate}` : ""}`} className="inline-flex items-center gap-1 rounded-[4px] border border-line bg-white px-3 py-1.5 text-sm text-maroon hover:border-gold">
                    <Plus className="h-3.5 w-3.5" /> {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lg:hidden">{policy}</div>
      </div>

      {/* summary */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[6px] border border-gold/40 bg-maroon p-5 text-ivory">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">Summary</p>
          <p className="mt-2 font-display text-xl">{cart.eventName || "Your event"}</p>
          <p className="text-sm text-ivory/75">{cart.eventDate ? prettyDate(cart.eventDate) : "No date picked yet"}</p>
          <ul className="mt-4 space-y-2 border-t border-ivory/15 pt-4 text-sm">
            {cart.hall && <li className="flex justify-between gap-3"><span className="truncate">{cart.hall.name}</span><span>{formatPKR(totals.hallLine)}</span></li>}
            {cart.vendors.map((v) => (
              <li key={v.vendorId} className="flex justify-between gap-3"><span className="truncate">{v.businessName}</span><span>{formatPKR(v.price)}</span></li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-gold/40 pt-4">
            <div className="flex items-baseline justify-between"><span className="text-sm text-ivory/80">Total</span><span className="font-display text-2xl">{formatPKR(totals.total)}</span></div>
            <div className="flex justify-between font-bold text-gold-soft"><span>Advance due now (25%)</span><span>{formatPKR(totals.advance)}</span></div>
            <div className="flex justify-between text-sm text-ivory/70"><span>Balance, paid to vendors later</span><span>{formatPKR(totals.total - totals.advance)}</span></div>
          </div>
          {error && (
            <div className="mt-4 rounded-[5px] bg-ivory p-3 text-sm text-rose-800">
              <p className="flex items-start gap-2 font-bold"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error.conflicts ? "Some dates were just taken" : error.msg}</p>
              {error.conflicts && <p className="mt-1">{error.conflicts.join(", ")} {error.conflicts.length > 1 ? "are" : "is"} no longer free on this date. Change the date or replace them.</p>}
            </div>
          )}
          <Button variant="gold" size="lg" className="mt-5 w-full" disabled={pending || !cart.eventDate} onClick={checkout}>
            {pending ? <Loader2 className="animate-spin" /> : <Lock />} {cart.eventDate ? "Hold my dates & checkout" : "Pick a date to continue"}
          </Button>
          <p className="mt-2 text-center text-xs text-ivory/65">Your dates are held for 15 minutes while you pay.</p>
        </div>
        <div className="hidden lg:block">{policy}</div>
        <button onClick={() => cart.clear()} className="w-full text-center text-xs font-bold text-ink-muted hover:text-maroon">Clear package</button>
      </aside>
    </div>
  );
}

function LineCard({ photo, title, subtitle, price, tag, changeHref, onRemove }: { photo: string; title: string; subtitle: string; price: number; tag?: string; changeHref: string; onRemove: () => void }) {
  return (
    <div className="flex gap-4 rounded-[6px] border border-line bg-white p-3">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[4px] bg-cream sm:h-24 sm:w-32">
        {photo && <Image src={photo} alt="" fill sizes="128px" className="object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {tag && <p className="eyebrow !text-[10px]">{tag}</p>}
            <p className="truncate font-display text-lg text-maroon">{title}</p>
          </div>
          <p className="shrink-0 font-bold text-maroon">{formatPKR(price)}</p>
        </div>
        <p className="text-xs text-ink-muted">{subtitle}</p>
        <div className="mt-auto flex gap-3 pt-2">
          <Link href={changeHref} className="inline-flex items-center gap-1 text-xs font-bold text-maroon hover:underline"><RefreshCw className="h-3 w-3" /> Change</Link>
          <button onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline"><Trash2 className="h-3 w-3" /> Remove</button>
        </div>
      </div>
    </div>
  );
}
