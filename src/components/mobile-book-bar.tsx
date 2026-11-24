"use client";
import { CalendarCheck } from "lucide-react";

/** Phones only: a sticky bar that jumps to the booking box at the bottom of a detail page. */
export function MobileBookBar({ price, note, cta = "Check dates" }: { price: string; note: string; cta?: string }) {
  return (
    <>
      <div className="h-20 lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 backdrop-blur lg:hidden">
        <div className="container flex items-center justify-between gap-3 py-3">
          <div>
            <p className="font-display text-lg leading-tight text-maroon">{price}</p>
            <p className="text-xs text-ink-muted">{note}</p>
          </div>
          <a href="#book" className="inline-flex items-center gap-1.5 rounded-[5px] bg-maroon px-5 py-3 text-sm font-bold text-ivory hover:bg-maroon-dark">
            <CalendarCheck className="h-4 w-4" /> {cta}
          </a>
        </div>
      </div>
    </>
  );
}
