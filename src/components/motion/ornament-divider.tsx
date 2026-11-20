"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// (cast: framer-motion's TS types for SVG pathLength are stricter than its runtime)
const DRAW = { hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } } as unknown as Variants;

/** Thin gold line with a small ornament in the middle; the lines draw themselves on scroll. */
export function OrnamentDivider({ className, light = false }: { className?: string; light?: boolean }) {
  const reduce = useReducedMotion();
  const color = light ? "#E9C77B" : "#B8862F";
  const line = (d: string) =>
    reduce ? (
      <path d={d} stroke={color} strokeWidth="1" fill="none" />
    ) : (
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="1"
        fill="none"
        variants={DRAW}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    );
  return (
    <div className={cn("flex justify-center", className)} aria-hidden>
      <svg viewBox="0 0 320 24" className="h-6 w-64 md:w-80">
        {line("M146 12 H8")}
        {line("M174 12 H312")}
        <circle cx="4" cy="12" r="1.6" fill={color} />
        <circle cx="316" cy="12" r="1.6" fill={color} />
        <g fill="none" stroke={color} strokeWidth="1.1">
          <path d="M160 3 L168 12 L160 21 L152 12 Z" />
          <path d="M160 7 L164 12 L160 17 L156 12 Z" fill={color} />
          <path d="M146 12 q4 -5 8 0 q-4 5 -8 0Z" />
          <path d="M174 12 q-4 -5 -8 0 q4 5 8 0Z" />
        </g>
      </svg>
    </div>
  );
}
