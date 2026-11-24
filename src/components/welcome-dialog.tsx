"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Building2, Camera, Shield, X, Sparkles, ArrowRight } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { OrnamentDivider } from "./motion/ornament-divider";
import { toast } from "@/store/toast";

const KEY = "rasm-welcome-seen";

const PATHS = [
  { icon: Heart, title: "I'm getting married", text: "Find a hall, add vendors and book it all with one advance.", user: "demo-customer", href: "/halls", tag: "Customer" },
  { icon: Building2, title: "I own a wedding hall", text: "See bookings, earnings and your calendar. Accept requests.", user: "demo-hall-owner", href: "/dashboard", tag: "Hall owner" },
  { icon: Camera, title: "I'm a wedding vendor", text: "Photographer dashboard: packages, dates and requests.", user: "demo-vendor", href: "/dashboard", tag: "Vendor" },
  { icon: Shield, title: "I run Rasm", text: "Approve listings, see every booking, set commission.", user: "demo-admin", href: "/admin", tag: "Admin" },
] as const;

/** First-visit welcome: lets a new visitor jump straight into the role they care about. */
export function WelcomeDialog() {
  const router = useRouter();
  const setUser = useDemo((s) => s.setUser);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    } catch {
      /* storage blocked: skip the welcome */
    }
  }, []);

  const close = (o: boolean) => {
    setOpen(o);
    if (!o) {
      try {
        localStorage.setItem(KEY, "1");
      } catch {}
    }
  };

  const go = (p: (typeof PATHS)[number]) => {
    setUser(p.user);
    close(false);
    router.push(p.href);
    toast(`Exploring as ${p.tag}`, "Switch roles any time from Log in.", "info");
  };

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-maroon-dark/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[8px] border border-gold/50 bg-ivory p-6 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 md:p-8">
          <Dialog.Close className="absolute right-4 top-4 rounded p-1 text-ink-muted hover:bg-cream hover:text-maroon" aria-label="Close">
            <X className="h-5 w-5" />
          </Dialog.Close>
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-gold-text">Interactive prototype</p>
          <Dialog.Title className="mt-2 text-center font-display text-3xl text-maroon md:text-4xl">Welcome to Rasm</Dialog.Title>
          <OrnamentDivider className="mt-3" />
          <Dialog.Description className="mx-auto mt-3 max-w-lg text-center text-sm text-ink-muted">
            A wedding marketplace where couples book a marriage hall and every wedding service in one booking. Everything works — nothing is real money. How would you like to explore?
          </Dialog.Description>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PATHS.map((p) => (
              <button
                key={p.user}
                onClick={() => go(p)}
                className="group flex gap-3 rounded-[6px] border border-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold bg-cream text-maroon ring-4 ring-gold/10 transition group-hover:bg-maroon group-hover:text-gold-soft">
                  <p.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-lg text-maroon">{p.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{p.text}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-gold-text">
                    Start as {p.tag.toLowerCase()} <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <button onClick={() => { close(false); router.push("/features"); }} className="inline-flex items-center gap-1.5 font-bold text-maroon hover:underline">
              <Sparkles className="h-4 w-4 text-gold" /> See all features
            </button>
            <button onClick={() => close(false)} className="font-semibold text-ink-muted hover:text-maroon">Just look around</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
