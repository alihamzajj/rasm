"use client";
import { useDemo, useCurrentUser } from "./store";
import { getBusiness } from "./selectors";

/** The logged-in hall owner / vendor and their listings, or null. */
export function useBusiness() {
  const db = useDemo((s) => s.db);
  const user = useCurrentUser();
  return { db, biz: getBusiness(db, user) };
}
