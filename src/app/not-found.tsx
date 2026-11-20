import Link from "next/link";
import { OrnamentDivider } from "@/components/motion/ornament-divider";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container max-w-lg py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-4xl">This page isn&apos;t on the guest list</h1>
      <OrnamentDivider className="mt-5" />
      <Button asChild className="mt-8"><Link href="/">Back to home</Link></Button>
    </div>
  );
}
