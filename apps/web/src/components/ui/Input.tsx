import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`vp-input flex h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors placeholder:text-[var(--text-muted)] focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      suppressHydrationWarning
      {...props}
    />
  );
}
