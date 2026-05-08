import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const byVariant: Record<ButtonVariant, string> = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-400",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-muted)] focus-visible:ring-slate-300",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] focus-visible:ring-slate-300",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${byVariant[variant]} ${className}`}
      {...props}
    />
  );
}
