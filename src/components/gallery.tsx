"use client";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!photos.length) return <div className="aspect-[16/9] rounded-[6px] bg-cream" />;
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-line bg-cream md:aspect-[16/9]">
        <AnimatePresence mode="wait">
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <Image src={photos[i]} alt={`${alt} — photo ${i + 1}`} fill priority={i === 0} sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-3 right-3 rounded-[4px] bg-maroon-dark/80 px-2 py-1 text-xs font-bold text-ivory">
          {i + 1} / {photos.length}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {photos.map((p, k) => (
          <button
            key={p + k}
            onClick={() => setI(k)}
            className={cn("relative aspect-square overflow-hidden rounded-[4px] border-2 transition", k === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100")}
            aria-label={`Show photo ${k + 1}`}
          >
            <Image src={p} alt="" fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
