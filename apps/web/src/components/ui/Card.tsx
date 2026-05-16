"use client";

import type { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/motion";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={spring}
      className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_0_0_rgba(15,23,42,0.08)] ${className}`}
      style={{ willChange: reduceMotion ? undefined : "transform" }}
    >
      {children}
    </motion.div>
  );
}
