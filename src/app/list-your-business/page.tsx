import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CATEGORIES, CITIES, HALL_TYPES } from "@/lib/constants";
import { listBusinessAction } from "@/app/actions";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Button } from "@/components/ui/button";

export const metadata = { title: "List your business" };

export default function ListBusinessPage({ searchParams }: { searchParams: { sent?: string; kind?: string } }) {
  if (searchParams.sent) {
    return (
      <div className="container max-w-xl py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-4 text-3xl">Application received</h1>
        <OrnamentDivider className="mt-4" />
        <p className="mt-4 text-ink-muted">Our team will review your listing. Log in as the admin to approve it in the demo.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild><Link href="/login?next=/admin">Open admin panel</Link></Button>
          <Button asChild variant="outline"><Link href="/">Back home</Link></Button>
        </div>
      </div>
    );
  }
  const kind = searchParams.kind === "vendor" ? "vendor" : "hall";
  return (
    <div>
      <section className="border-b border-line bg-cream py-10 text-center">
        <div className="container">
          <p className="eyebrow">For halls & vendors</p>
          <h1 className="mt-2 text-3xl md:text-4xl">List your business on Rasm</h1>
          <OrnamentDivider className="mt-4" />
          <p className="section-sub text-sm">Get bookings with a 25% advance already paid. Listings go live after a quick review.</p>
        </div>
      </section>
      <div className="container max-w-2xl py-10">
        <div className="mb-6 grid grid-cols-2 gap-2">
          <Link href="/list-your-business" className={`rounded-[5px] border p-3 text-center font-bold ${kind === "hall" ? "border-maroon bg-maroon text-ivory" : "border-line bg-white text-maroon"}`}>I own a marriage hall</Link>
          <Link href="/list-your-business?kind=vendor" className={`rounded-[5px] border p-3 text-center font-bold ${kind === "vendor" ? "border-maroon bg-maroon text-ivory" : "border-line bg-white text-maroon"}`}>I offer a wedding service</Link>
        </div>
        <form action={listBusinessAction} className="grid gap-4 rounded-[6px] border border-line bg-white p-6 sm:grid-cols-2">
          <input type="hidden" name="kind" value={kind} />
          <div className="sm:col-span-2"><label className="label" htmlFor="bn">Business name</label><input id="bn" name="businessName" required className="field" placeholder={kind === "hall" ? "e.g. Sheesh Mahal Banquets" : "e.g. Shutter Shaadi"} /></div>
          <div><label className="label" htmlFor="cn">Your name</label><input id="cn" name="contactName" required className="field" /></div>
          <div><label className="label" htmlFor="ph">Phone</label><input id="ph" name="phone" className="field" placeholder="03XX XXXXXXX" /></div>
          <div><label className="label" htmlFor="em">Email</label><input id="em" name="email" type="email" required className="field" /></div>
          <div>
            <label className="label" htmlFor="ct">City</label>
            <select id="ct" name="city" className="field">{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          {kind === "hall" ? (
            <>
              <div><label className="label" htmlFor="ar">Area</label><input id="ar" name="area" className="field" placeholder="e.g. Gulberg" /></div>
              <div>
                <label className="label" htmlFor="tp">Type</label>
                <select id="tp" name="type" className="field">{HALL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
              </div>
              <div><label className="label" htmlFor="cmin">Min guests</label><input id="cmin" name="capacityMin" type="number" defaultValue={150} className="field" /></div>
              <div><label className="label" htmlFor="cmax">Max guests</label><input id="cmax" name="capacityMax" type="number" defaultValue={800} className="field" /></div>
              <div><label className="label" htmlFor="pph">Price per head (Rs)</label><input id="pph" name="pricePerHead" type="number" defaultValue={2800} className="field" /></div>
              <div><label className="label" htmlFor="bp">Hall fee per event (Rs)</label><input id="bp" name="basePrice" type="number" defaultValue={300000} className="field" /></div>
            </>
          ) : (
            <>
              <div>
                <label className="label" htmlFor="cat">Service</label>
                <select id="cat" name="category" className="field">{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
              </div>
              <div><label className="label" htmlFor="sp">Starting price (Rs)</label><input id="sp" name="startingPrice" type="number" defaultValue={50000} className="field" /></div>
            </>
          )}
          <div className="sm:col-span-2"><label className="label" htmlFor="ds">Description</label><textarea id="ds" name="description" className="field h-auto min-h-[100px] py-2.5" /></div>
          <Button className="sm:col-span-2" size="lg">Submit for review</Button>
        </form>
      </div>
    </div>
  );
}
