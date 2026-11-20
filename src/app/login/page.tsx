import { User, Building2, Camera, Shield } from "lucide-react";
import { DEMO_USERS, getCurrentUser } from "@/lib/session";
import { loginAsAction } from "@/app/actions";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log in" };

const ICONS = { customer: User, hall_owner: Building2, vendor: Camera, admin: Shield } as const;
const BLURB = {
  customer: "Search halls, build a package, pay the advance and track bookings.",
  hall_owner: "Owner of Shalimar Grand Banquet, Lahore. See requests, earnings and the calendar.",
  vendor: "Owner of Lens & Lace Studio (photographer). Manage packages and availability.",
  admin: "Approve new halls and vendors, view all bookings and set the commission.",
} as const;

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const current = await getCurrentUser();
  return (
    <div className="container max-w-3xl py-14">
      <div className="flex justify-center"><Logo /></div>
      <h1 className="mt-6 text-center text-3xl md:text-4xl">Log in to Rasm</h1>
      <OrnamentDivider className="mt-4" />
      <p className="section-sub text-sm">This prototype has no passwords. Pick a demo role to explore each dashboard — you can switch at any time.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DEMO_USERS.map((u) => {
          const Icon = ICONS[u.role];
          const isCurrent = current?.id === u.id;
          return (
            <form key={u.id} action={loginAsAction}>
              <input type="hidden" name="userId" value={u.id} />
              {searchParams.next && <input type="hidden" name="next" value={searchParams.next} />}
              <button className={`group flex h-full w-full gap-4 rounded-[6px] border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg ${isCurrent ? "border-maroon ring-2 ring-maroon/15" : "border-line"}`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold bg-cream text-maroon ring-4 ring-gold/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="eyebrow">{u.label}{isCurrent && " · current"}</span>
                  <span className="mt-1 block font-display text-xl text-maroon">{u.name}</span>
                  <span className="mt-1 block text-sm text-ink-muted">{BLURB[u.role]}</span>
                  <span className="mt-3 inline-block text-xs font-bold text-maroon group-hover:underline">Continue as {u.label.toLowerCase()} →</span>
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
