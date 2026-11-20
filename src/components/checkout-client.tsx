"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Timer, CreditCard, Smartphone, Loader2, Lock, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/store/cart";
import { formatPKR, prettyDate, cn } from "@/lib/utils";
import { useDemo, useCustomerId } from "@/lib/demo/store";
import { startCheckout, confirmPayment, cancelHold, SlotConflictError } from "@/lib/demo/engine";

type B = { id: string; code: string; eventName: string; eventDate: string; guests: number; total: number; advance: number; items: { id: string; label: string; price: number; type: string }[] };

export function CheckoutClient({ booking, heldUntil, policy }: { booking: B; heldUntil: string | null; policy: ReactNode }) {
  const router = useRouter();
  const cart = useCart();
  const [left, setLeft] = useState<number>(() => (heldUntil ? new Date(heldUntil).getTime() - Date.now() : 0));
  const [method, setMethod] = useState<"card" | "jazzcash" | "easypaisa">("card");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const customerId = useCustomerId();
  const apply = useDemo((s) => s.apply);

  useEffect(() => {
    if (!heldUntil) return;
    const end = new Date(heldUntil).getTime();
    const t = setInterval(() => setLeft(end - Date.now()), 250);
    return () => clearInterval(t);
  }, [heldUntil]);

  const expired = !heldUntil || left <= 0;
  const mm = String(Math.max(0, Math.floor(left / 60000))).padStart(2, "0");
  const ss = String(Math.max(0, Math.floor((left % 60000) / 1000))).padStart(2, "0");
  const pct = Math.max(0, Math.min(100, (left / (15 * 60000)) * 100));

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 900)); // simulate the gateway
      try {
        const next = confirmPayment(useDemo.getState().db, booking.id, customerId, method);
        cart.clear();
        router.push(`/booking/${booking.id}?new=1`);
        useDemo.setState({ db: next });
      } catch (e) {
        setError(e instanceof SlotConflictError ? `Sorry — ${e.labels.join(", ")} was booked by someone else after your hold ran out. Nothing was charged.` : (e as Error).message);
      }
    });
  };

  const holdAgain = () => {
    setError(null);
    startTransition(() => {
      const lines = cart.hall || cart.vendors.length
        ? [
            ...(cart.hall ? [{ type: "hall" as const, refId: cart.hall.hallId, packageId: cart.hall.packageId }] : []),
            ...cart.vendors.map((v) => ({ type: "vendor" as const, refId: v.vendorId, packageId: v.packageId })),
          ]
        : [];
      if (!lines.length) return router.push("/packages");
      try {
        const released = cancelHold(useDemo.getState().db, booking.id);
        const { db, result } = startCheckout(released, { customerId, eventName: cart.eventName, eventDate: cart.eventDate, guests: cart.hall ? cart.guests : 0, lines });
        cart.setPending(result);
        router.replace(`/checkout?b=${result.bookingId}`);
        useDemo.setState({ db });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const leave = () => {
    startTransition(() => {
      apply((db) => cancelHold(db, booking.id));
      cart.setPending(null);
      router.push("/packages");
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* countdown */}
        <div className={cn("overflow-hidden rounded-[6px] border p-5", expired ? "border-rose-200 bg-rose-50" : "border-gold/50 bg-cream")}>
          <div className="flex items-center gap-4">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full border", expired ? "border-rose-300 text-rose-700" : "border-gold bg-white text-maroon")}>
              <Timer className="h-6 w-6" />
            </span>
            <div className="flex-1">
              {expired ? (
                <>
                  <p className="font-display text-lg text-rose-800">Your hold has expired</p>
                  <p className="text-sm text-rose-800/80">The dates were released so others can book them. Try holding them again.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-lg text-maroon">Your date is held for you</p>
                  <p className="text-sm text-ink-muted">Complete payment before the timer runs out to lock every date.</p>
                </>
              )}
            </div>
            {!expired && <p className="font-display text-3xl tabular-nums text-maroon" aria-live="polite">{mm}:{ss}</p>}
          </div>
          {!expired && <div className="mt-4 h-1 overflow-hidden rounded bg-line"><div className="h-full bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>}
          {expired && (
            <Button className="mt-4" onClick={holdAgain} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />} Hold my dates again
            </Button>
          )}
        </div>

        {/* fake payment form */}
        <form onSubmit={pay} className="rounded-[6px] border border-line bg-white p-5 md:p-6">
          <h2 className="text-xl">Payment method</h2>
          <p className="text-xs text-ink-muted">Prototype only — no real payment is taken. Any values work.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { k: "card", label: "Card", icon: CreditCard },
              { k: "jazzcash", label: "JazzCash", icon: Smartphone },
              { k: "easypaisa", label: "Easypaisa", icon: Smartphone },
            ].map((m) => (
              <button
                type="button"
                key={m.k}
                onClick={() => setMethod(m.k as typeof method)}
                className={cn("flex flex-col items-center gap-1 rounded-[5px] border p-3 text-sm font-bold", method === m.k ? "border-maroon bg-cream text-maroon" : "border-line text-ink-muted hover:border-gold")}
              >
                <m.icon className="h-5 w-5" /> {m.label}
              </button>
            ))}
          </div>
          {method === "card" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label" htmlFor="cn">Name on card</label><input id="cn" className="field" defaultValue="Ayesha Khan" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="num">Card number</label><input id="num" className="field" inputMode="numeric" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" /></div>
              <div><label className="label" htmlFor="exp">Expiry</label><input id="exp" className="field" placeholder="MM/YY" defaultValue="12/29" /></div>
              <div><label className="label" htmlFor="cvc">CVC</label><input id="cvc" className="field" placeholder="123" defaultValue="123" /></div>
            </div>
          ) : (
            <div className="mt-5">
              <label className="label" htmlFor="mob">Mobile account number</label>
              <input id="mob" className="field" placeholder="03XX XXXXXXX" defaultValue="0300 1234567" />
              <p className="mt-1 text-xs text-ink-muted">You would normally approve this on your phone.</p>
            </div>
          )}
          {error && <p className="mt-4 flex gap-2 rounded-[5px] bg-rose-50 p-3 text-sm text-rose-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          <Button size="lg" className="mt-6 w-full" disabled={pending || expired}>
            {pending ? <Loader2 className="animate-spin" /> : <Lock />} Pay advance {formatPKR(booking.advance)}
          </Button>
          <button type="button" onClick={leave} disabled={pending} className="mt-3 w-full text-center text-xs font-bold text-ink-muted hover:text-maroon">
            Cancel and release my dates
          </button>
        </form>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[6px] border border-line bg-white p-5">
          <p className="eyebrow">Booking {booking.code}</p>
          <p className="mt-1 font-display text-xl text-maroon">{booking.eventName}</p>
          <p className="text-sm text-ink-muted">{prettyDate(booking.eventDate)}{booking.guests ? ` · ${booking.guests} guests` : ""}</p>
          <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            {booking.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3"><span className="text-ink-muted">{i.label}</span><span className="shrink-0 font-semibold">{formatPKR(i.price)}</span></li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-line pt-4">
            <div className="flex justify-between"><span>Total</span><span className="font-bold">{formatPKR(booking.total)}</span></div>
            <div className="flex justify-between font-bold text-maroon"><span>Advance now (25%)</span><span>{formatPKR(booking.advance)}</span></div>
            <div className="flex justify-between text-sm text-ink-muted"><span>Balance later</span><span>{formatPKR(booking.total - booking.advance)}</span></div>
          </div>
        </div>
        {policy}
      </aside>
    </div>
  );
}
