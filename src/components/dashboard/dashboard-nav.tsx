"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TabNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Dashboard">
      {items.map((t) => {
        const active = t.href === items[0].href ? path === t.href : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition", active ? "border-gold text-gold-soft" : "border-transparent text-ivory/70 hover:text-ivory")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardNav() {
  return (
    <TabNav
      items={[
        { href: "/dashboard", label: "Overview" },
        { href: "/dashboard/listing", label: "My listing" },
        { href: "/dashboard/availability", label: "Availability" },
        { href: "/dashboard/requests", label: "Booking requests" },
      ]}
    />
  );
}
