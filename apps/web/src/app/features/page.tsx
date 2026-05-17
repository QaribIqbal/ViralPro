"use client";

import { motion } from "framer-motion";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { featureHighlights, featureFaqs } from "@/lib/marketing-data";

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030509] text-white selection:bg-[var(--cta)] selection:text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cta-soft)_0%,transparent_60%)] opacity-20 blur-[100px]" />
      
      <div className="dark">
        <MarketingNavbar />
      </div>

      <section className="relative px-4 pb-32 pt-48 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-[3rem] font-bold leading-[1.1] tracking-tight sm:text-[4.5rem]">
              The architecture of <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[var(--cta)] to-[var(--ai-accent)] bg-clip-text text-transparent">content velocity.</span>
            </h1>
            <p className="mt-8 text-lg font-light leading-relaxed text-slate-400">
              Not just an AI writer. An entire operational model designed to map, draft, and visualize your SEO strategy at scale.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-32 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {featureHighlights.map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14] p-10 transition-colors hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--cta)]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl font-bold text-white shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="relative z-10 mt-8 text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="relative z-10 mt-4 text-[15px] leading-relaxed text-slate-400">
                  {feature.summary}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Architecture Diagram */}
      <section className="relative overflow-hidden py-32 border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--cta-rgb),0.03)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Built for scale.</h2>
          <div className="mt-20 flex justify-center">
            <div className="relative flex h-[400px] w-full max-w-4xl items-center justify-center rounded-[32px] border border-white/10 bg-[#0A0D14]/50 p-8 backdrop-blur-xl">
               {/* Abstract nodes connected */}
               <div className="flex w-full items-center justify-between">
                 <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[var(--cta)]/30 bg-[var(--cta)]/10 shadow-[0_0_30px_rgba(var(--cta-rgb),0.2)]">
                   <p className="text-xs font-bold uppercase tracking-widest text-white/50">Strategy</p>
                 </div>
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-[var(--cta)]/30 to-[var(--ai-accent)]/30" />
                 <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-[var(--ai-accent)]/50 bg-[var(--ai-accent)]/10 shadow-[0_0_50px_rgba(var(--ai-accent-rgb),0.3)]">
                   <p className="text-xs font-bold uppercase tracking-widest text-white">Generation</p>
                 </div>
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-[var(--ai-accent)]/30 to-[var(--success)]/30" />
                 <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 shadow-[0_0_30px_rgba(var(--success-rgb),0.2)]">
                   <p className="text-xs font-bold uppercase tracking-widest text-white/50">Publish</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-3xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Capabilities FAQ</h2>
        </div>
        <div className="dark">
          <FaqAccordion items={featureFaqs} />
        </div>
      </section>

      <div className="dark">
        <MarketingFooter />
      </div>
    </main>
  );
}
