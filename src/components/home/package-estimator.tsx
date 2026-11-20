"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { formatPKR, cn } from "@/lib/utils";
import { useCart, cartTotals } from "@/store/cart";

type Service = { key: string; label: string; from: number };

export function PackageEstimator({ services, hallPerHead, hallBase }: { services: Service[]; hallPerHead: number; hallBase: number }) {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [guests, setGuests] = useState(400);
  const [picked, setPicked] = useState<string[]>(["photographer", "decorator", "caterer"]);
  useEffect(() => setMounted(true), []);

  const hallLine = hallBase + hallPerHead * guests;
  const lines = services.filter((s) => picked.includes(s.key));
  const total = hallLine + lines.reduce((a, s) => a + s.from, 0);
  const advance = Math.round(total * 0.25);

  const hasCart = mounted && (cart.hall || cart.vendors.length > 0);
  const real = cartTotals(cart);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[6px] border border-line bg-white p-5 md:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label !mb-0">Guests</p>
            <p className="font-display text-3xl text-maroon">{guests}</p>
          </div>
          <p className="text-right text-xs text-ink-muted">Average hall in our listings:<br />{formatPKR(hallPerHead)}/head + {formatPKR(hallBase)}</p>
        </div>
        <input
          type="range"
          min={100}
          max={1500}
          step={50}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-3 w-full accent-maroon"
          aria-label="Guest count"
        />
        <p className="label mt-6">Add services</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {services.map((s) => {
            const on = picked.includes(s.key);
            return (
              <button
                type="button"
                key={s.key}
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.key) : [...p, s.key]))}
                className={cn(
                  "flex min-h-[64px] flex-col items-start justify-between rounded-[5px] border px-3 py-2 text-left text-sm transition",
                  on ? "border-maroon bg-maroon text-ivory" : "border-line bg-ivory text-ink hover:border-gold"
                )}
                aria-pressed={on}
              >
                <span className="flex w-full items-center justify-between font-bold">
                  {s.label} {on && <Check className="h-3.5 w-3.5 text-gold-soft" />}
                </span>
                <span className={cn("text-xs", on ? "text-gold-soft" : "text-ink-muted")}>from {formatPKR(s.from)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col rounded-[6px] border border-gold/40 bg-maroon p-5 text-ivory md:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">Live price summary</p>
        <ul className="mt-4 flex-1 space-y-2 text-sm">
          <li className="flex justify-between gap-3 border-b border-ivory/10 pb-2">
            <span>Marriage hall · {guests} guests</span>
            <span className="font-bold">{formatPKR(hallLine)}</span>
          </li>
          <AnimatePresence initial={false}>
            {lines.map((s) => (
              <motion.li
                key={s.key}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between gap-3 overflow-hidden border-b border-ivory/10 pb-2"
              >
                <span>{s.label}</span>
                <span className="font-bold">{formatPKR(s.from)}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="mt-4 space-y-1 border-t border-gold/40 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ivory/80">Estimated total</span>
            <span className="font-display text-2xl">{formatPKR(total)}</span>
          </div>
          <div className="flex items-baseline justify-between text-gold-soft">
            <span className="text-sm">Advance to book (25%)</span>
            <span className="font-bold">{formatPKR(advance)}</span>
          </div>
        </div>
        {hasCart ? (
          <div className="mt-5 rounded-[5px] bg-ivory/10 p-3 text-sm">
            Your saved package: <b>{(cart.hall ? 1 : 0) + cart.vendors.length} items</b> · {formatPKR(real.total)}
            <Button asChild variant="gold" className="mt-3 w-full">
              <Link href="/packages">
                Open my package <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild variant="gold" className="mt-5 w-full">
            <Link href="/halls">
              Start with a hall <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
