import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30 ${className}`}
      suppressHydrationWarning
      {...props}
    />
  );
}
