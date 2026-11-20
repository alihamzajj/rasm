import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Rasm home">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="#B8862F" strokeWidth="1" />
        <path d="M20 7 C27 13 29 20 20 31 C11 20 13 13 20 7Z" fill={light ? "#E9C77B" : "#5B1A2B"} />
        <path d="M20 13 C23.5 16.5 24 20 20 26 C16 20 16.5 16.5 20 13Z" fill={light ? "#3A0F1B" : "#E9C77B"} />
        <path d="M9 30 Q20 35 31 30" stroke="#B8862F" strokeWidth="1.2" fill="none" />
      </svg>
      <span className={cn("font-display text-2xl font-semibold tracking-wide", light ? "text-ivory" : "text-maroon")}>Rasm</span>
    </Link>
  );
}
