import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const byVariant: Record<ButtonVariant, string> = {
  primary:
    "border border-[color:color-mix(in_srgb,var(--primary)_22%,black)] bg-[var(--cta)] text-white shadow-[0_2px_0_0_rgba(15,23,42,0.28)] hover:bg-[var(--cta-hover)] focus-visible:ring-[var(--cta)]",
  secondary:
    "border border-[color:color-mix(in_srgb,var(--primary)_20%,black)] bg-[var(--surface-muted)] text-[var(--text)] shadow-[0_2px_0_0_rgba(15,23,42,0.18)] hover:bg-[var(--surface)] focus-visible:ring-[var(--cta)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:ring-[var(--cta)]",
  destructive:
    "border border-[color:color-mix(in_srgb,var(--destructive)_24%,black)] bg-[var(--destructive)] text-white shadow-[0_2px_0_0_rgba(127,29,29,0.3)] hover:brightness-105 focus-visible:ring-[var(--destructive)]",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${byVariant[variant]} ${className}`}
      {...props}
    />
  );
}
