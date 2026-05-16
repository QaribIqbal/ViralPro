import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const byVariant: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--cta)] text-[var(--cta-foreground)] shadow-sm hover:bg-[var(--cta-hover)] focus-visible:ring-[var(--cta)]",
  secondary:
    "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] shadow-sm hover:bg-[var(--surface-muted)] focus-visible:ring-[var(--cta)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:ring-[var(--text)]",
  destructive:
    "bg-[var(--destructive)] text-white shadow-sm hover:bg-[var(--destructive-muted)] hover:text-[var(--destructive)] focus-visible:ring-[var(--destructive)]",
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 ${byVariant[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
