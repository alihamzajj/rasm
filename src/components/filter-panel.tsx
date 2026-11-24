"use client";
import { useState, type ReactNode } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Filters sidebar. On phones and tablets it folds into a "Filters" button so the results
 * show first; on large screens it is always open.
 */
export function FilterPanel({ children, active = 0 }: { children: ReactNode; active?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <aside>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-[6px] border border-line bg-white px-4 py-3 text-left lg:hidden"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-display text-lg text-maroon">
          <SlidersHorizontal className="h-4 w-4 text-gold" /> Filters
          {active > 0 && <span className="rounded-full bg-maroon px-2 py-0.5 font-sans text-[11px] font-bold text-ivory">{active}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-maroon transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("mt-2 lg:mt-0 lg:block", open ? "block" : "hidden")}>{children}</div>
    </aside>
  );
}
