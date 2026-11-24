"use client";
import { useTitle } from "@/lib/use-title";
import Link from "next/link";
import { Wallet, Hourglass, CalendarHeart, Inbox } from "lucide-react";
import { useBusiness } from "@/lib/demo/use-business";
import { getBusinessItems } from "@/lib/demo/selectors";
import { unavailableDates } from "@/lib/demo/engine";
import { Stat } from "@/components/dashboard/stat";
import { BusinessCalendar } from "@/components/dashboard/business-calendar";
import { StatusBadge } from "@/components/ui/badge";
import { formatPKR, prettyDate, toDateKey } from "@/lib/utils";

export default function DashboardOverview() {
  const { db, biz } = useBusiness();
  const listing = biz?.listings[0];
  useTitle("Dashboard");
  if (!biz || !listing) return <p>No listing yet.</p>;
  const items = getBusinessItems(db, biz.listings);
  const days = unavailableDates(db, listing.kind === "hall" ? { hallId: listing.id } : { vendorId: listing.id });
  const commission = db.commissionPercent;
  const today = toDateKey(new Date());
  const live = items.filter((i) => i.status !== "declined" && (i.booking.status === "confirmed" || i.booking.status === "completed"));
  const upcoming = live.filter((i) => i.booking.eventDate >= today);
  const advanceReceived = live.reduce((a, i) => a + i.advance, 0);
  const pendingBalance = upcoming.reduce((a, i) => a + (i.price - i.advance), 0);
  const requests = items.filter((i) => i.status === "requested" && i.booking.status === "confirmed").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Advance received" value={formatPKR(advanceReceived * (1 - commission / 100))} note={`${formatPKR(advanceReceived)} minus ${commission}% Rasm commission`} icon={Wallet} />
        <Stat label="Balance pending" value={formatPKR(pendingBalance)} note="To collect from customers on upcoming events" icon={Hourglass} />
        <Stat label="Upcoming events" value={String(upcoming.length)} note="Confirmed bookings from today" icon={CalendarHeart} />
        <Stat label="New requests" value={String(requests)} note="Waiting for you to accept" icon={Inbox} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl">Upcoming bookings</h2>
            <Link href="/dashboard/requests" className="text-sm font-bold text-maroon hover:underline">All requests →</Link>
          </div>
          <div className="overflow-hidden rounded-[6px] border border-line bg-white">
            {upcoming.length === 0 ? (
              <p className="p-6 text-sm text-ink-muted">No upcoming bookings yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {upcoming.slice(0, 8).map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-bold text-ink">{i.booking.eventName} <span className="font-normal text-ink-muted">· {i.booking.customer.name}</span></p>
                      <p className="text-sm text-ink-muted">{prettyDate(i.booking.eventDate)} · {i.label.split(" · ")[1]}{i.booking.guests ? ` · ${i.booking.guests} guests` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={i.status} />
                      <div className="text-right text-sm">
                        <p className="font-bold text-maroon">{formatPKR(i.price)}</p>
                        <p className="text-xs text-emerald-700">{formatPKR(i.advance)} advance paid</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl">Calendar</h2>
            <Link href="/dashboard/availability" className="text-sm font-bold text-maroon hover:underline">Edit →</Link>
          </div>
          <BusinessCalendar days={days} />
        </div>
      </div>
    </div>
  );
}
