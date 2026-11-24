"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, LayoutDashboard, Shield, CalendarHeart, LogOut } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { useCart } from "@/store/cart";
import { useDemo, useCurrentUser } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/halls", label: "Wedding halls" },
  { href: "/vendors", label: "Vendors" },
  { href: "/packages", label: "Packages" },
  { href: "/planner", label: "Planner" },
  { href: "/features", label: "Features" },
];

const roleHome = (role: string) =>
  role === "admin" ? { href: "/admin", label: "Admin panel", icon: Shield } : role === "customer" ? { href: "/bookings", label: "My bookings", icon: CalendarHeart } : { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard };

const roleLabel: Record<string, string> = { customer: "Customer", hall_owner: "Hall owner", vendor: "Vendor", admin: "Admin" };

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const currentUser = useCurrentUser();
  const setUser = useDemo((s) => s.setUser);
  const user = mounted ? currentUser : null;
  const count = useCart((s) => (s.hall ? 1 : 0) + s.vendors.length);
  useEffect(() => setMounted(true), []);

  const home = user ? roleHome(user.role) : null;

  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-line/80 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo />
        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "relative whitespace-nowrap text-sm font-semibold text-ink-muted transition-colors hover:text-maroon",
                pathname.startsWith(n.href) && "text-maroon after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gold"
              )}
            >
              {n.label}
              {n.href === "/packages" && mounted && count > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">{count}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user && home ? (
            <>
              <Link href={home.href} className="flex items-center gap-1.5 text-sm font-semibold text-maroon hover:underline">
                <home.icon className="h-4 w-4" /> {home.label}
              </Link>
              <Link href="/login" className="rounded-[4px] border border-line bg-white px-2.5 py-1 text-xs text-ink-muted hover:border-gold" title="Switch demo role">
                {user.name.split(" ")[0]} · <span className="font-bold text-gold-text">{roleLabel[user.role]}</span>
              </Link>
              <button onClick={() => { setUser(null); router.push("/"); }} className="p-1 text-ink-muted hover:text-maroon" aria-label="Log out" title="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-maroon hover:underline">
              Log in
            </Link>
          )}
          <Button asChild size="sm" className="h-10 px-4">
            <Link href="/list-your-business">List your business</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Link href="/packages" className="relative p-2 text-maroon" aria-label="My package">
            <ShoppingBag className="h-5 w-5" />
            {mounted && count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-white">{count}</span>}
          </Link>
          <Sheet>
            <SheetTrigger className="p-2 text-maroon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent title="Rasm">
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {[...NAV, ...(home ? [{ href: home.href, label: home.label }] : [])].map((n) => (
                  <SheetClose asChild key={n.href}>
                    <Link href={n.href} className="border-b border-line py-3 font-display text-lg text-maroon">
                      {n.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <SheetClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/login">{user ? `Switch role (${roleLabel[user.role]})` : "Log in"}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/list-your-business">List your business</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
