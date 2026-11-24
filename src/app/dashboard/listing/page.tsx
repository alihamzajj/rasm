"use client";
import { useTitle } from "@/lib/use-title";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useBusiness } from "@/lib/demo/use-business";
import { useDemo } from "@/lib/demo/store";
import { packagesFor } from "@/lib/demo/selectors";
import { updateHall, updateVendor, savePackage, deletePackage } from "@/lib/demo/engine";
import { CITIES, HALL_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast";

const formData = (e: FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

export default function ListingPage() {
  const { db, biz } = useBusiness();
  const apply = useDemo((s) => s.apply);
  const userId = useDemo((s) => s.userId) ?? "";
  const [saved, setSaved] = useState(false);
  const l = biz?.listings[0];
  useTitle("My listing");
  if (!l) return <p>No listing yet.</p>;
  const hall = l.kind === "hall" ? db.halls.find((h) => h.id === l.id) : undefined;
  const vendor = l.kind === "vendor" ? db.vendors.find((v) => v.id === l.id) : undefined;
  const rec = (hall ?? vendor)!;
  const photos = rec.photos;
  const packages = packagesFor(db, l.kind, l.id);

  const saveListing = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = formData(e);
    const newPhotos = (f.photos || "").split("\n").map((s) => s.trim()).filter((s) => /^https:\/\/images\.(unsplash|pexels)\.com\//.test(s));
    if (hall) {
      apply((d) =>
        updateHall(d, userId, hall.id, {
          name: f.name, city: f.city, area: f.area, type: f.type, description: f.description,
          capacityMin: Number(f.capacityMin), capacityMax: Number(f.capacityMax), pricePerHead: Number(f.pricePerHead), basePrice: Number(f.basePrice),
          amenities: (f.amenities || "").split(",").map((s) => s.trim()).filter(Boolean),
          ...(newPhotos.length ? { photos: newPhotos } : {}),
        })
      );
    } else if (vendor) {
      apply((d) => updateVendor(d, userId, vendor.id, { businessName: f.name, city: f.city, description: f.description, ...(newPhotos.length ? { photos: newPhotos } : {}) }));
    }
    setSaved(true);
    toast("Listing saved", "Customers see the changes straight away");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
      <form key={JSON.stringify(rec)} onSubmit={saveListing} className="space-y-5 rounded-[6px] border border-line bg-white p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Listing details</h2>
          {saved && <span className="flex items-center gap-1 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label" htmlFor="name">Name</label><input id="name" name="name" className="field" defaultValue={hall?.name ?? vendor?.businessName} required /></div>
          <div>
            <label className="label" htmlFor="city">City</label>
            <select id="city" name="city" className="field" defaultValue={rec.city}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          {hall && (
            <>
              <div><label className="label" htmlFor="area">Area</label><input id="area" name="area" className="field" defaultValue={hall.area} /></div>
              <div>
                <label className="label" htmlFor="type">Type</label>
                <select id="type" name="type" className="field" defaultValue={hall.type}>{HALL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label" htmlFor="cmin">Min guests</label><input id="cmin" name="capacityMin" type="number" className="field" defaultValue={hall.capacityMin} /></div>
                <div><label className="label" htmlFor="cmax">Max guests</label><input id="cmax" name="capacityMax" type="number" className="field" defaultValue={hall.capacityMax} /></div>
              </div>
              <div><label className="label" htmlFor="pph">Starting price per head (Rs)</label><input id="pph" name="pricePerHead" type="number" className="field" defaultValue={hall.pricePerHead} /></div>
              <div><label className="label" htmlFor="bp">Hall fee per event (Rs)</label><input id="bp" name="basePrice" type="number" className="field" defaultValue={hall.basePrice} /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="am">Amenities (comma separated)</label><input id="am" name="amenities" className="field" defaultValue={hall.amenities.join(", ")} /></div>
            </>
          )}
          <div className="sm:col-span-2"><label className="label" htmlFor="desc">Description</label><textarea id="desc" name="description" className="field h-auto min-h-[110px] py-2.5" defaultValue={rec.description} /></div>
        </div>

        <div>
          <p className="label">Photos</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {photos.map((p, i) => (
              <div key={p + i} className="relative aspect-square overflow-hidden rounded-[4px] border border-line">
                <Image src={p} alt="" fill sizes="120px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-maroon px-1.5 text-[10px] font-bold text-ivory">Cover</span>}
              </div>
            ))}
          </div>
          <label className="label mt-3" htmlFor="photos">Photo URLs (one per line, Unsplash or Pexels; first is the cover)</label>
          <textarea id="photos" name="photos" className="field h-auto min-h-[110px] py-2.5 font-mono text-xs" defaultValue={photos.join("\n")} />
        </div>
        <Button size="lg">Save listing</Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-2xl">{hall ? "Menu packages (price per head)" : "Packages & prices"}</h2>
        {packages.map((p) => (
          <div key={p.id} className="rounded-[6px] border border-line bg-white p-4">
            <form
              key={`${p.name}-${p.price}-${p.description}`}
              onSubmit={(e) => {
                e.preventDefault();
                const f = formData(e);
                apply((d) => savePackage(d, userId, l.kind, l.id, { id: p.id, name: f.name, description: f.description, price: Number(f.price) }));
                toast(`${f.name} updated`);
              }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <input name="name" className="field" defaultValue={p.name} aria-label="Package name" />
                <input name="price" type="number" className="field w-32" defaultValue={p.price} aria-label="Price" />
              </div>
              <textarea name="description" className="field h-auto min-h-[64px] py-2 text-sm" defaultValue={p.description} aria-label="Description" />
              <Button size="sm" variant="outline">Update</Button>
            </form>
            <button onClick={() => { apply((d) => deletePackage(d, userId, p.id)); toast(`${p.name} deleted`, undefined, "info"); }} className="mt-2 flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = formData(e);
            apply((d) => savePackage(d, userId, l.kind, l.id, { name: f.name, description: f.description, price: Number(f.price) }));
            toast(`${f.name} added`);
            e.currentTarget.reset();
          }}
          className="space-y-2 rounded-[6px] border border-dashed border-gold bg-cream p-4"
        >
          <p className="font-display text-lg text-maroon">Add a package</p>
          <div className="flex gap-2">
            <input name="name" className="field" placeholder="Package name" required />
            <input name="price" type="number" className="field w-32" placeholder="Price" required />
          </div>
          <textarea name="description" className="field h-auto min-h-[64px] py-2 text-sm" placeholder="What's included" />
          <Button size="sm">Add package</Button>
        </form>
      </div>
    </div>
  );
}
