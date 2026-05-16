import Link from "next/link";
import { appService } from "@/server/services/app-service";

export default function DocsPage() {
  const { sections } = appService.getDocs();

  return (
    <main className="min-h-screen text-[var(--text)]">
      <header className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-[var(--border)] vp-glass-panel px-5 py-4 sm:px-8">
        <h1 className="text-2xl font-semibold">Help Center</h1>
        <Link href="/sign-in" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Back to App</Link>
      </header>

      <div className="gap-4 p-4 lg:flex">
        <aside className="vp-glass-panel w-full rounded-3xl p-4 lg:h-[calc(100vh-8rem)] lg:w-80 lg:p-6">
          <input aria-label="Search docs" placeholder="Search docs..." className="vp-input w-full rounded-xl px-3 py-2 text-sm" />
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

        <section className="vp-glass-panel mt-4 flex-1 rounded-3xl p-6 sm:p-8 lg:mt-0">
          <h2 className="text-4xl font-semibold tracking-tight">ViralPro Documentation</h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">Guides for setup, generation workflows, integrations, and support.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-5 backdrop-blur-sm">
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
