"use client";
import Link from "next/link";
import {
  Search, Building2, Camera, PackagePlus, Timer, ShieldCheck, CalendarHeart, ListChecks,
  LayoutDashboard, CalendarX, Inbox, PencilLine, Shield, Percent, Sparkles, Users, Store,
} from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

type Feature = { icon: LucideIcon; title: string; text: string; href: string; cta: string; role?: string };

const GROUPS: { title: string; who: string; role?: string; features: Feature[] }[] = [
  {
    title: "For couples & families",
    who: "No login needed — or log in as the Customer",
    features: [
      { icon: Search, title: "Search wedding halls", text: "Filter by city, event date, guest count, price per head and type (banquet, marquee, lawn). Sort by rating, price or size. Halls free on your date get an “Available on your date” badge.", href: "/halls", cta: "Search halls" },
      { icon: Building2, title: "Hall detail page", text: "Photo gallery, capacity, price per head and per event, amenities, three menu packages, reviews and a live availability calendar with booked dates crossed out.", href: "/halls", cta: "Open a hall" },
      { icon: Camera, title: "8 vendor categories", text: "Photographers, videographers, decorators, fireworks, caterers, DJs, makeup and mehndi artists — each with filters, portfolio, packages, calendar and reviews.", href: "/vendors", cta: "Browse vendors" },
      { icon: Sparkles, title: "Fireworks effects", text: "The Fireworks page and the booking confirmation play a short gold-and-maroon fireworks show.", href: "/vendors/fireworks", cta: "See fireworks" },
      { icon: PackagePlus, title: "Package builder", text: "Your hall plus every vendor in one booking, all on the same date. Change or remove any line; see the total, the 25% advance and the cancellation policy.", href: "/packages", cta: "Open my package" },
      { icon: Timer, title: "Checkout with a 15-minute hold", text: "Starting checkout holds the hall date and every vendor date for 15 minutes with a live countdown. Then pay the advance with a fake card, JazzCash or Easypaisa.", href: "/halls", cta: "Start a booking" },
      { icon: ShieldCheck, title: "No double booking", text: "A date that is held or booked can't be taken by anyone else. If the hold runs out before you pay, the date is released and payment is refused if someone took it.", href: "/halls", cta: "Try it" },
      { icon: CalendarHeart, title: "My bookings", text: "Every booking with its status — pending, confirmed, completed or cancelled — each vendor's answer, the advance paid, and a cancel button.", href: "/bookings", cta: "My bookings" },
      { icon: ListChecks, title: "Wedding planner", text: "Mehndi, Baraat and Walima (rename or add more), each with its own date, venue, vendors and checklist. Fill an event straight from a booking.", href: "/planner", cta: "Open planner" },
    ],
  },
  {
    title: "For hall owners & vendors",
    who: "Log in as Hall owner (Imran) or Vendor (Sara)",
    role: "demo-hall-owner",
    features: [
      { icon: LayoutDashboard, title: "Business overview", text: "Advance received (after commission), balance still to collect, upcoming events, new requests and a two-month calendar.", href: "/dashboard", cta: "Open dashboard" },
      { icon: Inbox, title: "Booking requests", text: "Accept or decline each paid booking. Declining frees the date and refunds that part of the customer's advance.", href: "/dashboard/requests", cta: "See requests" },
      { icon: CalendarX, title: "Availability calendar", text: "Click a date to block it for a private event, click again to open it. Booked and held dates are protected.", href: "/dashboard/availability", cta: "Edit calendar" },
      { icon: PencilLine, title: "Edit listing & packages", text: "Change name, capacity, prices, amenities, description and photos. Add, edit or delete packages and menu prices.", href: "/dashboard/listing", cta: "Edit listing" },
      { icon: Store, title: "List your business", text: "New halls and vendors apply with a short form. The listing waits for admin approval.", href: "/list-your-business", cta: "Apply" },
    ],
  },
  {
    title: "For the Rasm team",
    who: "Log in as Admin",
    role: "demo-admin",
    features: [
      { icon: Shield, title: "Approve new listings", text: "Review new halls and vendors and approve or reject them. Approved listings appear in search straight away.", href: "/admin", cta: "Approvals" },
      { icon: Users, title: "All bookings", text: "Every booking in one table, filtered by status, city, date range or a search by code, event or customer.", href: "/admin/bookings", cta: "All bookings" },
      { icon: Percent, title: "Commission & revenue", text: "Set the commission percentage and see booking value, advances collected, refunds, Rasm's revenue and a monthly chart.", href: "/admin/settings", cta: "Revenue" },
    ],
  },
];

