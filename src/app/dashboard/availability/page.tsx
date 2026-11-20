"use client";
import { useBusiness } from "@/lib/demo/use-business";
import { unavailableDates } from "@/lib/demo/engine";
import { BusinessCalendar } from "@/components/dashboard/business-calendar";

export default function AvailabilityPage() {
  const { db, biz } = useBusiness();
  const listing = biz?.listings[0];
  if (!listing) return <p>No listing yet.</p>;
  const days = unavailableDates(db, listing.kind === "hall" ? { hallId: listing.id } : { vendorId: listing.id });
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl">Availability</h2>
      <p className="mb-5 mt-1 text-sm text-ink-muted">
        Click a free date to block it (for private events or maintenance). Click a blocked date to open it again. Booked and held dates come from customers and can&apos;t be changed here.
      </p>
      <BusinessCalendar days={days} editable listing={{ kind: listing.kind, id: listing.id }} />
    </div>
  );
}
