import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", {
  variants: {
    variant: {
      default: "bg-maroon text-ivory",
      gold: "bg-gold-soft/40 text-gold-text border border-gold/30",
      outline: "border border-line text-ink-muted bg-white/70",
      success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
      warning: "bg-amber-50 text-amber-800 border border-amber-200",
      danger: "bg-rose-50 text-rose-800 border border-rose-200",
      muted: "bg-stone-100 text-stone-600 border border-stone-200",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...p} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
    confirmed: "success", accepted: "success", approved: "success", paid: "success",
    pending: "warning", requested: "warning", held: "warning",
    completed: "muted", refunded: "muted",
    cancelled: "danger", declined: "danger", rejected: "danger", failed: "danger",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}
