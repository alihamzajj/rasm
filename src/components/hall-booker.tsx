"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Users } from "lucide-react";
import { AvailabilityCalendar, type DayStatus } from "./availability-calendar";
import { Button } from "./ui/button";
import { useCart } from "@/store/cart";
import { toast } from "@/store/toast";
import { formatPKR, prettyDate, cn } from "@/lib/utils";

type Pkg = { id: string; name: string; description: string; price: number };

export function HallBooker({
  hall,
  packages,
  unavailable,
  initialDate,
}: {
  hall: { id: string; name: string; city: string; photo: string; basePrice: number; capacityMin: number; capacityMax: number };
  packages: Pkg[];
  unavailable: DayStatus[];
  initialDate?: string;
}) {
  const router = useRouter();
  const cart = useCart();
  const blocked = new Set(unavailable.map((u) => u.date));
  const [date, setDate] = useState("");
  const [pkgId, setPkgId] = useState(packages[0]?.id ?? "");
  const [guests, setGuests] = useState(Math.min(Math.max(400, hall.capacityMin), hall.capacityMax));

  // start from the search date, or the date already in the package — if it's free here
  useEffect(() => {
    const d = initialDate || useCart.getState().eventDate;
    if (d && !blocked.has(d)) setDate(d);
    const g = useCart.getState().guests;
    if (g) setGuests(Math.min(Math.max(g, hall.capacityMin), hall.capacityMax));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pkg = packages.find((p) => p.id === pkgId);
  const total = hall.basePrice + (pkg?.price ?? 0) * guests;

  const book = () => {
    if (!date || !pkg) return;
    cart.setEvent({ eventDate: date, guests, city: hall.city });
    cart.setHall({ hallId: hall.id, name: hall.name, city: hall.city, photo: hall.photo, basePrice: hall.basePrice, packageId: pkg.id, packageName: pkg.name, perHead: pkg.price });
    toast(`${hall.name} added to your package`, `${prettyDate(date)} · ${guests} guests · ${pkg.name}`);
    router.push("/packages");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Choose a menu package</p>
        <div className="space-y-2">
          {packages.map((p) => (
            <label key={p.id} className={cn("flex cursor-pointer gap-3 rounded-[5px] border p-3 transition", p.id === pkgId ? "border-maroon bg-cream" : "border-line bg-white hover:border-gold")}>
              <input type="radio" name="pkg" checked={p.id === pkgId} onChange={() => setPkgId(p.id)} className="mt-1 accent-maroon" />
              <span className="flex-1">
                <span className="flex justify-between gap-2 font-bold text-ink">
                  {p.name} <span className="text-maroon">{formatPKR(p.price)}<span className="text-xs font-normal text-ink-muted">/head</span></span>
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">{p.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label flex items-center gap-1.5" htmlFor="guests"><Users className="h-3.5 w-3.5" /> Guests ({hall.capacityMin}–{hall.capacityMax})</label>
        <input id="guests" type="number" className="field" min={hall.capacityMin} max={hall.capacityMax} step={10} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      </div>

      <div>
        <p className="label">Pick your date</p>
        <div className="flex justify-center rounded-[5px] border border-line bg-white p-2">
          <AvailabilityCalendar unavailable={unavailable} selected={date} onSelect={setDate} />
        </div>
      </div>

      <div className="rounded-[5px] border border-gold/40 bg-cream p-4 text-sm">
        <div className="flex justify-between"><span>Hall fee</span><span>{formatPKR(hall.basePrice)}</span></div>
        <div className="flex justify-between"><span>{pkg?.name} × {guests}</span><span>{formatPKR((pkg?.price ?? 0) * guests)}</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold text-maroon"><span>Total</span><span>{formatPKR(total)}</span></div>
        <div className="flex justify-between text-gold-text"><span>Advance (25%)</span><span>{formatPKR(total * 0.25)}</span></div>
      </div>

      <Button className="w-full" size="lg" disabled={!date || !pkg || guests < 1} onClick={book}>
        <CalendarCheck /> {date ? `Book ${prettyDate(date, { day: "numeric", month: "short" })}` : "Book this date"}
      </Button>
      {cart.hall && cart.hall.hallId !== hall.id && <p className="text-center text-xs text-ink-muted">This will replace {cart.hall.name} in your package.</p>}
    </div>
  );
}
