"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { PoweredByAiBadge } from "@/components/ui/AiVisuals";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-4 backdrop-blur-xl sm:px-6">

      {/* Left: Title block */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
          <PoweredByAiBadge />
        </div>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
        {/* Full-width gradient underline restored */}
        <div className="mt-2 h-[2px] w-full rounded-full bg-gradient-to-r from-[var(--cta)] to-transparent" />
      </div>

      {/* Right: Actions */}
      <div className="hidden items-center gap-2 md:flex">

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          suppressHydrationWarning
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            // Much stronger contrast on light mode so the moon pops
            border: isDark
              ? "1px solid rgba(251,191,36,0.3)"
              : "1px solid rgba(79,70,229,0.4)",
            background: isDark
              ? "rgba(251,191,36,0.1)"
              : "rgba(79,70,229,0.12)",
            boxShadow: isDark
              ? "0 0 8px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 0 8px rgba(79,70,229,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.transform = "scale(1.08)";
            el.style.background = isDark
              ? "rgba(251,191,36,0.18)"
              : "rgba(79,70,229,0.2)";
            el.style.boxShadow = isDark
              ? "0 0 14px rgba(251,191,36,0.3)"
              : "0 0 14px rgba(79,70,229,0.25)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.transform = "scale(1)";
            el.style.background = isDark
              ? "rgba(251,191,36,0.1)"
              : "rgba(79,70,229,0.12)";
            el.style.boxShadow = isDark
              ? "0 0 8px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 0 8px rgba(79,70,229,0.15), inset 0 1px 0 rgba(255,255,255,0.6)";
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.93)";
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          }}
        >
          <span
            suppressHydrationWarning
            style={{
              fontSize: "1.05rem",
              lineHeight: 1,
              display: "block",
              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-20deg) scale(1)",
              // Strong glow on moon so it's clearly visible on white bg
              filter: isDark
                ? "drop-shadow(0 0 4px rgba(251,191,36,0.8))"
                : "drop-shadow(0 0 3px rgba(79,70,229,0.7)) drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </span>
        </button>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "20px",
            background: "var(--border)",
            opacity: 0.6,
            flexShrink: 0,
          }}
        />

        {/* Account button */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px 6px 8px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.18s ease",
            color: "var(--text)",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
            el.style.borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "transparent";
            el.style.borderColor = "var(--border)";
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            N
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>My Account</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{ opacity: 0.4, flexShrink: 0 }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}