import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, CalendarCheck } from "lucide-react";
import { Badge } from "./ui/badge";
import { formatPKR } from "@/lib/utils";
import { categoryByKey } from "@/lib/constants";

export function VendorCard({
  vendor,
  availableOn,
  dateQuery,
}: {
  vendor: { id: string; businessName: string; category: string; city: string; photos: string[]; rating: number; reviewCount: number; minPrice: number; description: string };
  availableOn?: string | null;
  dateQuery?: string;
}) {
  const cat = categoryByKey(vendor.category);
  return (
    <Link href={`/vendor/${vendor.id}${dateQuery ? `?date=${dateQuery}` : ""}`} className="group block h-full overflow-hidden rounded-[6px] border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(91,26,43,0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {vendor.photos[0] && <Image src={vendor.photos[0]} alt={vendor.businessName} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />}
        <Badge variant="outline" className="absolute left-3 top-3 bg-ivory/95 text-maroon">{cat?.label}</Badge>
        {availableOn && (
          <Badge variant="success" className="absolute bottom-3 left-3 bg-emerald-50/95"><CalendarCheck className="h-3 w-3" /> Available on your date</Badge>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug text-maroon">{vendor.businessName}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-gold-text">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {vendor.rating.toFixed(1)}
            <span className="font-normal text-ink-muted">({vendor.reviewCount})</span>
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted"><MapPin className="h-3.5 w-3.5" /> {vendor.city}</p>
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{vendor.description}</p>
        <p className="mt-3 border-t border-line pt-3 text-sm">
          <span className="text-ink-muted">Packages from </span>
          <span className="font-bold text-maroon">{formatPKR(vendor.minPrice)}</span>
        </p>
      </div>
    </Link>
  );
}
