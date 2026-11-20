"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, PackagePlus, BadgeCheck } from "lucide-react";
import { CATEGORIES, unsplash } from "@/lib/constants";
import { useDemo } from "@/lib/demo/store";
import { approvedHalls, approvedVendors, hallCard } from "@/lib/demo/selectors";
import { HallCard } from "@/components/hall-card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { RosePetals } from "@/components/motion/rose-petals";
import { MandapLottie } from "@/components/motion/mandap-lottie";
import { Diya } from "@/components/motion/diya";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { HeroSearch } from "@/components/home/hero-search";
import { PackageEstimator } from "@/components/home/package-estimator";
import { Button } from "@/components/ui/button";

const HERO_PHOTO = unsplash("photo-1587271407850-8d438ca9fdf2", 2000);

const TILES = [
  { href: "/halls", label: "Halls", image: "photo-1519167758481-83f550bb49b3", note: "Banquets, marquees & lawns" },
  ...["photographer", "videographer", "decorator", "fireworks", "caterer"].map((k) => {
    const c = CATEGORIES.find((x) => x.key === k)!;
    return { href: `/vendors/${c.slug}`, label: c.plural, image: c.image, note: c.blurb };
  }),
];

export default function HomePage() {
  const db = useDemo((s) => s.db);
  const all = approvedHalls(db);
  const halls = [...all].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const vendors = approvedVendors(db);
  const services = CATEGORIES.map((c) => {
    const prices = vendors.filter((v) => v.category === c.key).map((v) => v.minPrice).filter(Boolean);
    return { key: c.key, label: c.label, from: prices.length ? Math.min(...prices) : 0 };
  });
  const avg = (k: "pricePerHead" | "basePrice") => (all.length ? all.reduce((a, h) => a + h[k], 0) / all.length : 0);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate flex min-h-[640px] items-center overflow-hidden md:min-h-[720px]">
        <Image src={HERO_PHOTO} alt="Decorated wedding stage with flowers and lights" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-maroon/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-maroon-dark/40 via-transparent to-maroon-dark/60" />
        <RosePetals count={14} />
        <div className="container relative py-20 text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-soft">Shaadi, sorted with grace</p>
            <h1 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight text-ivory sm:text-5xl md:text-6xl">
              Book your wedding hall and every rasm in one booking
            </h1>
            <OrnamentDivider light className="mt-6" />
            <p className="mx-auto mt-5 max-w-2xl text-base text-ivory/85 md:text-lg">
              Marriage halls, photographers, decorators, caterers, fireworks, DJs, makeup and mehndi artists — with real availability and one 25% advance.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <HeroSearch />
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-6 text-sm text-ivory/70">
              {all.length} verified halls · {vendors.length} vendors · Lahore, Karachi and Islamabad ·{" "}
              <Link href="/features" className="font-bold text-gold-soft hover:underline">Take the feature tour →</Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Everything for the big day" title="Browse by service" sub="Start with a hall, then add the people who make the day yours." />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {TILES.map((t, i) => (
              <Reveal key={t.label} delay={i * 0.06}>
                <Link href={t.href} className="group relative block aspect-[3/4] overflow-hidden rounded-[6px] border border-line">
                  <Image src={unsplash(t.image, 600)} alt={t.label} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-maroon-dark/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-ivory">
                    <span className="mx-auto mb-2 block h-px w-8 bg-gold transition-all group-hover:w-14" />
                    <p className="font-display text-lg">{t.label}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ivory/75">{t.note}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/vendors" className="text-sm font-bold text-maroon hover:underline">See all 8 vendor categories →</Link>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED HALLS ---------------- */}
      <section className="section bg-cream">
        <div className="container">
          <SectionHeading eyebrow="Handpicked venues" title="Featured wedding halls" sub="Highest-rated banquets, marquees and lawns this season." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {halls.map((h, i) => (
              <Reveal key={h.id} delay={(i % 3) * 0.08}>
                <HallCard hall={hallCard(db, h)} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/halls">View all halls <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- BUILD YOUR PACKAGE ---------------- */}
      <section className="section relative overflow-hidden">
        <div className="container">
          <div className="relative">
            <Diya className="absolute -left-4 -top-6 hidden h-32 w-32 md:block lg:left-6" />
            <Diya className="absolute -right-4 -top-6 hidden h-32 w-32 md:block lg:right-6" />
            <SectionHeading eyebrow="One booking, one advance" title="Build your package" sub="Pick a guest count and the services you need — see your total and the advance instantly." />
          </div>
          <Reveal>
            <PackageEstimator services={services} hallPerHead={Math.round(avg("pricePerHead"))} hallBase={Math.round(avg("basePrice"))} />
          </Reveal>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section bg-cream">
        <div className="container">
          <SectionHeading eyebrow="Simple as a rishta yes" title="How it works" />
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
            <Reveal className="mx-auto w-full max-w-sm">
              <MandapLottie className="aspect-square w-full" />
            </Reveal>
            <ol className="space-y-5">
              {[
                { icon: Search, title: "Find your hall", text: "Search by city, date and guest count. Only halls free on your date are marked available." },
                { icon: PackagePlus, title: "Add your vendors", text: "Add a photographer, decorator, caterer, fireworks and more. Each vendor's calendar is checked for the same date." },
                { icon: BadgeCheck, title: "Pay 25% and relax", text: "Your dates are held for 15 minutes while you pay the advance. Once paid, every date is locked for you." },
              ].map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1}>
                  <li className="flex gap-5 rounded-[6px] border border-line bg-ivory p-5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold bg-white text-maroon ring-4 ring-gold/10">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="eyebrow">Step {i + 1}</p>
                      <h3 className="mt-1 text-xl">{s.title}</h3>
                      <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="bg-maroon py-16 text-center">
        <div className="container">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-soft">For halls & vendors</p>
          <h2 className="mt-3 text-3xl text-ivory md:text-4xl">Grow your wedding business with Rasm</h2>
          <OrnamentDivider light className="mt-5" />
          <p className="mx-auto mt-4 max-w-xl text-ivory/80">Get bookings with the advance already paid, manage your calendar and accept requests from one dashboard.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg"><Link href="/list-your-business">List your business</Link></Button>
            <Button asChild variant="light" size="lg"><Link href="/login">Try the dashboards</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
