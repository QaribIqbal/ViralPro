"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { marketingNav } from "@/lib/marketing-data";
import { Button } from "@/components/ui/Button";

export function MarketingNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,white)]/95 backdrop-blur vp-reveal">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white">V</span>
          <span className="text-base font-semibold tracking-tight text-[var(--text)]">ViralPro</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {marketingNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${active ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" type="button" className="h-10 px-4">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button type="button" className="h-10 px-4 vp-shine">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
