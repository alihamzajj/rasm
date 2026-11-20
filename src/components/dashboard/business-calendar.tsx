"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarLegend, type DayStatus } from "../availability-calendar";
import { fromDateKey, toDateKey, prettyDate } from "@/lib/utils";
import { useDemo } from "@/lib/demo/store";
import { toggleBlockDate } from "@/lib/demo/engine";

/**
 * Owner calendar. Read-only on the overview; on the availability page, clicking a free
 * date blocks it and clicking a blocked date frees it. Booked/held dates can't be changed.
 */
export function BusinessCalendar({ days, editable, listing }: { days: DayStatus[]; editable?: boolean; listing?: { kind: "hall" | "vendor"; id: string } }) {
  const state = days;
  const [msg, setMsg] = useState<string | null>(null);
  const userId = useDemo((s) => s.userId);
  const by = (s: DayStatus["status"]) => state.filter((d) => d.status === s).map((d) => fromDateKey(d.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const onDay = (d: Date) => {
    if (!editable || !listing) return;
    const key = toDateKey(d);
    const cur = state.find((x) => x.date === key);
    if (cur && cur.status !== "blocked") {
      setMsg(`${prettyDate(key)} is ${cur.status} by a customer and can't be blocked.`);
      return;
    }
    try {
      const { db, status } = toggleBlockDate(useDemo.getState().db, userId ?? "", listing.kind, listing.id, key);
      useDemo.setState({ db });
      setMsg(`${prettyDate(key)} is now ${status === "blocked" ? "blocked" : "free"}.`);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex justify-center overflow-x-auto rounded-[6px] border border-line bg-white p-3">
        <DayPicker
          numberOfMonths={2}
          startMonth={today}
          disabled={editable ? [{ before: today }] : undefined}
          onDayClick={onDay}
          modifiers={{ booked: by("booked"), held: by("held"), blocked: by("blocked") }}
          modifiersClassNames={{ booked: "day-booked", held: "day-held", blocked: "day-blocked" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <CalendarLegend />
      </div>
      {msg && <p className="mt-2 rounded-[5px] bg-cream px-3 py-2 text-sm text-maroon" role="status">{msg}</p>}
    </div>
  );
}
