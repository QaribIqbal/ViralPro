"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-20 mx-3 mt-3 flex min-w-0 flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[var(--border)] vp-glass-panel px-4 py-3 sm:mx-4 sm:px-5">
      <div className="flex w-full min-w-0 flex-col justify-center md:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 text-lg font-semibold tracking-tight text-[var(--text)] sm:text-xl">{title}</h1>
        </div>
        {subtitle && (
          <p className="max-w-full break-words text-xs text-[var(--text-muted)] sm:text-sm">{subtitle}</p>
        )}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          suppressHydrationWarning
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition hover:bg-[var(--surface)] hover:text-[var(--text)] active:scale-95"
        >
          <span suppressHydrationWarning className="text-sm">
            {isDark ? "☀" : "☾"}
          </span>
        </button>

        <div className="h-5 w-px bg-[var(--border)]" />
        
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-[var(--surface-muted)] py-1 pl-1 pr-3 text-sm font-medium text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition hover:bg-[var(--surface)] active:scale-95"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cta)] text-[10px] font-bold text-white shadow-inner">
            N
          </span>
          <span className="tracking-tight">My Account</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-40">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
