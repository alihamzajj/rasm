import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Star, CalendarCheck } from "lucide-react";
import { Badge } from "./ui/badge";
import { formatPKR } from "@/lib/utils";

export type HallCardData = {
  id: string;
  name: string;
  city: string;
  area: string;
  type: string;
  capacityMin: number;
  capacityMax: number;
  pricePerHead: number;
  basePrice: number;
  photos: string[];
  rating: number;
  reviewCount: number;
};

export function HallCard({ hall, availableOn, dateQuery }: { hall: HallCardData; availableOn?: string | null; dateQuery?: string }) {
  return (
    <Link href={`/halls/${hall.id}${dateQuery ? `?date=${dateQuery}` : ""}`} className="group block h-full overflow-hidden rounded-[6px] border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(91,26,43,0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {hall.photos[0] && (
          <Image src={hall.photos[0]} alt={hall.name} fill sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="outline" className="bg-ivory/95 text-maroon">{hall.type}</Badge>
        </div>
        {availableOn && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="success" className="bg-emerald-50/95">
              <CalendarCheck className="h-3 w-3" /> Available on your date
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug text-maroon">{hall.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-gold-text">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {hall.rating.toFixed(1)}
            <span className="font-normal text-ink-muted">({hall.reviewCount})</span>
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5" /> {hall.area}, {hall.city}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="flex items-center gap-1 text-ink-muted">
            <Users className="h-3.5 w-3.5" /> {hall.capacityMin}–{hall.capacityMax}
          </span>
          <span className="text-right">
            <span className="font-bold text-maroon">{formatPKR(hall.pricePerHead)}</span>
            <span className="text-ink-muted"> /head</span>
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-ink-muted">+ {formatPKR(hall.basePrice)} per event</p>
      </div>
    </Link>
  );
}
