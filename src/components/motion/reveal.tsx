"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fades in and slides up gently as it scrolls into view. It starts animating slightly
 * before the element enters the screen and finishes fast, so a quick scroll never shows
 * empty space. Static for reduced-motion users.
 */
export function Reveal({ children, delay = 0, className, y = 16 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px 160px 0px" }}
      transition={{ duration: 0.45, delay: Math.min(delay, 0.15), ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
