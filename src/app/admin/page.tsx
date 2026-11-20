"use client";
import Image from "next/image";
import { Check, X, MapPin } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { reviewListing } from "@/lib/demo/engine";
import { categoryByKey } from "@/lib/constants";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";

export default function AdminApprovals() {
  const db = useDemo((s) => s.db);
  const apply = useDemo((s) => s.apply);
  const owner = (id: string) => db.users.find((u) => u.id === id) ?? { name: "—", email: "" };
  const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);
  const halls = db.halls.filter((h) => h.approved === "pending").sort(byNewest).map((h) => ({ ...h, owner: owner(h.ownerId) }));
  const vendors = db.vendors.filter((v) => v.approved === "pending").sort(byNewest).map((v) => ({ ...v, user: owner(v.userId), packages: db.packages.filter((p) => p.vendorId === v.id) }));
  const recentHalls = db.halls.filter((h) => h.approved !== "pending").sort(byNewest).slice(0, 5);
  const recentVendors = db.vendors.filter((v) => v.approved !== "pending").sort(byNewest).slice(0, 5);
  const queue = [
    ...halls.map((h) => ({ kind: "hall" as const, id: h.id, name: h.name, sub: `${h.type} · ${h.capacityMin}–${h.capacityMax} guests · ${formatPKR(h.pricePerHead)}/head`, city: `${h.area}, ${h.city}`, contact: `${h.owner.name} · ${h.owner.email}`, photo: h.photos[0], description: h.description, tag: "Hall" })),
    ...vendors.map((v) => ({ kind: "vendor" as const, id: v.id, name: v.businessName, sub: `from ${formatPKR(Math.min(...v.packages.map((p) => p.price)))}`, city: v.city, contact: `${v.user.name} · ${v.user.email}`, photo: v.photos[0], description: v.description, tag: categoryByKey(v.category)?.label ?? v.category })),
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl">Waiting for approval <span className="font-sans text-base text-ink-muted">({queue.length})</span></h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {queue.length === 0 && <p className="rounded-[6px] border border-dashed border-line bg-white p-6 text-sm text-ink-muted lg:col-span-2">No new applications. Submit one from “List your business”.</p>}
          {queue.map((q) => (
            <article key={q.id} className="flex gap-4 rounded-[6px] border border-gold/50 bg-white p-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[4px] bg-cream">{q.photo && <Image src={q.photo} alt="" fill sizes="112px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <Badge variant="gold">{q.tag}</Badge>
                <h3 className="mt-1 text-lg">{q.name}</h3>
                <p className="flex items-center gap-1 text-xs text-ink-muted"><MapPin className="h-3 w-3" /> {q.city}</p>
                <p className="text-xs text-ink-muted">{q.sub}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{q.description}</p>
                <p className="mt-1 text-xs text-ink-muted">Contact: {q.contact}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => apply((d) => reviewListing(d, q.kind, q.id, "approve"))}><Check /> Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => apply((d) => reviewListing(d, q.kind, q.id, "reject"))}><X /> Reject</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        {[{ title: "Recent halls", rows: recentHalls.map((h) => ({ id: h.id, name: h.name, city: h.city, status: h.approved })) }, { title: "Recent vendors", rows: recentVendors.map((v) => ({ id: v.id, name: v.businessName, city: v.city, status: v.approved })) }].map((b) => (
          <div key={b.title}>
            <h2 className="text-xl">{b.title}</h2>
            <ul className="mt-3 divide-y divide-line rounded-[6px] border border-line bg-white">
              {b.rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between p-3 text-sm"><span>{r.name} <span className="text-ink-muted">· {r.city}</span></span><StatusBadge status={r.status} /></li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
