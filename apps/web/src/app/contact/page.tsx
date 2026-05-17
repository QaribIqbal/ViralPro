"use client";

import { motion } from "framer-motion";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { contactFaqs } from "@/lib/marketing-data";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030509] text-white selection:bg-[var(--cta)] selection:text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cta-soft)_0%,transparent_60%)] opacity-20 blur-[100px]" />
      
      <div className="dark">
        <MarketingNavbar />
      </div>

      <section className="relative px-4 pb-32 pt-48 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-20 lg:grid-cols-2">
            
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-[3rem] font-bold leading-[1.1] tracking-tight sm:text-[4.5rem]">
                Start the <br />
                <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">conversation.</span>
              </h1>
              <p className="mt-8 text-lg font-light leading-relaxed text-slate-400">
                Whether you need a custom enterprise deployment or want to see a live walkthrough of the intelligence engine, we are here.
              </p>
              
              <div className="mt-16 space-y-8">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Enterprise Inquiries</h3>
                  <p className="mt-2 text-xl text-white">enterprise@viralpro.app</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Support</h3>
                  <p className="mt-2 text-xl text-white">help@viralpro.app</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <div className="rounded-[32px] border border-white/10 bg-[#0A0D14] p-10 shadow-2xl backdrop-blur-xl">
                <form className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/50">First Name</label>
                      <input type="text" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-[var(--cta)] focus:outline-none focus:ring-1 focus:ring-[var(--cta)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/50">Last Name</label>
                      <input type="text" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-[var(--cta)] focus:outline-none focus:ring-1 focus:ring-[var(--cta)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/50">Work Email</label>
                    <input type="email" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-[var(--cta)] focus:outline-none focus:ring-1 focus:ring-[var(--cta)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/50">Message</label>
                    <textarea rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-[var(--cta)] focus:outline-none focus:ring-1 focus:ring-[var(--cta)]" />
                  </div>
                  <Button className="h-14 w-full rounded-xl bg-white text-base font-semibold text-black hover:bg-slate-200">
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-3xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Contact FAQ</h2>
        </div>
        <div className="dark">
          <FaqAccordion items={contactFaqs} />
        </div>
      </section>

      <div className="dark">
        <MarketingFooter />
      </div>
    </main>
  );
}
