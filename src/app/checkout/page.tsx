"use client";
import { useTitle } from "@/lib/use-title";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemo, useCustomerId } from "@/lib/demo/store";
import { CheckoutClient } from "@/components/checkout-client";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const b = useSearchParams().get("b");
  const customerId = useCustomerId();
  const db = useDemo((s) => s.db);
  const booking = b ? db.bookings.find((x) => x.id === b && x.customerId === customerId) : undefined;

  useEffect(() => {
    if (!booking) router.replace("/packages");
    else if (booking.status === "confirmed") router.replace(`/booking/${booking.id}`);
  }, [booking, router]);
  useTitle("Checkout");
  if (!booking) return null;
  if (booking.status === "confirmed")
    return <p className="container py-24 text-center font-display text-2xl text-maroon">Payment successful — opening your booking…</p>;

  const items = db.items.filter((i) => i.bookingId === booking.id);
  const holds = db.availability.filter((a) => a.heldByBooking === booking.id && a.status === "held" && a.heldUntil);
  const heldUntil = holds.length === items.length && holds.length > 0 ? new Date(Math.min(...holds.map((h) => new Date(h.heldUntil!).getTime()))).toISOString() : null;

  if (booking.status !== "pending") {
    return (
      <div className="container max-w-xl py-20 text-center">
        <h1 className="text-3xl">This checkout was cancelled</h1>
        <p className="mt-3 text-ink-muted">Your dates were released. You can start again from your package.</p>
        <Button asChild className="mt-6"><Link href="/packages">Back to my package</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b border-line bg-cream py-10 text-center">
        <div className="container">
          <p className="eyebrow">Secure checkout · simulated payment</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Pay your advance</h1>
          <OrnamentDivider className="mt-4" />
        </div>
      </section>
      <div className="container py-10">
        <CheckoutClient
          key={booking.id}
          booking={{
            id: booking.id,
            code: booking.code,
            eventName: booking.eventName,
            eventDate: booking.eventDate,
            guests: booking.guests,
            total: booking.totalAmount,
            advance: booking.advanceAmount,
            items: items.map((i) => ({ id: i.id, label: i.label, price: i.price, type: i.type })),
          }}
          heldUntil={heldUntil}
          policy={<CancellationPolicy compact />}
        />
      </div>
    </div>
  );
}
