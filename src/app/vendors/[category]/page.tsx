"use client";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronLeft } from "lucide-react";
import { CATEGORIES, CITIES, categoryBySlug } from "@/lib/constants";
import { useDemo } from "@/lib/demo/store";
import { approvedVendors } from "@/lib/demo/selectors";
import { unavailableIdsOn } from "@/lib/demo/engine";
import { VendorCard } from "@/components/vendor-card";
import { Reveal } from "@/components/motion/reveal";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { FireworksBanner } from "@/components/fireworks-banner";
import { Button } from "@/components/ui/button";
import { prettyDate, toDateKey } from "@/lib/utils";

export default function VendorCategoryPage() {
  const params = useParams<{ category: string }>();
  const sp = useSearchParams();
  const db = useDemo((s) => s.db);
  const cat = categoryBySlug(params.category);
  if (!cat) notFound();
  const get = (k: string) => sp.get(k) ?? "";
  const city = get("city"), date = get("date"), max = get("max"), rating = get("rating");
  const sort = get("sort") || "rating";

  const vendors = approvedVendors(db).filter(
    (v) => v.category === cat.key && (!city || v.city === city) && (!rating || v.rating >= Number(rating)) && (!max || v.minPrice <= Number(max))
  );
  const unavailable = date ? unavailableIdsOn(db, date) : null;
  const visible = unavailable ? vendors.filter((v) => !unavailable.vendors.has(v.id)) : vendors;
  visible.sort((a, b) => (sort === "price_asc" ? a.minPrice - b.minPrice : sort === "price_desc" ? b.minPrice - a.minPrice : b.rating - a.rating));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const heading = (
    <>
      <p className={`eyebrow ${cat.key === "fireworks" ? "!text-gold-soft" : ""}`}>Wedding vendors</p>
      <h1 className={`mt-2 text-3xl md:text-4xl ${cat.key === "fireworks" ? "text-ivory" : ""}`}>{cat.plural}</h1>
      <OrnamentDivider className="mt-4" light={cat.key === "fireworks"} />
      <p className={`mx-auto mt-3 max-w-xl text-sm ${cat.key === "fireworks" ? "text-ivory/80" : "text-ink-muted"}`}>{cat.blurb}</p>
    </>
  );

  return (
    <div>
      {cat.key === "fireworks" ? (
        <FireworksBanner>{heading}</FireworksBanner>
      ) : (
        <section className="border-b border-line bg-cream py-10 text-center md:py-14">
          <div className="container">{heading}</div>
        </section>
      )}

      <div className="container py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link href="/vendors" className="flex shrink-0 items-center gap-1 rounded-[4px] border border-line bg-white px-3 py-1.5 text-sm text-ink-muted hover:border-gold"><ChevronLeft className="h-3.5 w-3.5" /> All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.key} href={`/vendors/${c.slug}`} className={`shrink-0 rounded-[4px] border px-3 py-1.5 text-sm ${c.key === cat.key ? "border-maroon bg-maroon text-ivory" : "border-line bg-white text-ink hover:border-gold"}`}>
              {c.plural}
            </Link>
          ))}
        </div>
      </div>

      <div className="container grid gap-8 pb-16 lg:grid-cols-[260px_1fr]">
        <aside>
          <form key={sp.toString()} method="get" className="sticky top-24 space-y-4 rounded-[6px] border border-line bg-white p-5">
            <p className="flex items-center gap-2 font-display text-lg text-maroon"><SlidersHorizontal className="h-4 w-4 text-gold" /> Filters</p>
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
              <label className="label" htmlFor="max">Starting price up to (Rs)</label>
              <input id="max" name="max" type="number" step={5000} defaultValue={max} placeholder="Any" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="rating">Minimum rating</label>
              <select id="rating" name="rating" defaultValue={rating} className="field">
                <option value="">Any rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sort">Sort</label>
              <select id="sort" name="sort" defaultValue={sort} className="field">
                <option value="rating">Top rated</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
            <Button className="w-full">Apply</Button>
            <Link href={`/vendors/${cat.slug}`} className="block text-center text-xs font-bold text-ink-muted hover:text-maroon">Clear all</Link>
          </form>
        </aside>
        <div>
          <p className="mb-5 text-sm text-ink-muted">
            <b className="text-maroon">{visible.length}</b> {cat.plural.toLowerCase()}
            {date && <> free on <b className="text-maroon">{prettyDate(date)}</b></>}
          </p>
          {visible.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-line bg-white p-12 text-center">
              <p className="font-display text-xl text-maroon">No {cat.plural.toLowerCase()} match</p>
              <p className="mt-2 text-sm text-ink-muted">Try clearing a filter or picking another date.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((v, i) => (
                <Reveal key={v.id} delay={(i % 3) * 0.06}>
                  <VendorCard vendor={v} availableOn={date || null} dateQuery={date} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
