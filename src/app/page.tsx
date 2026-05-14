import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { PricingCards } from "@/components/marketing/PricingCards";
import { InlineBadge, SectionTitle } from "@/components/marketing/SectionTitle";
import { homeFaqs, homeFeatures, homeStats, testimonials, workflowSteps } from "@/lib/marketing-data";

export default function HomePage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <MarketingNavbar />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.12),transparent_30%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="vp-reveal">
            <InlineBadge>AI-Powered SEO & Content Automation</InlineBadge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl vp-reveal vp-delay-1">
              Grow traffic faster with a single AI content operating system.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--text-muted)] vp-reveal vp-delay-2">
              ViralPro unifies keyword strategy, blog generation, and automated image workflows so your team publishes higher-quality SEO content at scale.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 vp-reveal vp-delay-3">
              <Link href="/sign-up"><Button type="button" className="h-12 px-6 text-sm vp-shine">Start Free Trial</Button></Link>
              <Link href="/features"><Button type="button" variant="secondary" className="h-12 px-6 text-sm">Explore Features</Button></Link>
            </div>
          </div>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] vp-reveal vp-delay-2 vp-float">
            <Image
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80&auto=format&fit=crop"
              alt="ViralPro platform preview"
              width={1200}
              height={820}
              className="h-auto w-full rounded-xl border border-[var(--border)] object-cover"
              priority
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {homeStats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-[var(--surface-muted)] p-3 vp-card-hover">
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Core Benefits"
          title="Everything your content team needs to execute end-to-end"
          description="From strategy to publishing outputs, ViralPro keeps your workflow focused, measurable, and scalable."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {homeFeatures.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal" style={{ animationDelay: `${70 * (Number(feature.icon) || 1)}ms` }}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary)] text-xs font-bold text-white">{feature.icon}</span>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{feature.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="How It Works"
            title="Keyword Input → Generation → Review"
            description="A simple execution loop that reduces operational drag and improves consistency across every piece."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <article key={step.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal" style={{ animationDelay: `${80 * (idx + 1)}ms` }}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cta)]">Step {idx + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-[var(--text-muted)]">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Testimonials" title="Teams trust ViralPro to scale quality content" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal">
              <p className="text-base leading-relaxed text-[var(--text)]">“{item.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <Image src={item.avatar} alt={item.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.role}, {item.company}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Pricing" title="Plans built for creators, growth teams, and enterprises" align="center" />
          <div className="mt-10"><PricingCards /></div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--primary)] px-6 py-10 text-white sm:px-10 sm:py-12 vp-reveal">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">Start Building</p>
          <h3 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">Launch your AI SEO content pipeline today.</h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sign-up"><Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 vp-shine">Start Free Trial</Button></Link>
            <Link href="/contact"><Button type="button" variant="secondary" className="border-white/30 bg-transparent text-white hover:bg-white/10">Talk to Sales</Button></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle
              eyebrow="FAQ"
              title="Questions teams ask before they scale"
              description="Security, AI reliability, and workflow quality are all addressed with practical controls."
            />
          </div>
          <FaqAccordion items={homeFaqs} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10 vp-reveal">
          <SectionTitle
            eyebrow="Newsletter"
            title="Get SEO playbooks, product updates, and free resources"
            description="One practical update each week. No noise."
          />
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="Email"
              type="email"
              placeholder="you@company.com"
              className="h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
            />
            <Button type="submit" className="h-11 px-6">Subscribe</Button>
          </form>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
