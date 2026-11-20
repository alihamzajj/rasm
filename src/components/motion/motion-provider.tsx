"use client";
import { MotionConfig, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** For prefers-reduced-motion users every Framer Motion animation completes instantly. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={reduce ? { duration: 0 } : undefined}>
      {children}
    </MotionConfig>
  );
}
