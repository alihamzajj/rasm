import { prisma } from "@/lib/db";
import { getCustomerId } from "@/lib/session";
import { Planner } from "@/components/planner";
import { OrnamentDivider } from "@/components/motion/ornament-divider";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wedding planner" };

export default async function PlannerPage() {
  const customerId = await getCustomerId();
  const bookings = await prisma.booking.findMany({
    where: { customerId, status: { in: ["confirmed", "pending"] } },
    include: { items: true },
    orderBy: { eventDate: "asc" },
  });
  const booked = bookings.map((b) => ({
    code: b.code,
    eventName: b.eventName,
    eventDate: b.eventDate,
    status: b.status,
    venue: b.items.find((i) => i.type === "hall")?.label.split(" · ")[0] ?? "",
    vendors: b.items.filter((i) => i.type === "vendor").map((i) => i.label.split(" · ")[0]),
  }));
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
