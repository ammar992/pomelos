"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn, pad2 } from "@/lib/utils";

type Item = { q: string; a: string };

/** Accessible accordion (WAI-ARIA disclosure pattern). One panel open at a time. */
export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.q} data-reveal>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-start gap-4 py-6 text-left sm:gap-6 sm:py-7"
              >
                <span className="mt-1 font-label text-xs text-subtle">{pad2(i + 1)}</span>
                <span
                  className={cn(
                    "flex-1 font-display text-lg font-medium transition-colors sm:text-xl",
                    isOpen ? "text-fg" : "text-fg/85 group-hover:text-fg",
                  )}
                >
                  {item.q}
                </span>
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500",
                    isOpen ? "rotate-45 border-accent bg-accent/10 text-accent" : "border-line-strong text-muted group-hover:border-accent/60",
                  )}
                  aria-hidden
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pr-12 pb-7 pl-8 leading-relaxed text-muted sm:pl-12">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
