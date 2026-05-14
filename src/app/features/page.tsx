import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { featureFaqs, featureHighlights, testimonials } from "@/lib/marketing-data";

const deepFeatures = [
  {
    title: "AI SEO Automation",
    detail:
      "Automated keyword research, competitor pattern analysis, and practical on-page recommendations aligned with search intent.",
  },
  {
    title: "Content & Blog Generator",
    detail:
      "Generate long-form articles with structured outlines, adaptive tone controls, and built-in optimization cues for rankings.",
  },
  {
    title: "AI Image Generation",
    detail:
      "Create relevant article visuals with style/aspect controls and one-click insertion into your publishing workflow.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <MarketingNavbar />

      <section className="border-b border-[var(--border)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8 vp-reveal">
          <SectionTitle
            eyebrow="Features"
            title="The leading AI-powered SEO and content automation suite"
            description="ViralPro helps teams plan, generate, review, and publish high-performing content with less operational overhead."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {deepFeatures.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {featureHighlights.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary)] text-xs font-bold text-white">{item.icon}</span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Customer Impact" title="What teams say after adopting ViralPro" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal">
              <p className="text-base text-[var(--text)]">“{item.quote}”</p>
              <p className="mt-5 text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.role}, {item.company}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionTitle eyebrow="Feature FAQ" title="Answers for technical and editorial teams" />
          <FaqAccordion items={featureFaqs} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--primary)] px-8 py-10 text-white vp-reveal">
          <h3 className="text-3xl font-semibold">Ready to run ViralPro with your team?</h3>
          <p className="mt-3 text-white/80">Start free or request a guided demo for your workflow.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sign-up"><Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 vp-shine">Start Free Trial</Button></Link>
            <Link href="/contact"><Button type="button" variant="secondary" className="border-white/30 bg-transparent text-white hover:bg-white/10">Get a Demo</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
