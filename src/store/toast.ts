"use client";
import { create } from "zustand";

export type Toast = { id: number; title: string; body?: string; tone?: "success" | "info" | "warning" };

type ToastState = { toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void };

let next = 1;
export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = next++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => get().dismiss(id), 3800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Show a short confirmation message in the corner of the screen. */
export const toast = (title: string, body?: string, tone: Toast["tone"] = "success") => useToasts.getState().push({ title, body, tone });
