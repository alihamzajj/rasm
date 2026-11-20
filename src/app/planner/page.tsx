"use client";
import { useDemo, useCustomerId } from "@/lib/demo/store";
import { Planner } from "@/components/planner";
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
        <Planner booked={booked} />
      </div>
    </div>
  );
}
