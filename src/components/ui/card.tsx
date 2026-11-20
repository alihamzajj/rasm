import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("rounded-[6px] border border-line bg-white/80 text-ink", className)} {...p} />
));
Card.displayName = "Card";
export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...p} />
);
export const CardTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-display text-lg font-semibold text-maroon", className)} {...p} />
);
export const CardDescription = ({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-ink-muted", className)} {...p} />
);
export const CardContent = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0", className)} {...p} />
);
