"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Petal = { left: number; size: number; delay: number; duration: number; drift: number; spin: number; hue: string };
const HUES = ["#C2415B", "#A8324A", "#D9667A", "#E9C77B", "#B8862F"];

/** 14 slow-falling rose petals with soft drift and rotation. Hidden for reduced-motion users. */
export function RosePetals({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [petals, setPetals] = useState<Petal[]>([]);
  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        left: (i / count) * 100 + Math.random() * 6,
        size: 10 + Math.random() * 10,
        delay: Math.random() * 12,
        duration: 13 + Math.random() * 9,
        drift: 30 + Math.random() * 70,
        spin: 180 + Math.random() * 360,
        hue: HUES[i % HUES.length],
      }))
    );
  }, [count]);
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute -top-8"
          style={{ left: `${p.left}%` }}
          initial={{ y: -40, x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: "110vh", x: [0, p.drift, -p.drift / 2, p.drift / 3], rotate: p.spin, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <svg width={p.size} height={p.size * 1.2} viewBox="0 0 20 24">
            <path d="M10 1 C17 5 20 13 14 21 C12 23 8 23 6 21 C0 13 3 5 10 1Z" fill={p.hue} opacity="0.85" />
            <path d="M10 4 C11 10 11 16 10 21" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.8" fill="none" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
