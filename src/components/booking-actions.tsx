"use client";
import { CalendarPlus, Printer, MessageCircle } from "lucide-react";
import { fromDateKey, formatPKR, prettyDate } from "@/lib/utils";

type Props = { code: string; eventName: string; eventDate: string; venue: string; vendors: string[]; total: number; paid: number };

const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** Share on WhatsApp, add to Google Calendar, or print a receipt. */
export function BookingActions({ code, eventName, eventDate, venue, vendors, total, paid }: Props) {
  const start = fromDateKey(eventDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const details = [`Rasm booking ${code}`, venue && `Venue: ${venue}`, vendors.length ? `Vendors: ${vendors.join(", ")}` : ""].filter(Boolean).join("\n");
  const gcal =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(eventName)}&dates=${ymd(start)}/${ymd(end)}` +
    `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(venue)}`;
  const message =
    `🎉 Our ${eventName} is booked on Rasm!\n📅 ${prettyDate(eventDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n` +
    (venue ? `🏛️ ${venue}\n` : "") +
    (vendors.length ? `✨ ${vendors.join(", ")}\n` : "") +
    `Booking ID: ${code}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const btn = "inline-flex items-center justify-center gap-2 rounded-[5px] border px-4 py-2.5 text-sm font-bold transition";
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-3 print:hidden">
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${btn} border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700`}>
        <MessageCircle className="h-4 w-4" /> Share on WhatsApp
      </a>
      <a href={gcal} target="_blank" rel="noopener noreferrer" className={`${btn} border-maroon text-maroon hover:bg-maroon hover:text-ivory`}>
        <CalendarPlus className="h-4 w-4" /> Add to calendar
      </a>
      <button onClick={() => window.print()} className={`${btn} border-maroon text-maroon hover:bg-maroon hover:text-ivory`} title={`Total ${formatPKR(total)}, paid ${formatPKR(paid)}`}>
        <Printer className="h-4 w-4" /> Print receipt
      </button>
    </div>
  );
}

/** "45 days to go" / "Tomorrow" / "Today" / "Done" chip for an event date. */
export function DaysToGo({ date, className = "" }: { date: string; className?: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((fromDateKey(date).getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return null;
  const label = days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `${days} days to go`;
  return <span className={`inline-flex items-center rounded-full bg-gold-soft/30 px-2.5 py-0.5 text-xs font-bold text-gold-text ${className}`}>{label}</span>;
}
