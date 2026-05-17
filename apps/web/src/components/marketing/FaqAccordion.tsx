"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FaqItem } from "@/lib/marketing-data";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <motion.div 
            key={item.question} 
            initial={false}
            animate={{ backgroundColor: open ? "rgba(10, 13, 20, 1)" : "rgba(10, 13, 20, 0.4)" }}
            className="overflow-hidden rounded-2xl border border-white/10 backdrop-blur-md transition-colors hover:border-white/20"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-6 py-5 text-left"
              onClick={() => setOpenIndex(open ? null : idx)}
            >
              <span className={`text-[15px] font-semibold transition-colors ${open ? "text-white" : "text-white/80"}`}>
                {item.question}
              </span>
              <motion.span 
                animate={{ rotate: open ? 45 : 0 }} 
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-lg font-light text-white"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 }
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="px-6 pb-6 text-[15px] leading-relaxed text-slate-400">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
