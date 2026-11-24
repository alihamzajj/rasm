"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, cartTotals } from "@/store/cart";
import { formatPKR, prettyDate } from "@/lib/utils";

const HIDE_ON = ["/packages", "/checkout", "/booking/", "/dashboard", "/admin", "/login", "/halls/", "/vendor/"];

/** Floating bar that follows the visitor once their package has something in it. */
export function PackageBar() {
  const path = usePathname();
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = (cart.hall ? 1 : 0) + cart.vendors.length;
  const show = mounted && count > 0 && !HIDE_ON.some((p) => path.startsWith(p));
  const { total, advance } = cartTotals(cart);

  return (
    <>
      {show && <div className="h-20" aria-hidden />}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-40 print:hidden border-t border-gold/40 bg-maroon-dark/95 text-ivory backdrop-blur"
          >
            <div className="container flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-soft/60">
                  <ShoppingBag className="h-5 w-5 text-gold-soft" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold">{count}</span>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {cart.hall ? cart.hall.name : "Your package"}
                    {cart.vendors.length > 0 && <span className="font-normal text-ivory/70"> + {cart.vendors.length} vendor{cart.vendors.length > 1 ? "s" : ""}</span>}
                  </p>
                  <p className="truncate text-xs text-ivory/70">
                    {cart.eventDate ? prettyDate(cart.eventDate, { day: "numeric", month: "short" }) + " · " : ""}
                    {formatPKR(total)} · advance <span className="text-gold-soft">{formatPKR(advance)}</span>
                  </p>
                </div>
              </div>
              <Link href="/packages" className="inline-flex shrink-0 items-center gap-1.5 rounded-[5px] bg-gold px-4 py-2.5 text-sm font-bold text-white hover:bg-gold-text">
                View package <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
