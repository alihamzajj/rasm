"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { DB } from "./types";
import { freshDB } from "./seed";

const safeStorage: StateStorage = {
  getItem: (k) => (typeof window === "undefined" ? null : window.localStorage.getItem(k)),
  setItem: (k, v) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* storage full or blocked: the demo keeps working in memory */
    }
  },
  removeItem: (k) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(k);
  },
};

type DemoState = {
  db: DB;
  userId: string | null;
  /** Replace the database with the result of an engine function. */
  apply: (fn: (db: DB) => DB) => void;
  setUser: (id: string | null) => void;
  reset: () => void;
};

/**
 * The whole marketplace database, kept in this visitor's browser (localStorage).
 * Every visitor gets a private sandbox; "Reset demo" restores the original data.
 */
export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      db: freshDB(),
      userId: null,
      apply: (fn) => set((s) => ({ db: fn(s.db) })),
      setUser: (userId) => set({ userId }),
      reset: () => set({ db: freshDB(), userId: null }),
    }),
    { name: "rasm-demo-db", version: 1, storage: createJSONStorage(() => safeStorage) }
  )
);

export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

export function useCurrentUser() {
  return useDemo((s) => (s.userId ? s.db.users.find((u) => u.id === s.userId) ?? null : null));
}

/** Customer actions fall back to the demo customer so the flow never dead-ends. */
export function useCustomerId() {
  const user = useCurrentUser();
  return user?.role === "customer" ? user.id : "demo-customer";
}
