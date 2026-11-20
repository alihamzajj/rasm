"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, CalendarDays, MapPin, CheckSquare, Square, X, Download, RotateCcw } from "lucide-react";
import { usePlanner } from "@/store/planner";
import { CATEGORIES, categoryByKey } from "@/lib/constants";
import { Button } from "./ui/button";
import { prettyDate, cn } from "@/lib/utils";

type Booked = { code: string; eventName: string; eventDate: string; status: string; venue: string; vendors: string[] };

export function Planner({ booked }: { booked: Booked[] }) {
  const p = usePlanner();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string>("");
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !p.events.find((e) => e.id === active)) setActive(p.events[0]?.id ?? "");
  }, [mounted, p.events, active]);

  if (!mounted) return <div className="h-96 animate-pulse rounded-[6px] bg-cream" />;
  const ev = p.events.find((e) => e.id === active);
  const allTasks = p.events.flatMap((e) => e.tasks);
  const done = allTasks.filter((t) => t.done).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-[6px] border border-line bg-white p-4">
          <p className="label">Overall progress</p>
          <p className="font-display text-2xl text-maroon">{done}/{allTasks.length} tasks</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-gold transition-all" style={{ width: `${allTasks.length ? (done / allTasks.length) * 100 : 0}%` }} /></div>
        </div>
        <nav className="space-y-2" aria-label="Events">
          {p.events.map((e) => {
            const d = e.tasks.filter((t) => t.done).length;
            return (
              <button key={e.id} onClick={() => setActive(e.id)} className={cn("flex w-full items-center justify-between rounded-[5px] border px-4 py-3 text-left transition", e.id === active ? "border-maroon bg-maroon text-ivory" : "border-line bg-white hover:border-gold")}>
                <span>
                  <span className="block font-display text-lg">{e.name || "Untitled"}</span>
                  <span className={cn("text-xs", e.id === active ? "text-gold-soft" : "text-ink-muted")}>{e.date ? prettyDate(e.date, { day: "numeric", month: "short", year: "numeric" }) : "No date yet"}</span>
                </span>
                <span className={cn("text-xs font-bold", e.id === active ? "text-gold-soft" : "text-gold-text")}>{d}/{e.tasks.length}</span>
              </button>
            );
          })}
        </nav>
        <Button variant="outline" className="w-full" onClick={() => { p.addEvent(); setTimeout(() => setActive(usePlanner.getState().events.at(-1)!.id), 0); }}>
          <Plus /> Add an event
        </Button>
        <button onClick={() => p.reset()} className="flex w-full items-center justify-center gap-1 text-xs font-bold text-ink-muted hover:text-maroon"><RotateCcw className="h-3 w-3" /> Reset to Mehndi, Baraat, Walima</button>

        {booked.length > 0 && (
          <div className="rounded-[6px] border border-gold/40 bg-cream p-4">
            <p className="label">Your Rasm bookings</p>
            <ul className="space-y-2 text-sm">
              {booked.map((b) => (
                <li key={b.code}>
                  <p className="font-bold text-maroon">{b.eventName}</p>
                  <p className="text-xs text-ink-muted">{prettyDate(b.eventDate)} · {b.status}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <AnimatePresence mode="wait">
        {ev && (
          <motion.div key={ev.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="rounded-[6px] border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <input value={ev.name} onChange={(e) => p.updateEvent(ev.id, { name: e.target.value })} className="w-full bg-transparent font-display text-3xl text-maroon outline-none focus:border-b focus:border-gold" aria-label="Event name" />
                <button onClick={() => p.removeEvent(ev.id)} className="p-2 text-ink-muted hover:text-rose-700" aria-label="Delete event"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Date</label>
                  <input type="date" className="field" value={ev.date} onChange={(e) => p.updateEvent(ev.id, { date: e.target.value })} />
                </div>
                <div>
                  <label className="label flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Venue</label>
                  <input className="field" value={ev.venue} onChange={(e) => p.updateEvent(ev.id, { venue: e.target.value })} placeholder="Hall name or home" />
                </div>
              </div>
              {booked.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-ink-muted">Fill from a booking:</span>
                  {booked.map((b) => (
                    <button
                      key={b.code}
                      onClick={() => {
                        p.updateEvent(ev.id, { date: b.eventDate, venue: b.venue });
                        b.vendors.forEach((name) => p.addVendor(ev.id, { category: "booked", name }));
                      }}
                      className="inline-flex items-center gap-1 rounded-[4px] border border-line px-2 py-1 text-maroon hover:border-gold"
                    >
                      <Download className="h-3 w-3" /> {b.eventName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <VendorsPanel eventId={ev.id} />
              <ChecklistPanel eventId={ev.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VendorsPanel({ eventId }: { eventId: string }) {
  const p = usePlanner();
  const ev = p.events.find((e) => e.id === eventId)!;
  const [cat, setCat] = useState(CATEGORIES[0].key as string);
  const [name, setName] = useState("");
  return (
    <div className="rounded-[6px] border border-line bg-white p-5">
      <h2 className="text-xl">Vendors</h2>
      <ul className="mt-3 space-y-2">
        {ev.vendors.length === 0 && <li className="text-sm text-ink-muted">No vendors yet.</li>}
        {ev.vendors.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-2 rounded-[4px] bg-cream px-3 py-2 text-sm">
            <span><span className="eyebrow mr-2 !text-[10px]">{categoryByKey(v.category)?.label ?? "Booked"}</span>{v.name}</span>
            <button onClick={() => p.removeVendor(eventId, v.id)} className="text-ink-muted hover:text-rose-700" aria-label={`Remove ${v.name}`}><X className="h-3.5 w-3.5" /></button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          p.addVendor(eventId, { category: cat, name: name.trim() });
          setName("");
        }}
      >
        <select className="field sm:w-40" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <input className="field" placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" size="icon" className="h-11 w-full shrink-0 sm:w-11" aria-label="Add vendor"><Plus /></Button>
      </form>
      <Link href={`/vendors/${categoryByKey(cat)?.slug}`} className="mt-3 inline-block text-xs font-bold text-maroon hover:underline">Find a {categoryByKey(cat)?.label.toLowerCase()} on Rasm →</Link>
    </div>
  );
}

function ChecklistPanel({ eventId }: { eventId: string }) {
  const p = usePlanner();
  const ev = p.events.find((e) => e.id === eventId)!;
  const [text, setText] = useState("");
  return (
    <div className="rounded-[6px] border border-line bg-white p-5">
      <h2 className="text-xl">Checklist</h2>
      <ul className="mt-3 space-y-1">
        {ev.tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-2">
            <button onClick={() => p.toggleTask(eventId, t.id)} className="flex flex-1 items-center gap-2 rounded px-1 py-1.5 text-left text-sm hover:bg-cream" aria-pressed={t.done}>
              {t.done ? <CheckSquare className="h-4 w-4 shrink-0 text-gold" /> : <Square className="h-4 w-4 shrink-0 text-line" />}
              <span className={t.done ? "text-ink-muted line-through" : ""}>{t.text}</span>
            </button>
            <button onClick={() => p.removeTask(eventId, t.id)} className="text-ink-muted opacity-0 hover:text-rose-700 group-hover:opacity-100" aria-label="Remove task"><X className="h-3.5 w-3.5" /></button>
          </li>
        ))}
      </ul>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { p.addTask(eventId, text.trim()); setText(""); } }}>
        <input className="field" placeholder="Add a task" value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Add task"><Plus /></Button>
      </form>
    </div>
  );
}
