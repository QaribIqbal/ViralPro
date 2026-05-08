"use client";

import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">{title}</h1>
        {subtitle ? <p className="text-sm text-[var(--text-muted)]">{subtitle}</p> : null}
      </div>
      <div className="flex gap-2">
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
