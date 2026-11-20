"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/** Plays /public/lottie/mandap.json (an original animation made by scripts/make-lottie.mjs). */
export function MandapLottie({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [data, setData] = useState<object | null>(null);
  useEffect(() => {
    fetch("/lottie/mandap.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);
  if (!data) return <div className={className} />;
  return <Lottie animationData={data} loop={!reduce} autoplay={!reduce} className={className} aria-label="Animated wedding mandap" />;
}
