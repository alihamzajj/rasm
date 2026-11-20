"use client";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { ADVANCE_RATE } from "@/lib/constants";

export type CartHall = {
  hallId: string;
  name: string;
  city: string;
  photo: string;
  basePrice: number;
  packageId: string;
  packageName: string;
  perHead: number;
};

export type CartVendor = {
  vendorId: string;
  category: string;
  businessName: string;
  city: string;
  photo: string;
  packageId: string;
  packageName: string;
  price: number;
};

type CartState = {
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  guests: number;
  city: string;
  hall: CartHall | null;
  vendors: CartVendor[];
  // checkout hold
  pending: { bookingId: string; code: string; heldUntil: string } | null;
  setEvent: (p: Partial<Pick<CartState, "eventName" | "eventDate" | "guests" | "city">>) => void;
  setHall: (h: CartHall | null) => void;
  addVendor: (v: CartVendor) => void;
  removeVendor: (vendorId: string) => void;
  setPending: (p: CartState["pending"]) => void;
  clear: () => void;
};

// Safe storage: never touch localStorage on the server (Node 25 exposes a broken global).
const safeStorage: StateStorage = {
  getItem: (k) => (typeof window === "undefined" ? null : window.localStorage.getItem(k)),
  setItem: (k, v) => {
    if (typeof window !== "undefined") window.localStorage.setItem(k, v);
  },
  removeItem: (k) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(k);
  },
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      eventName: "Baraat",
      eventDate: "",
      guests: 400,
      city: "",
      hall: null,
      vendors: [],
      pending: null,
      setEvent: (p) => set(p),
      setHall: (hall) => set({ hall }),
      // one vendor per category: adding a second photographer replaces the first
      addVendor: (v) => set((s) => ({ vendors: [...s.vendors.filter((x) => x.category !== v.category), v] })),
      removeVendor: (id) => set((s) => ({ vendors: s.vendors.filter((v) => v.vendorId !== id) })),
      setPending: (pending) => set({ pending }),
      clear: () => set({ hall: null, vendors: [], pending: null }),
    }),
    { name: "rasm-cart", storage: createJSONStorage(() => safeStorage) }
  )
);

export function cartTotals(s: Pick<CartState, "hall" | "vendors" | "guests">) {
  const hallLine = s.hall ? s.hall.basePrice + s.hall.perHead * s.guests : 0;
  const vendorSum = s.vendors.reduce((a, v) => a + v.price, 0);
  const total = hallLine + vendorSum;
  return { hallLine, vendorSum, total, advance: Math.round(total * ADVANCE_RATE) };
}
