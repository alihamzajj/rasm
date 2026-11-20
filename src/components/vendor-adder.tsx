"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PackagePlus, Check, AlertTriangle } from "lucide-react";
import { AvailabilityCalendar, type DayStatus } from "./availability-calendar";
import { Button } from "./ui/button";
import { useCart } from "@/store/cart";
import { formatPKR, prettyDate, cn } from "@/lib/utils";
import { categoryByKey } from "@/lib/constants";

type Pkg = { id: string; name: string; description: string; price: number };

export function VendorAdder({
  vendor,
  packages,
  unavailable,
  initialDate,
}: {
  vendor: { id: string; businessName: string; category: string; city: string; photo: string };
  packages: Pkg[];
  unavailable: DayStatus[];
  initialDate?: string;
}) {
  const router = useRouter();
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState("");
  const [pkgId, setPkgId] = useState(packages[1]?.id ?? packages[0]?.id ?? "");
  const busy = new Set(unavailable.map((u) => u.date));

  useEffect(() => {
    setMounted(true);
    const d = initialDate || useCart.getState().eventDate;
    if (d) setDate(d);
    const existing = useCart.getState().vendors.find((v) => v.vendorId === vendor.id);
    if (existing) setPkgId(existing.packageId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pkg = packages.find((p) => p.id === pkgId);
  const dateBusy = !!date && busy.has(date);
  const inCart = mounted && cart.vendors.some((v) => v.vendorId === vendor.id);
  const sameCategory = mounted ? cart.vendors.find((v) => v.category === vendor.category && v.vendorId !== vendor.id) : undefined;
  const changesHallDate = mounted && cart.hall && cart.eventDate && date && date !== cart.eventDate;
  const cat = categoryByKey(vendor.category);

  const add = () => {
    if (!pkg || !date || dateBusy) return;
    cart.setEvent({ eventDate: date });
    cart.addVendor({ vendorId: vendor.id, category: vendor.category, businessName: vendor.businessName, city: vendor.city, photo: vendor.photo, packageId: pkg.id, packageName: pkg.name, price: pkg.price });
    router.push("/packages");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Choose a package</p>
        <div className="space-y-2">
          {packages.map((p) => (
            <label key={p.id} className={cn("flex cursor-pointer gap-3 rounded-[5px] border p-3 transition", p.id === pkgId ? "border-maroon bg-cream" : "border-line bg-white hover:border-gold")}>
              <input type="radio" name="pkg" checked={p.id === pkgId} onChange={() => setPkgId(p.id)} className="mt-1 accent-maroon" />
              <span className="flex-1">
                <span className="flex justify-between gap-2 font-bold text-ink">{p.name} <span className="text-maroon">{formatPKR(p.price)}</span></span>
                <span className="mt-0.5 block text-xs text-ink-muted">{p.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Event date</p>
        <div className="flex justify-center rounded-[5px] border border-line bg-white p-2">
          <AvailabilityCalendar unavailable={unavailable} selected={date} onSelect={setDate} />
        </div>
        {dateBusy && (
          <p className="mt-2 flex items-start gap-2 rounded-[5px] bg-rose-50 p-2 text-xs text-rose-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {vendor.businessName} is not free on {prettyDate(date)} (the date in your package). Pick another {cat?.label.toLowerCase()} or date.
          </p>
        )}
        {changesHallDate && !dateBusy && (
          <p className="mt-2 text-xs text-gold-text">This changes your package date from {prettyDate(cart.eventDate)}. Your hall will be re-checked at checkout.</p>
        )}
      </div>
      <Button className="w-full" size="lg" disabled={!date || !pkg || dateBusy} onClick={add}>
        {inCart ? <Check /> : <PackagePlus />} {inCart ? "Update in my package" : "Add to my package"}
      </Button>
      {sameCategory && <p className="text-center text-xs text-ink-muted">This replaces {sameCategory.businessName} in your package.</p>}
    </div>
  );
}
