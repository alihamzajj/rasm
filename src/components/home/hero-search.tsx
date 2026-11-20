"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, CalendarDays, Users } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { useCart } from "@/store/cart";
import { toDateKey } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const setEvent = useCart((s) => s.setEvent);
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("400");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEvent({ city, eventDate: date, guests: Number(guests) || 0 });
        const q = new URLSearchParams();
        if (city) q.set("city", city);
        if (date) q.set("date", date);
        if (guests) q.set("guests", guests);
        router.push(`/halls?${q.toString()}`);
      }}
      className="mx-auto grid w-full max-w-4xl gap-2 rounded-[6px] border border-gold/40 bg-ivory p-2 shadow-2xl shadow-black/20 md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <label className="flex items-center gap-3 rounded-[4px] px-3 py-2 hover:bg-cream/70">
        <MapPin className="h-5 w-5 shrink-0 text-gold" />
        <span className="flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold-text">City</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none">
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-[4px] px-3 py-2 hover:bg-cream/70 md:border-l md:border-line">
        <CalendarDays className="h-5 w-5 shrink-0 text-gold" />
        <span className="flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold-text">Event date</span>
          <input type="date" min={toDateKey(tomorrow)} value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none" />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-[4px] px-3 py-2 hover:bg-cream/70 md:border-l md:border-line">
        <Users className="h-5 w-5 shrink-0 text-gold" />
        <span className="flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold-text">Guests</span>
          <input type="number" min={20} step={10} value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none" />
        </span>
      </label>
      <button className="flex h-12 items-center justify-center gap-2 rounded-[5px] bg-maroon px-7 text-sm font-bold text-ivory transition hover:bg-maroon-dark md:h-auto">
        <Search className="h-4 w-4" /> Search halls
      </button>
    </form>
  );
}
