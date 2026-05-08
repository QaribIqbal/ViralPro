import type { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ${className}`}>
      {children}
    </div>
  );
}
