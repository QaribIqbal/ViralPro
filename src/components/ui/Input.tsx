import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 ${className}`}
      {...props}
    />
  );
}
