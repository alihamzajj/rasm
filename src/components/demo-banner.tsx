"use client";
import Link from "next/link";
import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { useCart } from "@/store/cart";
import { usePlanner } from "@/store/planner";

/** Thin bar explaining the prototype, with a link to the feature tour and a reset button. */
export function DemoBanner() {
  const reset = useDemo((s) => s.reset);
  const [done, setDone] = useState(false);
  return (
    <div className="bg-maroon-dark text-ivory/90">
      <div className="container flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center text-xs">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-gold-soft" /> Prototype — your clicks only change your own copy. Payments are fake.
        </span>
        <Link href="/features" className="font-bold text-gold-soft underline-offset-2 hover:underline">See all features</Link>
        <button
          onClick={() => {
            reset();
            useCart.getState().clear();
            usePlanner.getState().reset();
            setDone(true);
            setTimeout(() => setDone(false), 2500);
          }}
          className="inline-flex items-center gap-1 font-bold text-gold-soft hover:underline"
        >
          <RotateCcw className="h-3 w-3" /> {done ? "Demo reset ✓" : "Reset demo"}
        </button>
      </div>
    </div>
  );
}
