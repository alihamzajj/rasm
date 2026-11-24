"use client";
import { useTitle } from "@/lib/use-title";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { MapPin, Star, ChevronLeft } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { packagesFor, reviewsFor } from "@/lib/demo/selectors";
import { unavailableDates } from "@/lib/demo/engine";
import { categoryByKey } from "@/lib/constants";
import { Gallery } from "@/components/gallery";
import { MobileBookBar } from "@/components/mobile-book-bar";
import { VendorAdder } from "@/components/vendor-adder";
import { Reviews } from "@/components/reviews";
import { Badge } from "@/components/ui/badge";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Reveal } from "@/components/motion/reveal";
import { formatPKR } from "@/lib/utils";

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const db = useDemo((s) => s.db);
  const vendor = db.vendors.find((x) => x.id === id);
  useTitle(db.vendors.find((x) => x.id === id)?.businessName);
  if (!vendor || vendor.approved !== "approved") notFound();
  const v = { ...vendor, packages: packagesFor(db, "vendor", vendor.id) };
  const reviews = reviewsFor(db, "vendor", v.id);
  const unavailable = unavailableDates(db, { vendorId: v.id });
  const photos = v.photos;
  const cat = categoryByKey(v.category)!;
  const searchParams = { date: sp.get("date") ?? undefined };

  return (
    <div className="container py-8 md:py-10">
      <Link href={`/vendors/${cat.slug}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-maroon">
        <ChevronLeft className="h-4 w-4" /> All {cat.plural.toLowerCase()}
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Gallery photos={photos} alt={v.businessName} />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="gold">{cat.label}</Badge>
            <span className="flex items-center gap-1 text-sm font-bold text-gold-text"><Star className="h-4 w-4 fill-gold text-gold" /> {v.rating.toFixed(1)} · {reviews.length} reviews</span>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl">{v.businessName}</h1>
          <p className="mt-1 flex items-center gap-1 text-ink-muted"><MapPin className="h-4 w-4" /> {v.city} · travels across Pakistan</p>
          <p className="mt-5 leading-relaxed text-ink-muted">{v.description}</p>

          <Reveal className="mt-10">
            <h2 className="text-2xl">Packages</h2>
            <OrnamentDivider className="!justify-start mt-2" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {v.packages.map((p, i) => (
                <div key={p.id} className={`rounded-[6px] border p-5 ${i === 1 ? "border-gold bg-cream" : "border-line bg-white"}`}>
                  {i === 1 && <Badge variant="gold" className="mb-2">Popular</Badge>}
                  <h3 className="text-lg">{p.name}</h3>
                  <p className="mt-1 font-display text-2xl text-maroon">{formatPKR(p.price)}</p>
                  <p className="mt-2 text-sm text-ink-muted">{p.description}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="text-2xl">Reviews</h2>
            <OrnamentDivider className="!justify-start mt-2" />
            <div className="mt-4"><Reviews reviews={reviews} /></div>
          </Reveal>
        </div>
        <aside id="book" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[6px] border border-line bg-white p-5 shadow-[0_20px_40px_-25px_rgba(91,26,43,0.35)]">
            <h2 className="text-xl">Add to your wedding</h2>
            <p className="mb-4 text-xs text-ink-muted">Booked and held dates are crossed out.</p>
            <VendorAdder
              vendor={{ id: v.id, businessName: v.businessName, category: v.category, city: v.city, photo: photos[0] ?? "" }}
              packages={v.packages.map((p) => ({ id: p.id, name: p.name, description: p.description, price: p.price }))}
              unavailable={unavailable}
              initialDate={searchParams.date}
            />
          </div>
        </aside>
      </div>
      <MobileBookBar price={`from ${formatPKR(v.packages[0]?.price ?? 0)}`} note={`${v.packages.length} packages · ${cat.label}`} cta="Add to package" />
    </div>
  );
}
