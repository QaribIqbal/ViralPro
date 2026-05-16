import Link from "next/link";
import { appService } from "@/server/services/app-service";

export default function DocsPage() {
  const { sections } = appService.getDocs();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-8">
        <h1 className="text-2xl font-semibold">ViralPro Docs</h1>
        <Link href="/sign-in" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Back to App</Link>
      </header>

      <div className="lg:flex">
        <aside className="w-full border-b border-[var(--border)] bg-[var(--surface)] p-4 lg:h-[calc(100vh-73px)] lg:w-80 lg:border-b-0 lg:border-r lg:p-6">
          <input aria-label="Search docs" placeholder="Search docs..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm" />
          <div className="mt-5 space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-sm font-semibold">{section.title}</p>
                <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                  {section.articles.map((article) => (
                    <li key={article}>{article}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-8">
          <h2 className="text-4xl font-semibold">ViralPro Documentation</h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">Guides for setup, generation workflows, and integrations.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="text-2xl font-semibold">{section.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{section.articles.length} articles</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
