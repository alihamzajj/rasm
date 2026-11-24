"use client";
import { useEffect } from "react";

/** Sets the browser tab title for client-rendered pages. */
export function useTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · Rasm` : "Rasm — Book your wedding hall and every service in one place";
  }, [title]);
}