const EXTRAS = [
  "Royal Heritage design: maroon, gold and ivory with Playfair Display and Mulish",
  "Falling rose petals, a Lottie mandap, glowing diyas and self-drawing gold dividers",
  "Works on phones, tablets and desktops",
  "All animations switch off for people who prefer reduced motion",
  "Demo role switcher — no passwords, switch any time from Log in",
  "Reset demo button in the top bar restores the original data",
];

export default function FeaturesPage() {
  const setUser = useDemo((s) => s.setUser);
  return (
    <div>
      <section className="bg-maroon py-14 text-center text-ivory md:py-20">
        <div className="container">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-soft">Prototype tour</p>
          <h1 className="mt-3 text-4xl text-ivory md:text-5xl">Everything Rasm can do</h1>
          <OrnamentDivider light className="mt-5" />
          <p className="mx-auto mt-4 max-w-2xl text-ivory/80">
            A wedding marketplace where couples book a marriage hall and every wedding service in one booking. Click any feature to try it — your changes only affect your own copy.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            {["17 features", "4 user roles", "12 halls · 40 vendors", "3 cities"].map((t) => (
              <span key={t} className="rounded-[4px] border border-gold-soft/50 px-3 py-1.5 font-bold text-gold-soft">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-cream py-10">
        <div className="container max-w-4xl">
          <h2 className="text-center text-2xl">Try the full journey in 2 minutes</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["Pick a hall", "Open any hall, choose a menu and a free date, press Book."],
              ["Add vendors", "Add a photographer or fireworks from the package page."],
              ["Pay the advance", "Hold my dates → watch the 15-min timer → Pay (fake card)."],
              ["Switch roles", "Log in as the Hall owner to accept your own booking."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-[6px] border border-line bg-white p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold font-display text-maroon">{i + 1}</span>
                <p className="mt-2 font-bold text-maroon">{t}</p>
                <p className="mt-1 text-sm text-ink-muted">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 text-center">
            <Button asChild size="lg"><Link href="/halls">Start with a hall</Link></Button>
          </div>
        </div>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="section">
          <div className="container">
            <Reveal className="mb-8 text-center">
              <p className="eyebrow">{g.who}</p>
              <h2 className="section-title mt-2">{g.title}</h2>
              <OrnamentDivider className="mt-4" />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.features.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 0.06}>
                  <div className="flex h-full flex-col rounded-[6px] border border-line bg-white p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-cream text-maroon ring-4 ring-gold/10">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg">{f.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-ink-muted">{f.text}</p>
                    <Link
                      href={f.href}
                      onClick={() => {
                        if (g.role) setUser(g.role);
                      }}
                      className="mt-4 text-sm font-bold text-maroon hover:underline"
                    >
                      {f.cta} →{g.role && <span className="ml-1 font-normal text-ink-muted">(logs you in)</span>}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section bg-cream">
        <div className="container max-w-3xl">
          <h2 className="section-title">Also built in</h2>
          <OrnamentDivider className="mt-4" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {EXTRAS.map((e) => (
              <li key={e} className="flex gap-3 rounded-[6px] border border-line bg-white p-4 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-xs text-ink-muted">Payments are simulated. Data lives in your browser; use “Reset demo” in the top bar to start fresh.</p>
        </div>
      </section>
    </div>
  );
}
