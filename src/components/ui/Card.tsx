import type { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_0_0_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  );
}
