"use client";

import { motion } from "framer-motion";
import { PoweredByAiBadge } from "@/components/ui/AiVisuals";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-10 text-center"
    >
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ai-accent)]/70 to-transparent" />
      <PoweredByAiBadge className="mb-4" />
      <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
    </motion.div>
  );
}
