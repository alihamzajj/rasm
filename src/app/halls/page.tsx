import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import { CITIES, HALL_TYPES } from "@/lib/constants";
import { reviewCounts, toHallView, unavailableIdsOn } from "@/lib/queries";
import { HallCard } from "@/components/hall-card";
import { Reveal } from "@/components/motion/reveal";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Button } from "@/components/ui/button";
import { prettyDate, toDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wedding halls" };

type SP = { city?: string; date?: string; guests?: string; type?: string; min?: string; max?: string; sort?: string };

export default async function HallsPage({ searchParams }: { searchParams: SP }) {
  const { city = "", date = "", guests = "", type = "", min = "", max = "", sort = "rating" } = searchParams;

  const where: Prisma.HallWhereInput = { approved: "approved" };
  if (city) where.city = city;
  if (type) where.type = type;
  if (guests) where.capacityMax = { gte: Number(guests) };
  if (min || max) where.pricePerHead = { ...(min ? { gte: Number(min) } : {}), ...(max ? { lte: Number(max) } : {}) };

  const orderBy: Prisma.HallOrderByWithRelationInput =
    sort === "price_asc" ? { pricePerHead: "asc" } : sort === "price_desc" ? { pricePerHead: "desc" } : sort === "capacity" ? { capacityMax: "desc" } : { rating: "desc" };

  const [halls, counts, unavailable] = await Promise.all([
    prisma.hall.findMany({ where, orderBy }),
    reviewCounts("hall"),
    date ? unavailableIdsOn(date) : Promise.resolve(null),
  ]);

  const visible = unavailable ? halls.filter((h) => !unavailable.halls.has(h.id)) : halls;
  const hiddenCount = halls.length - visible.length;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div>
      <section className="border-b border-line bg-cream py-10 md:py-14">
        <div className="container text-center">
          <p className="eyebrow">Banquets · Marquees · Lawns</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Wedding halls{city ? ` in ${city}` : ""}</h1>
          <OrnamentDivider className="mt-4" />
          {date && <p className="mt-3 text-sm text-ink-muted">Showing halls free on <b className="text-maroon">{prettyDate(date)}</b></p>}
        </div>
      </section>

      <div className="container grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        {/* filters */}
        <aside>
          <form className="sticky top-24 space-y-4 rounded-[6px] border border-line bg-white p-5" method="get">
            <p className="flex items-center gap-2 font-display text-lg text-maroon">
              <SlidersHorizontal className="h-4 w-4 text-gold" /> Filters
            </p>
            <div>
              <label className="label" htmlFor="city">City</label>
              <select id="city" name="city" defaultValue={city} className="field">
                <option value="">All cities</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="date">Event date</label>
              <input id="date" name="date" type="date" min={toDateKey(tomorrow)} defaultValue={date} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="guests">Guests (capacity)</label>
              <input id="guests" name="guests" type="number" min={0} step={50} defaultValue={guests} placeholder="e.g. 500" className="field" />
            </div>
            <div>
              <span className="label">Price per head (Rs)</span>
              <div className="flex gap-2">
                <input name="min" type="number" step={100} defaultValue={min} placeholder="Min" className="field" aria-label="Minimum price per head" />
                <input name="max" type="number" step={100} defaultValue={max} placeholder="Max" className="field" aria-label="Maximum price per head" />
              </div>
            </div>
            <fieldset>
              <legend className="label">Type</legend>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="" defaultChecked={!type} className="peer sr-only" />
                  <span className="inline-block rounded-[4px] border border-line px-3 py-1.5 text-sm peer-checked:border-maroon peer-checked:bg-maroon peer-checked:text-ivory">Any</span>
                </label>
                {HALL_TYPES.map((t) => (
                  <label key={t.value} className="cursor-pointer">
                    <input type="radio" name="type" value={t.value} defaultChecked={type === t.value} className="peer sr-only" />
                    <span className="inline-block rounded-[4px] border border-line px-3 py-1.5 text-sm peer-checked:border-maroon peer-checked:bg-maroon peer-checked:text-ivory">{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <input type="hidden" name="sort" value={sort} />
            <Button className="w-full">Apply filters</Button>
            <Link href="/halls" className="block text-center text-xs font-bold text-ink-muted hover:text-maroon">Clear all</Link>
          </form>
        </aside>

        {/* results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              <b className="text-maroon">{visible.length}</b> halls found
              {hiddenCount > 0 && <> · {hiddenCount} already booked on this date</>}
            </p>
            <form method="get" className="flex items-center gap-2">
              {Object.entries({ city, date, guests, type, min, max }).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
              <label htmlFor="sort" className="text-xs font-bold uppercase tracking-wider text-ink-muted">Sort</label>
              <select id="sort" name="sort" defaultValue={sort} className="field h-9 w-auto py-0 text-sm">
                <option value="rating">Top rated</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="capacity">Largest capacity</option>
              </select>
              <Button size="sm" variant="outline">Sort</Button>
            </form>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-line bg-white p-12 text-center">
              <p className="font-display text-xl text-maroon">No halls match these filters</p>
              <p className="mt-2 text-sm text-ink-muted">Try another date, a smaller guest count or a different city.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((h, i) => (
                <Reveal key={h.id} delay={(i % 3) * 0.06}>
                  <HallCard hall={toHallView(h, counts.get(h.id) ?? 0)} availableOn={date || null} dateQuery={date} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
