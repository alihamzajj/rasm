import { cn } from "@/lib/utils";

/** A diya (oil lamp) with a softly pulsing glow. CSS-only; turned off by prefers-reduced-motion. */
export function Diya({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-40 w-40", className)} aria-hidden>
      <div className="absolute left-1/2 top-[8%] h-28 w-28 -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgba(233,199,123,0.8)_0%,rgba(233,199,123,0.25)_45%,transparent_70%)]" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <g className="animate-flicker" style={{ transformOrigin: "60px 62px" }}>
          <path d="M60 30 C68 44 70 54 60 64 C50 54 52 44 60 30Z" fill="#F3B544" />
          <path d="M60 42 C64 50 64 56 60 61 C56 56 56 50 60 42Z" fill="#FFF1C9" />
        </g>
        <path d="M22 66 Q60 64 98 66 Q92 88 60 90 Q28 88 22 66Z" fill="#B8862F" />
        <path d="M22 66 Q60 72 98 66" stroke="#8A6420" strokeWidth="2" fill="none" />
        <path d="M40 78 q5 4 10 0 M55 80 q5 4 10 0 M70 78 q5 4 10 0" stroke="#E9C77B" strokeWidth="1.5" fill="none" />
        <ellipse cx="60" cy="96" rx="20" ry="4" fill="#5B1A2B" opacity="0.15" />
      </svg>
    </div>
  );
}
