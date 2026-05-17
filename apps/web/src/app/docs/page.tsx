import Link from "next/link";
import { appService } from "@/server/services/app-service";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";

export default function DocsPage() {
  const { sections } = appService.getDocs();

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 dark selection:bg-[var(--cta)]/30 selection:text-white">
      {/* Cinematic Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(10,20,40,0.5)_0%,transparent_60%)]" />
        <div className="absolute top-0 right-0 h-[800px] w-[800px] bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.05)_0%,transparent_50%)]" />
      </div>

      <MarketingNavbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-40 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-20 text-center">
            <span className="inline-flex h-8 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
              Knowledge Base
            </span>
            <h1 className="mt-6 text-[3rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[4.5rem]">
              Help Center
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Everything you need to know about setting up, integrating, and mastering the ViralPro Intelligence Engine.
            </p>

            <div className="mx-auto mt-10 max-w-xl relative">
              <div className="absolute inset-y-0 left-5 flex items-center">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                aria-label="Search docs" 
                placeholder="Search documentation and guides..." 
                className="w-full rounded-2xl border border-white/10 bg-[#0A0D14]/80 py-5 pl-14 pr-6 text-[15px] text-white placeholder-slate-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all focus:border-[var(--cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--cta)]/50"
              />
            </div>
          </div>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <Reveal className="hidden lg:block">
            <aside className="sticky top-32 space-y-10 rounded-[32px] border border-white/10 bg-[#0A0D14]/50 p-8 backdrop-blur-xl shadow-2xl">
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[var(--cta)]">
                    {section.title}
                  </p>
                  <ul className="space-y-3">
                    {section.articles.map((article) => (
                      <li key={article}>
                        <Link href="#" className="block text-[14px] font-medium text-slate-400 transition-colors hover:text-white">
                          {article}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          </Reveal>

          <Stagger className="space-y-8">
            {sections.map((section) => (
              <StaggerItem key={section.title}>
                <section className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14]/70 p-8 backdrop-blur-2xl transition-colors hover:border-white/20 sm:p-10 shadow-xl">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-white">{section.title}</h2>
                    <p className="mt-2 text-[15px] text-slate-400">
                      Explore {section.articles.length} detailed guides and tutorials.
                    </p>
                    
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {section.articles.map((article) => (
                        <Link 
                          href="#" 
                          key={article}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:scale-[1.02] hover:bg-white/10 hover:shadow-lg active:scale-[0.98]"
                        >
                          <span className="text-[14px] font-medium text-slate-200">
                            {article}
                          </span>
                          <svg className="h-4 w-4 text-slate-500 transition-colors group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </main>
    </div>
  );
}
