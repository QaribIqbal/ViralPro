"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { PricingCards } from "@/components/marketing/PricingCards";
import { homeFaqs } from "@/lib/marketing-data";

function GlowingBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cta)]/30 bg-[var(--cta)]/10 px-3 py-1 text-[13px] font-semibold tracking-wide text-[var(--cta)] backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cta)] opacity-75"></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--cta)]"></span>
      </span>
      {children}
    </div>
  );
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  const scale = useTransform(smoothProgress, [0, 0.15], [0.9, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.15], [0.3, 1]);
  const y = useTransform(smoothProgress, [0, 0.15], [100, 0]);

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-[#030509] text-white selection:bg-[var(--cta)] selection:text-white"
      ref={containerRef}
    >
      {/* Deep Space Background glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cta-soft)_0%,transparent_60%)] opacity-20 blur-[100px]" />

      <div className="dark">
        <MarketingNavbar />
      </div>

      {/* 1. The Cinematic Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-40 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <GlowingBadge>ViralPro Intelligence Engine</GlowingBadge>

          <h1 className="mt-8 max-w-5xl text-[3.5rem] font-bold leading-[1.05] tracking-tight sm:text-[5rem] lg:text-[6.5rem]">
            Content that feels <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-white to-white/30 bg-clip-text text-transparent">
              inevitable.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-400 sm:text-xl">
            An invite-only caliber workspace for elite marketing teams. Stop scaling editorial chaos. Start compounding authority with a unified intelligence engine.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/sign-up">
              <Button className="group relative h-14 overflow-hidden rounded-full bg-white px-8 text-base font-semibold text-black transition-all hover:scale-[1.02] hover:bg-slate-100 active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  Request Access
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
                    <path d="M6.5 3.5L11 8L6.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--cta)] to-[var(--ai-accent)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-20" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 2. The Awe-Inducing Scroll (Product Reveal) */}
        <motion.div
          style={{ scale, opacity, y }}
          className="relative mt-24 w-full max-w-[1200px] rounded-[32px] border border-white/10 bg-[#0A0D14]/80 p-2 shadow-[0_0_120px_rgba(var(--cta-rgb),0.15)] backdrop-blur-3xl"
        >
          <div className="absolute inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cta)]/60 to-transparent" />
          <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-[#030509] shadow-inner">
            
            {/* Mocked UI Engine Header */}
            <div className="flex items-center gap-4 border-b border-white/5 bg-white/[0.02] px-6 py-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="flex h-7 flex-1 items-center justify-center rounded-lg bg-black/40 text-[11px] tracking-wider text-white/30 shadow-inner">
                viralpro.app / intelligence-engine / processing
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Mocked UI Engine Body */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(var(--cta-rgb),0.08)_0%,transparent_70%)] p-8">
              {/* Abstract Processing Nodes */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full border-t-2 border-[var(--cta)] opacity-70" />
                  <div className="absolute inset-4 animate-[spin_4s_linear_infinite_reverse] rounded-full border-b-2 border-[var(--ai-accent)] opacity-50" />
                  <div className="vp-idle-pulse h-16 w-16 rounded-full bg-[var(--cta)] shadow-[0_0_60px_rgba(var(--cta-rgb),0.8)]" />
                </div>

                <div className="mt-12 flex gap-12">
                  {["Strategic Mapping", "Editorial Drafting", "Visual Generation"].map((label, i) => (
                    <motion.div
                      key={label}
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                        <div className="h-4 w-4 rounded-full bg-white/30" />
                      </div>
                      <p className="text-[10px] font-semibold tracking-[0.15em] text-white/40 uppercase">{label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Data Streams */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030509] to-transparent" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Awe-Inducing Credibility Scroll */}
      <section className="relative py-40">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-4xl font-light leading-[1.3] tracking-tight text-white/80 sm:text-5xl lg:text-6xl"
          >
            "It’s not just faster drafting. It’s a completely new operational model for content velocity."
          </motion.h2>
        </div>
      </section>

      {/* 4. Bento Box Feature Grid (Linear Style) */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Intelligence at every layer.</h2>
          <p className="mt-6 text-lg text-slate-400">Everything you need to dominate search, built into one seamless architecture.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
          {/* Bento 1: Large */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14] p-10 transition-colors hover:border-white/20 md:col-span-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--cta)]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="relative z-10 text-2xl font-semibold text-white">Strategic Topic Intelligence</h3>
            <p className="relative z-10 mt-3 max-w-md text-[15px] leading-relaxed text-slate-400">
              Map intent clusters and opportunity gaps before a single word is written. Every article has a reason to rank.
            </p>
            <div className="relative mt-10 flex h-48 w-full items-end gap-3 overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 shadow-inner">
              {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1, type: "spring", bounce: 0.2 }}
                  className="w-full rounded-t-sm bg-gradient-to-t from-[var(--cta)]/20 to-[var(--cta)]"
                />
              ))}
            </div>
          </motion.div>

          {/* Bento 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14] p-10 transition-colors hover:border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-[var(--ai-accent)]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="relative z-10 text-xl font-semibold text-white">Editorial-Grade AI</h3>
            <p className="relative z-10 mt-3 text-[15px] leading-relaxed text-slate-400">
              Long-form generation with strict voice controls, avoiding generic AI syntax.
            </p>
            <div className="mt-10 space-y-4">
              <div className="h-3 w-full rounded-full bg-white/5" />
              <div className="h-3 w-5/6 rounded-full bg-white/5" />
              <div className="h-3 w-4/6 rounded-full bg-[var(--ai-accent)]/50 shadow-[0_0_15px_rgba(var(--ai-accent-rgb),0.5)]" />
            </div>
          </motion.div>

          {/* Bento 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14] p-10 transition-colors hover:border-white/20"
          >
            <div className="absolute right-0 top-0 h-40 w-40 bg-[var(--warning)]/10 blur-[60px] transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="relative z-10 text-xl font-semibold text-white">Automation-Native Visuals</h3>
            <p className="relative z-10 mt-3 text-[15px] leading-relaxed text-slate-400">
              Contextual images generated directly within the drafting flow, matching your exact aspect ratios.
            </p>
          </motion.div>

          {/* Bento 4: Wide */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative flex overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14] p-10 transition-colors hover:border-white/20 md:col-span-2"
          >
            <div className="z-10 max-w-lg">
              <h3 className="text-2xl font-semibold text-white">Predictable Momentum</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
                Stop reacting to publishing deadlines. Run predictable content cycles with measurable output quality and parallel bulk generation.
              </p>
            </div>
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[30px] border-white/5 transition-transform duration-700 group-hover:scale-110" />
          </motion.div>
        </div>
      </section>

      {/* 5. Loss-Aversion Pricing Tier */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--cta)]/[0.03] to-transparent" />
        <div className="relative">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">The cost of manual execution.</h2>
            <p className="mt-6 text-lg text-slate-400">
              A 5-person editorial team costs $350k+/year. <br className="hidden sm:block" />
              ViralPro gives you their output velocity for a fraction.
            </p>
          </div>
          <div className="mt-20 dark">
            <PricingCards />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto w-full max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Questions before you scale</h2>
        </div>
        <div className="dark">
          <FaqAccordion items={homeFaqs} />
        </div>
      </section>

      {/* 6. Glowing CTA Bottom */}
      <section className="relative overflow-hidden py-40 text-center">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--cta)]/20 blur-[150px]" />

        <h2 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">Ready to dominate?</h2>
        <p className="mt-6 text-xl text-slate-400">Join the elite marketing teams compounding their growth.</p>

        <div className="mt-12">
          <Link href="/sign-up">
            <Button className="h-16 rounded-full bg-white px-12 text-lg font-bold text-black shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95">
              Secure Your Access
            </Button>
          </Link>
        </div>
      </section>

      <div className="dark">
        <MarketingFooter />
      </div>
    </main>
  );
}
