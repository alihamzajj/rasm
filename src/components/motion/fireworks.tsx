"use client";
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFireworksPreset } from "@tsparticles/preset-fireworks";
import type { ISourceOptions } from "@tsparticles/engine";
import { useReducedMotion } from "framer-motion";

let enginePromise: Promise<void> | null = null;
const GOLD_MAROON = ["#E9C77B", "#B8862F", "#F6E3B4", "#C2415B", "#9E2A44"];

/**
 * A short tsParticles fireworks burst (fireworks preset) in gold and maroon tones,
 * contained in its parent (parent needs `relative` + a size). Re-plays when `burstKey` changes.
 */
export function Fireworks({ burstKey = 0, duration = 5500, background = "#3A0F1B" }: { burstKey?: number; duration?: number; background?: string }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!enginePromise)
      enginePromise = initParticlesEngine(async (engine) => {
        await loadFireworksPreset(engine);
      });
    enginePromise.then(() => setReady(true));
  }, []);

  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(t);
  }, [burstKey, duration]);

  const options = useMemo<ISourceOptions>(
    () => ({
      preset: "fireworks",
      fullScreen: { enable: false },
      background: { color: background },
      sounds: { enable: false },
      emitters: {
        direction: "top",
        life: { count: 0, duration: 0.1, delay: 0.1 },
        rate: { delay: 0.3, quantity: 1 },
        size: { width: 80, height: 0 },
        position: { y: 100, x: 50 },
      },
      particles: {
        move: { trail: { enable: true, length: 10, fill: { color: background } } },
        stroke: { color: { value: "#F6E3B4" }, width: 1 },
        destroy: {
          split: {
            particles: GOLD_MAROON.map((c) => ({
              color: { value: c },
              stroke: { width: 0 },
              number: { value: 0 },
              opacity: { value: { min: 0.1, max: 1 }, animation: { enable: true, speed: 0.7, sync: false, startValue: "max", destroy: "min" } },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 2.5 }, animation: { enable: true, speed: 5, count: 1, sync: false, startValue: "min", destroy: "none" } },
              life: { count: 1, duration: { value: { min: 1, max: 2 } } },
              move: {
                decay: { min: 0.075, max: 0.1 },
                enable: true,
                gravity: { enable: true, inverse: false, acceleration: 5 },
                speed: { min: 5, max: 15 },
                direction: "none",
                outModes: "destroy",
              },
            })),
          },
        },
      },
    }) as ISourceOptions,
    [background]
  );

  if (reduce || !ready) return null;
  return (
    <div className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`} aria-hidden>
      {active && <Particles key={burstKey} id={`fw-${burstKey}`} options={options} className="absolute inset-0 [&>canvas]:!h-full [&>canvas]:!w-full" />}
    </div>
  );
}
