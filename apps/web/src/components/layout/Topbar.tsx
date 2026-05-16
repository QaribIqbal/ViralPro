"use client";

import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PoweredByAiBadge } from "@/components/ui/AiVisuals";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/82 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-[var(--text)]">{title}</h1>
          <PoweredByAiBadge />
        </div>
        {subtitle ? <p className="text-sm text-[var(--text-muted)]">{subtitle}</p> : null}
        <div className="mt-2 h-[2px] w-full rounded-full bg-gradient-to-r from-[var(--cta)] to-[var(--cta)]/0" />
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <Button variant="secondary" type="button" onClick={toggleTheme}>
          Toggle Theme
        </Button>
        <Button variant="secondary" type="button">
          Account
        </Button>
      </div>
    </header>
  );
}
