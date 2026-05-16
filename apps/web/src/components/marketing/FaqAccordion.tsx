"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/marketing-data";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <article key={item.question} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 text-left"
              onClick={() => setOpenIndex(open ? null : idx)}
            >
              <span className="text-sm font-semibold text-[var(--text)] sm:text-base">{item.question}</span>
              <span className="text-lg font-semibold text-[var(--text-muted)]">{open ? "−" : "+"}</span>
            </button>
            {open ? <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
