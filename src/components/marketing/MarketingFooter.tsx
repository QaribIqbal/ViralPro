import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <p className="text-lg font-semibold text-[var(--text)]">ViralPro</p>
          <p className="mt-3 max-w-md text-sm text-[var(--text-muted)]">
            AI-powered SEO and content automation suite for growth teams that need quality output at scale.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Product</p>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <Link href="/features" className="block hover:text-[var(--text)]">Features</Link>
            <Link href="/blog" className="block hover:text-[var(--text)]">Blog</Link>
            <Link href="/contact" className="block hover:text-[var(--text)]">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Company</p>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <Link href="/docs" className="block hover:text-[var(--text)]">Docs</Link>
            <Link href="/sign-in" className="block hover:text-[var(--text)]">Sign In</Link>
            <Link href="/sign-up" className="block hover:text-[var(--text)]">Sign Up</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} ViralPro. All rights reserved.
      </div>
    </footer>
  );
}
