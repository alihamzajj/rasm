import Link from "next/link";
import { Logo } from "./logo";
import { CATEGORIES, CITIES } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-maroon-dark text-ivory/80">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Book your marriage hall and every wedding service in one booking, with one advance payment.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">Halls by city</p>
          <ul className="mt-4 space-y-2 text-sm">
            {CITIES.map((c) => (
              <li key={c}>
                <Link href={`/halls?city=${c}`} className="hover:text-gold-soft">
                  Wedding halls in {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">Vendors</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link href={`/vendors/${c.slug}`} className="hover:text-gold-soft">
                  {c.plural}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">Rasm</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/packages" className="hover:text-gold-soft">Build your package</Link></li>
            <li><Link href="/planner" className="hover:text-gold-soft">Wedding planner</Link></li>
            <li><Link href="/list-your-business" className="hover:text-gold-soft">List your business</Link></li>
            <li><Link href="/login" className="hover:text-gold-soft">Demo log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/20">
        <div className="container flex flex-col gap-2 py-5 text-xs text-ivory/60 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Rasm. Prototype — payments are simulated.</p>
          <p>Photos from Unsplash (free licence). Mandap animation made for Rasm.</p>
        </div>
      </div>
    </footer>
  );
}
