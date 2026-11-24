"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useToasts } from "@/store/toast";

const ICON = { success: CheckCircle2, info: Info, warning: AlertTriangle };

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] print:hidden flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICON[t.tone ?? "success"];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[6px] border border-gold/50 bg-maroon-dark px-4 py-3 text-ivory shadow-2xl shadow-maroon-dark/30"
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${t.tone === "warning" ? "text-amber-300" : "text-gold-soft"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{t.title}</p>
                {t.body && <p className="mt-0.5 text-xs text-ivory/75">{t.body}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-ivory/60 hover:text-ivory" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
