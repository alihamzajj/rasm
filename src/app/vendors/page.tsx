"use client";
import { useTitle } from "@/lib/use-title";
import Image from "next/image";
import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { CATEGORIES, unsplash } from "@/lib/constants";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";

export default function VendorsIndex() {
  const vendors = useDemo((s) => s.db.vendors);
  const countOf = (k: string) => vendors.filter((v) => v.category === k && v.approved === "approved").length;
  useTitle("Wedding vendors");
  return (
    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Add them to your hall booking" title="Wedding vendors" sub="Every vendor shows live availability, so you only add people who are free on your date." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.key} delay={(i % 4) * 0.06}>
              <Link href={`/vendors/${c.slug}`} className="group block overflow-hidden rounded-[6px] border border-line bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={unsplash(c.image, 700)} alt={c.plural} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="text-xl">{c.plural}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{c.blurb}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gold-text">{countOf(c.key)} vendors →</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
