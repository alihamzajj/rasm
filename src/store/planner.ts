"use client";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export type PlannerVendor = { id: string; category: string; name: string };
export type Task = { id: string; text: string; done: boolean };
export type PlannerEvent = { id: string; name: string; date: string; venue: string; vendors: PlannerVendor[]; tasks: Task[] };

const uid = () => Math.random().toString(36).slice(2, 9);
const tasks = (list: string[]): Task[] => list.map((text) => ({ id: uid(), text, done: false }));

const DEFAULT_EVENTS: PlannerEvent[] = [
  { id: "mehndi", name: "Mehndi", date: "", venue: "", vendors: [], tasks: tasks(["Book mehndi artist", "Finalise dholki playlist", "Order yellow & green outfits", "Plan dance performances", "Arrange mehndi thaals"]) },
  { id: "baraat", name: "Baraat", date: "", venue: "", vendors: [], tasks: tasks(["Book the hall", "Book photographer & videographer", "Book decorator for stage", "Bridal makeup trial", "Arrange baraat car & dhol", "Fireworks for the entry"]) },
  { id: "walima", name: "Walima", date: "", venue: "", vendors: [], tasks: tasks(["Book walima venue", "Finalise menu with caterer", "Send invitation cards", "Plan seating", "Book makeup for walima look"]) },
];

const safeStorage: StateStorage = {
  getItem: (k) => (typeof window === "undefined" ? null : window.localStorage.getItem(k)),
  setItem: (k, v) => { if (typeof window !== "undefined") window.localStorage.setItem(k, v); },
  removeItem: (k) => { if (typeof window !== "undefined") window.localStorage.removeItem(k); },
};

type State = {
  events: PlannerEvent[];
  budget: number;
  setBudget: (n: number) => void;
  addEvent: () => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, p: Partial<Omit<PlannerEvent, "id">>) => void;
  addVendor: (eventId: string, v: Omit<PlannerVendor, "id">) => void;
  removeVendor: (eventId: string, vendorId: string) => void;
  addTask: (eventId: string, text: string) => void;
  toggleTask: (eventId: string, taskId: string) => void;
  removeTask: (eventId: string, taskId: string) => void;
  reset: () => void;
};

const mapEvent = (events: PlannerEvent[], id: string, fn: (e: PlannerEvent) => PlannerEvent) => events.map((e) => (e.id === id ? fn(e) : e));

export const usePlanner = create<State>()(
  persist(
    (set) => ({
      events: DEFAULT_EVENTS,
      budget: 9_000_000,
      setBudget: (budget) => set({ budget }),
      addEvent: () => set((s) => ({ events: [...s.events, { id: uid(), name: "New event", date: "", venue: "", vendors: [], tasks: [] }] })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      updateEvent: (id, p) => set((s) => ({ events: mapEvent(s.events, id, (e) => ({ ...e, ...p })) })),
      addVendor: (eventId, v) => set((s) => ({ events: mapEvent(s.events, eventId, (e) => ({ ...e, vendors: [...e.vendors, { ...v, id: uid() }] })) })),
      removeVendor: (eventId, vid) => set((s) => ({ events: mapEvent(s.events, eventId, (e) => ({ ...e, vendors: e.vendors.filter((v) => v.id !== vid) })) })),
      addTask: (eventId, text) => set((s) => ({ events: mapEvent(s.events, eventId, (e) => ({ ...e, tasks: [...e.tasks, { id: uid(), text, done: false }] })) })),
      toggleTask: (eventId, tid) => set((s) => ({ events: mapEvent(s.events, eventId, (e) => ({ ...e, tasks: e.tasks.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)) })) })),
      removeTask: (eventId, tid) => set((s) => ({ events: mapEvent(s.events, eventId, (e) => ({ ...e, tasks: e.tasks.filter((t) => t.id !== tid) })) })),
      reset: () => set({ events: DEFAULT_EVENTS, budget: 9_000_000 }),
    }),
    { name: "rasm-planner", storage: createJSONStorage(() => safeStorage) }
  )
);
