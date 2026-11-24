"use client";
import { useTitle } from "@/lib/use-title";
import { Percent, Landmark, Wallet, TrendingUp } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { setCommission } from "@/lib/demo/engine";
import { toast } from "@/store/toast";
import { Stat } from "@/components/dashboard/stat";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";

export default function AdminSettings() {
  const db = useDemo((s) => s.db);
  const apply = useDemo((s) => s.apply);
  const commission = db.commissionPercent;
  const bookings = db.bookings.filter((b) => b.status === "confirmed" || b.status === "completed").map((b) => ({ ...b, createdAt: new Date(b.createdAt) }));
  const payments = db.payments;
  const gmv = bookings.reduce((a, b) => a + b.totalAmount, 0);
  const collected = payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  const refunded = payments.filter((p) => p.status === "refunded").reduce((a, p) => a + p.amount, 0);
  const revenue = Math.round((gmv * commission) / 100);

  // last 6 months by booking date
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), gmv: 0 };
  });
  bookings.forEach((b) => {
    const m = months.find((x) => x.key === `${b.createdAt.getFullYear()}-${b.createdAt.getMonth()}`);
    if (m) m.gmv += b.totalAmount;
  });
  const max = Math.max(1, ...months.map((m) => m.gmv));

  useTitle("Admin · Revenue");
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Booking value" value={formatPKR(gmv)} note={`${bookings.length} confirmed or completed bookings`} icon={TrendingUp} />
        <Stat label="Advances collected" value={formatPKR(collected - refunded)} note={`${formatPKR(refunded)} refunded`} icon={Wallet} />
        <Stat label="Commission rate" value={`${commission}%`} note="Of each booking's total value" icon={Percent} />
        <Stat label="Rasm revenue" value={formatPKR(revenue)} note="Commission on booking value" icon={Landmark} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[6px] border border-line bg-white p-5">
          <h2 className="text-xl">Booking value by month</h2>
          <p className="text-xs text-ink-muted">By the date the booking was made</p>
          <div className="mt-6 flex h-56 items-end gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-maroon">{m.gmv ? `${(m.gmv / 1_000_000).toFixed(1)}M` : ""}</span>
                <div className="w-full max-w-[56px] rounded-t-[4px] bg-maroon" style={{ height: `${Math.max(2, (m.gmv / max) * 170)}px` }} title={formatPKR(m.gmv)} />
                <span className="text-xs text-ink-muted">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
            <div><p className="label !mb-0">Commission</p><p className="font-bold text-maroon">{formatPKR(revenue)}</p></div>
            <div><p className="label !mb-0">Paid to partners</p><p className="font-bold">{formatPKR(gmv - revenue)}</p></div>
            <div><p className="label !mb-0">Avg. booking</p><p className="font-bold">{formatPKR(bookings.length ? gmv / bookings.length : 0)}</p></div>
          </div>
        </div>

        <form
          key={commission}
          onSubmit={(e) => {
            e.preventDefault();
            const v = Number(new FormData(e.currentTarget).get("commission"));
            apply((d) => setCommission(d, v));
            toast(`Commission set to ${v}%`, "Partner earnings and revenue are updated");
          }}
          className="h-fit rounded-[6px] border border-gold/50 bg-cream p-5">
          <h2 className="text-xl">Commission setting</h2>
          <p className="mt-1 text-sm text-ink-muted">Percentage Rasm keeps from each booking. It is taken from the advance; partners see their earnings after commission.</p>
          <label className="label mt-4" htmlFor="commission">Commission (%)</label>
          <div className="flex gap-2">
            <input id="commission" name="commission" type="number" min={0} max={50} step={0.5} defaultValue={commission} className="field" />
            <Button>Save</Button>
          </div>
          <p className="mt-3 text-xs text-ink-muted">Example: on a Rs 1,000,000 booking, Rasm keeps {formatPKR(10000 * commission)}.</p>
        </form>
      </div>
    </div>
  );
}
