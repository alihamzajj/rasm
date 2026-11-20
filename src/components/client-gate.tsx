"use client";
import { Suspense, type ReactNode } from "react";
import { useHydrated } from "@/lib/demo/store";

function Loading() {
  return (
    <div className="container py-16" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-8 w-64 animate-pulse rounded bg-cream" />
      <div className="mx-auto mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-cream" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-[6px] bg-cream" />
        ))}
      </div>
    </div>
  );
}

/** The demo database lives in the browser, so pages render once it has loaded. */
export function ClientGate({ children }: { children: ReactNode }) {
  const ok = useHydrated();
  if (!ok) return <Loading />;
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
