import Link from "next/link";
import { getBusiness } from "@/lib/business";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const biz = await getBusiness();
  if (!biz) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <h1 className="text-3xl">Business dashboard</h1>
        <p className="mt-3 text-ink-muted">Log in as a hall owner or vendor to see this dashboard.</p>
        <Button asChild className="mt-6"><Link href="/login?next=/dashboard">Choose a demo role</Link></Button>
      </div>
    );
  }
  const l = biz.listings[0];
  return (
    <div>
      <section className="border-b border-line bg-maroon text-ivory">
        <div className="container py-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">{biz.user.role === "hall_owner" ? "Hall owner dashboard" : "Vendor dashboard"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl text-ivory">{l?.name ?? biz.user.name}</h1>
            {l && <Badge variant={l.approved === "approved" ? "success" : "warning"}>{l.approved}</Badge>}
          </div>
          <p className="text-sm text-ivory/70">Signed in as {biz.user.name} · {l?.city}</p>
        </div>
        <div className="container">
          <DashboardNav />
        </div>
      </section>
      <div className="container py-8">{children}</div>
    </div>
  );
}
