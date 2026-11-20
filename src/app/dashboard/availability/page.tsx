import { getBusiness } from "@/lib/business";
import { getUnavailableDates } from "@/lib/booking";
import { BusinessCalendar } from "@/components/dashboard/business-calendar";

export const metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const biz = (await getBusiness())!;
  const listing = biz.listings[0];
  if (!listing) return <p>No listing yet.</p>;
  const days = await getUnavailableDates(listing.kind === "hall" ? { hallId: listing.id } : { vendorId: listing.id });
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
