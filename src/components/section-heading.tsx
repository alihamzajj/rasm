import { OrnamentDivider } from "./motion/ornament-divider";
import { Reveal } from "./motion/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, sub, className, light }: { eyebrow?: string; title: string; sub?: string; className?: string; light?: boolean }) {
  return (
    <Reveal className={cn("mb-10 md:mb-12", className)}>
      {eyebrow && <p className={cn("eyebrow text-center", light && "text-gold-soft")}>{eyebrow}</p>}
      <h2 className={cn("section-title mt-2", light && "text-ivory")}>{title}</h2>
      <OrnamentDivider className="mt-4" light={light} />
      {sub && <p className={cn("section-sub", light && "text-ivory/80")}>{sub}</p>}
    </Reveal>
  );
}
