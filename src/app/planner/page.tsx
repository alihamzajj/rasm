"use client";
import { useTitle } from "@/lib/use-title";
import { useDemo, useCustomerId } from "@/lib/demo/store";
import { Planner } from "@/components/planner";
import { categoryByKey } from "@/lib/constants";
import { OrnamentDivider } from "@/components/motion/ornament-divider";

export default function PlannerPage() {
  const customerId = useCustomerId();
  const db = useDemo((s) => s.db);
  const booked = db.bookings
    .filter((b) => b.customerId === customerId && (b.status === "confirmed" || b.status === "pending"))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .map((b) => {
      const items = db.items.filter((i) => i.bookingId === b.id);
      return {
        code: b.code,
        eventName: b.eventName,
        eventDate: b.eventDate,
        status: b.status,
        venue: items.find((i) => i.type === "hall")?.label.split(" · ")[0] ?? "",
        vendors: items.filter((i) => i.type === "vendor").map((i) => i.label.split(" · ")[0]),
      };
    });
  useTitle("Wedding planner");
  const spendMap = new Map<string, number>();
  db.bookings
    .filter((b) => b.customerId === customerId && (b.status === "confirmed" || b.status === "pending"))
    .forEach((b) =>
      db.items
        .filter((i) => i.bookingId === b.id && i.status !== "declined")
        .forEach((i) => {
          const label = i.type === "hall" ? "Halls" : categoryByKey(db.vendors.find((v) => v.id === i.refId)?.category ?? "")?.plural ?? "Vendors";
          spendMap.set(label, (spendMap.get(label) ?? 0) + i.price);
        })
    );
  const spend = [...spendMap.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount);

  return (
    <div>
      <section className="border-b border-line bg-cream py-10 text-center">
        <div className="container">
          <p className="eyebrow">Mehndi · Baraat · Walima</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Wedding planner</h1>
          <OrnamentDivider className="mt-4" />
          <p className="section-sub text-sm">Plan every function with its own date, venue, vendors and checklist. Saved on this device.</p>
        </div>
      </section>
      <div className="container py-10">
        <Planner booked={booked} spend={spend} />
      </div>
    </div>
  );
}
