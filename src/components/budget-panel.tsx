"use client";
import { useState } from "react";
import { Wallet, Pencil, Check } from "lucide-react";
import { usePlanner } from "@/store/planner";
import { formatPKR, formatPKRShort } from "@/lib/utils";

export type Spend = { label: string; amount: number };

// maroon → gold ramp, readable on ivory
const COLORS = ["#5B1A2B", "#8B2C43", "#B8862F", "#D9A94E", "#7A4A2E", "#C2415B", "#E9C77B", "#3A0F1B", "#A06A3A"];

/** Wedding budget: set a total, see what your Rasm bookings already cost and what's left. */
export function BudgetPanel({ spend }: { spend: Spend[] }) {
  const budget = usePlanner((s) => s.budget);
  const setBudget = usePlanner((s) => s.setBudget);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget));

  const spent = spend.reduce((a, s) => a + s.amount, 0);
  const left = budget - spent;
  const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;

  // donut segments
  const R = 52;
  const C = 2 * Math.PI * R;
  const base = Math.max(budget, spent) || 1;
  let offset = 0;
  const segs = spend.map((s, i) => {
    const len = (s.amount / base) * C;
    const seg = { ...s, color: COLORS[i % COLORS.length], len, offset };
    offset += len;
    return seg;
  });

  return (
    <div className="rounded-[6px] border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl"><Wallet className="h-5 w-5 text-gold" /> Wedding budget</h2>
        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setBudget(Math.max(0, Number(draft) || 0));
              setEditing(false);
            }}
          >
            <input autoFocus type="number" step={50000} value={draft} onChange={(e) => setDraft(e.target.value)} className="field h-9 w-36 text-sm" aria-label="Total budget in rupees" />
            <button className="rounded-[4px] bg-maroon p-2 text-ivory" aria-label="Save budget"><Check className="h-4 w-4" /></button>
          </form>
        ) : (
          <button onClick={() => { setDraft(String(budget)); setEditing(true); }} className="inline-flex items-center gap-1 text-xs font-bold text-maroon hover:underline">
            <Pencil className="h-3 w-3" /> Edit budget
          </button>
        )}
      </div>

      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-[150px] w-[150px]">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="#F3EADB" strokeWidth="16" />
            {segs.map((s) => (
              <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="16" strokeDasharray={`${s.len} ${C - s.len}`} strokeDashoffset={-s.offset}>
                <title>{`${s.label}: ${formatPKR(s.amount)}`}</title>
              </circle>
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-2xl text-maroon">{Math.round(pct)}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">used</span>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[5px] bg-cream p-2"><p className="label !mb-0 !text-[10px]">Budget</p><p className="font-bold text-maroon">{formatPKRShort(budget)}</p></div>
            <div className="rounded-[5px] bg-cream p-2"><p className="label !mb-0 !text-[10px]">Booked</p><p className="font-bold text-maroon">{formatPKRShort(spent)}</p></div>
            <div className={`rounded-[5px] p-2 ${left < 0 ? "bg-rose-50" : "bg-emerald-50"}`}>
              <p className="label !mb-0 !text-[10px]">{left < 0 ? "Over" : "Left"}</p>
              <p className={`font-bold ${left < 0 ? "text-rose-700" : "text-emerald-700"}`}>{formatPKRShort(Math.abs(left))}</p>
            </div>
          </div>
          {segs.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Book a hall or vendor and it shows up here automatically.</p>
          ) : (
            <ul className="mt-4 space-y-1.5 text-sm">
              {segs.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />{s.label}</span>
                  <span className="font-semibold">{formatPKR(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
