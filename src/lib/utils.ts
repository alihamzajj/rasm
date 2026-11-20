import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

/** Compact PKR, e.g. Rs 1.2M / Rs 450k */
export function formatPKRShort(n: number) {
  if (n >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1000) return `Rs ${Math.round(n / 1000)}k`;
  return `Rs ${n}`;
}

/** Local calendar day as YYYY-MM-DD */
export function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function prettyDate(key: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) {
  if (!key) return "";
  return fromDateKey(key).toLocaleDateString("en-GB", opts);
}

export function parseJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
