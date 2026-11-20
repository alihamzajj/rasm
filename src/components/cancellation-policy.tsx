import { ShieldCheck } from "lucide-react";
import { CANCELLATION_POLICY } from "@/lib/constants";

export function CancellationPolicy({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-[6px] border border-gold/40 bg-cream p-4 md:p-5">
      <p className="flex items-center gap-2 font-display text-lg text-maroon">
        <ShieldCheck className="h-5 w-5 text-gold" /> Cancellation policy
      </p>
      <ul className={`mt-3 space-y-1.5 text-ink-muted ${compact ? "text-xs" : "text-sm"}`}>
        {CANCELLATION_POLICY.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-gold" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
