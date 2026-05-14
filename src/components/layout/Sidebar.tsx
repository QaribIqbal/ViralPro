"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/server/domain/types";

export function Sidebar() {
  const pathname = usePathname();
  const [items, setItems] = useState<NavItem[]>([]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const res = await fetch("/api/navigation");
        if (!res.ok) return;
        const data = (await res.json()) as { items: NavItem[] };
        if (mounted) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        console.error("sidebar navigation fetch failed", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="w-full border-b border-[var(--border)] bg-[var(--surface)] p-4 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <Image
            src="/viralpro-logo.png"
            alt="ViralPro logo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
            priority
          />
        </div>
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
                  ? "bg-[var(--cta)] text-white"
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
