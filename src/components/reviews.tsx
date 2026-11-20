import { Star } from "lucide-react";
import type { Review } from "@/lib/demo/types";

export function Reviews({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-display text-4xl text-maroon">{avg.toFixed(1)}</span>
        <div>
          <Stars n={Math.round(avg)} />
          <p className="text-xs text-ink-muted">{reviews.length} verified reviews</p>
        </div>
      </div>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-[6px] border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink">{r.authorName}</p>
              <Stars n={r.rating} />
            </div>
            <p className="mt-2 text-sm text-ink-muted">“{r.comment}”</p>
            <p className="mt-2 text-xs text-ink-muted/80">
              {new Date(r.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              {r.bookingId && " · Booked on Rasm"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="flex" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-gold text-gold" : "text-line"}`} />
      ))}
    </span>
  );
}
