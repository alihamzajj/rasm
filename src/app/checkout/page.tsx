import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCustomerId } from "@/lib/session";
import { releaseExpiredHolds } from "@/lib/booking";
import { CheckoutClient } from "@/components/checkout-client";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: { b?: string } }) {
  if (!searchParams.b) redirect("/packages");
  await releaseExpiredHolds();
  const customerId = await getCustomerId();
  const booking = await prisma.booking.findFirst({ where: { id: searchParams.b, customerId }, include: { items: true } });
  if (!booking) redirect("/packages");
  if (booking.status === "confirmed") redirect(`/booking/${booking.id}`);

  const holds = await prisma.availability.findMany({ where: { heldByBooking: booking.id, status: "held" } });
  const heldUntil = holds.length === booking.items.length && holds.length > 0 ? new Date(Math.min(...holds.map((h) => h.heldUntil!.getTime()))).toISOString() : null;

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
          booking={{
            id: booking.id,
            code: booking.code,
            eventName: booking.eventName,
            eventDate: booking.eventDate,
            guests: booking.guests,
            total: booking.totalAmount,
            advance: booking.advanceAmount,
            items: booking.items.map((i) => ({ id: i.id, label: i.label, price: i.price, type: i.type })),
          }}
          heldUntil={heldUntil}
          policy={<CancellationPolicy compact />}
        />
      </div>
    </div>
  );
}
