import { PackageBuilder } from "@/components/package-builder";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { OrnamentDivider } from "@/components/motion/ornament-divider";

export const metadata = { title: "My package" };

export default function PackagesPage() {
  return (
    <div>
      <section className="border-b border-line bg-cream py-10 text-center md:py-12">
        <div className="container">
          <p className="eyebrow">Hall + vendors, one booking</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Your wedding package</h1>
          <OrnamentDivider className="mt-4" />
        </div>
      </section>
      <div className="container py-10">
        <PackageBuilder policy={<CancellationPolicy />} />
      </div>
    </div>
  );
}
