"use client";
import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Fireworks } from "./motion/fireworks";

/** Dark maroon banner that plays a short fireworks burst on load, with a replay button. */
export function FireworksBanner({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);
  return (
    <section className="relative isolate overflow-hidden bg-maroon-dark py-14 md:py-20">
      <Fireworks burstKey={key} duration={6000} />
      <div className="container relative z-10 text-center">
        {children}
        <button onClick={() => setKey((k) => k + 1)} className="mt-6 inline-flex items-center gap-2 rounded-[5px] border border-gold-soft/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-soft hover:bg-ivory/10">
          <Sparkles className="h-3.5 w-3.5" /> Light the sky again
        </button>
      </div>
    </section>
  );
}
