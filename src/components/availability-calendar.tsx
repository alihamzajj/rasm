"use client";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { fromDateKey, toDateKey } from "@/lib/utils";

export type DayStatus = { date: string; status: "booked" | "held" | "blocked" };

/** Calendar where booked, held and blocked dates are disabled. */
export function AvailabilityCalendar({
  unavailable,
  selected,
  onSelect,
  months = 1,
}: {
  unavailable: DayStatus[];
  selected?: string;
  onSelect?: (date: string) => void;
  months?: number;
}) {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const byStatus = (s: DayStatus["status"]) => unavailable.filter((u) => u.status === s).map((u) => fromDateKey(u.date));

  return (
    <div>
      <DayPicker
        mode="single"
        numberOfMonths={months}
        startMonth={new Date()}
        defaultMonth={selected ? fromDateKey(selected) : new Date()}
        selected={selected ? fromDateKey(selected) : undefined}
        onSelect={(d) => d && onSelect?.(toDateKey(d))}
        disabled={[{ before: tomorrow }, ...unavailable.map((u) => fromDateKey(u.date))]}
        modifiers={{ booked: byStatus("booked"), held: byStatus("held"), blocked: byStatus("blocked") }}
        modifiersClassNames={{ booked: "day-booked", held: "day-held", blocked: "day-blocked" }}
      />
      <CalendarLegend />
    </div>
  );
}

export function CalendarLegend() {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
      <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm border border-line bg-white" /> Free</span>
      <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-[#f1dede]" /> Booked</span>
      <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-[#f7ebcf]" /> Held (someone is paying)</span>
      <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-[#e9e3e4]" /> Blocked</span>
    </div>
  );
}
