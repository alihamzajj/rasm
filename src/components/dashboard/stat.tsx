import type { LucideIcon } from "lucide-react";

export function Stat({ label, value, note, icon: Icon }: { label: string; value: string; note?: string; icon: LucideIcon }) {
  return (
    <div className="rounded-[6px] border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="label !mb-0">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 font-display text-2xl text-maroon md:text-3xl">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}
    </div>
  );
}
