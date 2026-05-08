"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/server/domain/types";

export function Sidebar() {
  const pathname = usePathname();
  const [items, setItems] = useState<NavItem[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/navigation");
      const data = (await res.json()) as { items: NavItem[] };
      setItems(data.items);
    })();
  }, []);

  return (
    <aside className="w-full border-b border-[var(--border)] bg-[var(--surface)] p-4 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/15" />
        <div>
          <p className="text-lg font-semibold text-[var(--text)]">ViralPro</p>
          <p className="text-xs text-[var(--text-muted)]">Content OS</p>
        </div>
      </div>
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-slate-900 text-white dark:bg-indigo-500"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
