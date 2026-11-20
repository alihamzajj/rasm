"use client";
import Link from "next/link";
import { useCurrentUser } from "@/lib/demo/store";
import { TabNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  if (user?.role !== "admin") {
    return (
      <div className="container max-w-lg py-20 text-center">
        <h1 className="text-3xl">Admin panel</h1>
        <p className="mt-3 text-ink-muted">Log in as the admin to approve listings, see every booking and set the commission.</p>
        <Button asChild className="mt-6"><Link href="/login?next=/admin">Choose a demo role</Link></Button>
      </div>
    );
  }
  return (
    <div>
      <section className="bg-maroon-dark text-ivory">
        <div className="container py-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">Rasm admin</p>
          <h1 className="mt-1 text-3xl text-ivory">Control room</h1>
        </div>
        <div className="container">
          <TabNav items={[{ href: "/admin", label: "Approvals" }, { href: "/admin/bookings", label: "All bookings" }, { href: "/admin/settings", label: "Commission & revenue" }]} />
        </div>
      </section>
      <div className="container py-8">{children}</div>
    </div>
  );
}
