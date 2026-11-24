"use client";
import { useTitle } from "@/lib/use-title";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { MapPin, Users, Star, Check, ChevronLeft } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { packagesFor, reviewsFor } from "@/lib/demo/selectors";
import { unavailableDates } from "@/lib/demo/engine";
import { Gallery } from "@/components/gallery";
import { MobileBookBar } from "@/components/mobile-book-bar";
import { HallBooker } from "@/components/hall-booker";
import { Reviews } from "@/components/reviews";
import { Badge } from "@/components/ui/badge";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Reveal } from "@/components/motion/reveal";
import { formatPKR } from "@/lib/utils";

export default function HallDetail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const db = useDemo((s) => s.db);
  const hall = db.halls.find((h) => h.id === id);
  useTitle(db.halls.find((h) => h.id === id)?.name);
  if (!hall || hall.approved !== "approved") notFound();
  const packages = packagesFor(db, "hall", hall.id);
  const reviews = reviewsFor(db, "hall", hall.id);
  const unavailable = unavailableDates(db, { hallId: hall.id });
  const searchParams = { date: sp.get("date") ?? undefined };
  const raw = { packages };

  return (
    <div className="container py-8 md:py-10">
      <Link href="/halls" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-maroon">
        <ChevronLeft className="h-4 w-4" /> All halls
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Gallery photos={hall.photos} alt={hall.name} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="gold">{hall.type}</Badge>
            <span className="flex items-center gap-1 text-sm font-bold text-gold-text"><Star className="h-4 w-4 fill-gold text-gold" /> {hall.rating.toFixed(1)} · {reviews.length} reviews</span>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl">{hall.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-ink-muted"><MapPin className="h-4 w-4" /> {hall.area}, {hall.city}</p>

          <div className="mt-6 grid grid-cols-3 divide-x divide-line rounded-[6px] border border-line bg-white text-center">
            <div className="p-4">
              <p className="label !mb-1">Capacity</p>
              <p className="flex items-center justify-center gap-1 font-display text-lg text-maroon"><Users className="h-4 w-4 text-gold" /> {hall.capacityMin}–{hall.capacityMax}</p>
            </div>
            <div className="p-4">
              <p className="label !mb-1">Per head</p>
              <p className="font-display text-lg text-maroon">from {formatPKR(hall.pricePerHead)}</p>
            </div>
            <div className="p-4">
              <p className="label !mb-1">Per event</p>
              <p className="font-display text-lg text-maroon">{formatPKR(hall.basePrice)}</p>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-ink-muted">{hall.description}</p>

          <Reveal className="mt-10">
            <h2 className="text-2xl">Amenities</h2>
            <OrnamentDivider className="!justify-start mt-2" />
            <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {hall.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold text-gold"><Check className="h-3.5 w-3.5" /></span>{a}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="text-2xl">Menu packages</h2>
            <OrnamentDivider className="!justify-start mt-2" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {raw.packages.map((p, i) => (
                <div key={p.id} className={`rounded-[6px] border p-5 ${i === 1 ? "border-gold bg-cream" : "border-line bg-white"}`}>
                  {i === 1 && <Badge variant="gold" className="mb-2">Most booked</Badge>}
                  <h3 className="text-lg">{p.name}</h3>
                  <p className="mt-1 font-display text-2xl text-maroon">{formatPKR(p.price)}<span className="font-sans text-xs text-ink-muted"> /head</span></p>
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
            <h2 className="text-xl">Check availability</h2>
            <p className="mb-4 text-xs text-ink-muted">Booked and held dates are crossed out.</p>
            <HallBooker
              hall={{ id: hall.id, name: hall.name, city: hall.city, photo: hall.photos[0] ?? "", basePrice: hall.basePrice, capacityMin: hall.capacityMin, capacityMax: hall.capacityMax }}
              packages={raw.packages.map((p) => ({ id: p.id, name: p.name, description: p.description, price: p.price }))}
              unavailable={unavailable}
              initialDate={searchParams.date}
            />
          </div>
        </aside>
      </div>
      <MobileBookBar price={`from ${formatPKR(hall.pricePerHead)}/head`} note={`+ ${formatPKR(hall.basePrice)} hall fee · ${hall.capacityMin}–${hall.capacityMax} guests`} />
    </div>
  );
}
