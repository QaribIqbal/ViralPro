"use client";

import type { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function PoweredByAiBadge({
  children = "Powered by AI",
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--ai-accent)]/30 bg-[var(--ai-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--cta)] shadow-[0_0_24px_rgba(34,211,238,0.12)] ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ai-accent)] opacity-70 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ai-accent)]" />
      </span>
      {children}
    </span>
  );
}

export function AiOrb({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={`vp-ai-orb ${className}`}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: [1, 1.06, 1],
              opacity: [0.72, 0.95, 0.72],
            }
      }
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function AiScanLine({ active = true }: { active?: boolean }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      {active ? <span className="vp-ai-scan-line" /> : null}
    </span>
  );
}

export function NeuralBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="vp-neural-grid absolute inset-0 opacity-70" />
      <AiOrb className="absolute right-[8%] top-24 h-48 w-48 opacity-50" />
      <div className="absolute left-[12%] top-[42%] h-56 w-56 rounded-full bg-[var(--cta)]/10 blur-3xl" />
    </div>
  );
}

export function AiStatus({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ai-accent)]/25 bg-[var(--surface)]/75 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] shadow-sm backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ai-accent)] shadow-[0_0_14px_var(--ai-accent)] motion-safe:animate-pulse" />
      {text}
    </div>
  );
}
