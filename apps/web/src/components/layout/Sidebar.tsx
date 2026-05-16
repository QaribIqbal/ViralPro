"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { NavItem } from "@/server/domain/types";

type SidebarIconName =
  | "dashboard"
  | "generate"
  | "content"
  | "images"
  | "settings"
  | "billing"
  | "docs";

function SidebarIcon({
  name,
  className = "h-4.5 w-4.5",
}: {
  name: SidebarIconName;
  className?: string;
}) {
  const base = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return <svg {...base}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></svg>;
    case "generate":
      return <svg {...base}><path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" /><path d="M5 18h4M15 18h4M12 19v2" /></svg>;
    case "content":
      return <svg {...base}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" /></svg>;
    case "images":
      return <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 15-4.5-4.5L9 18" /></svg>;
    case "settings":
      return <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" /></svg>;
    case "billing":
      return <svg {...base}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10.5h19" /><path d="M7 15h2.5M12 15h5" /></svg>;
    case "docs":
      return <svg {...base}><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v3h3" /><path d="M9 11h6M9 15h6" /></svg>;
  }
}

const iconByHref: Record<string, SidebarIconName> = {
  "/dashboard": "dashboard",
  "/generate": "generate",
  "/content": "content",
  "/images": "images",
  "/settings": "settings",
  "/billing": "billing",
  "/docs": "docs",
};

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
    <aside className="relative z-20 m-3 flex w-auto flex-col rounded-3xl border border-[var(--border)] p-4 vp-glass-panel lg:m-4 lg:h-[calc(100vh-2rem)] lg:w-64 lg:p-5 lg:sticky lg:top-4">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--cta)] shadow-sm">
          <Image
            src="/viralpro-logo.png"
            alt="ViralPro"
            width={24}
            height={24}
            className="relative z-10 brightness-0 invert"
            priority
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] leading-none">ViralPro</h2>
          <p className="mt-1 text-[10px] font-medium text-[var(--ai-accent)] uppercase tracking-wider">Creative Engine</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          const iconName = iconByHref[item.href];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-tight transition-all duration-200 ${
                active
                  ? "text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[var(--cta)] shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <SidebarIcon
                name={iconName || "dashboard"}
                className={`relative z-10 h-4.5 w-4.5 shrink-0 transition-transform duration-200 ${
                  active ? "text-white" : "text-[var(--text-muted)] group-hover:scale-105"
                }`}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 shadow-sm">
           <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Usage This Month</p>
           <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div className="h-full origin-left scale-x-[0.74] rounded-full bg-[var(--cta)] transition-transform duration-700 ease-[var(--motion-ease-premium)]" />
           </div>
           <p className="mt-2 flex justify-between text-xs font-medium text-[var(--text-muted)]">
              <span>12 / 50 Articles</span>
              <span className="text-[var(--text)]">74%</span>
           </p>
        </div>
      </div>
    </aside>
  );
}
