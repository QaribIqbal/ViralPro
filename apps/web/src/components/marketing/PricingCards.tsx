"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pricingTiers } from "@/lib/marketing-data";

export function PricingCards() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  return (
    <div>
      <div className="mb-16 flex items-center justify-center">
        <div className="relative flex rounded-full border border-white/10 bg-[#0A0D14] p-1 shadow-inner">
          <button
            onClick={() => setBilling("monthly")}
            className={`relative z-10 rounded-full px-6 py-2.5 text-[13px] font-semibold transition-colors ${billing === "monthly" ? "text-white" : "text-slate-400 hover:text-white"}`}
          >
            Monthly
            {billing === "monthly" && (
              <motion.div layoutId="billing-toggle" className="absolute inset-0 -z-10 rounded-full bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`relative z-10 rounded-full px-6 py-2.5 text-[13px] font-semibold transition-colors ${billing === "yearly" ? "text-white" : "text-slate-400 hover:text-white"}`}
          >
            Annually
            {billing === "yearly" && (
              <motion.div layoutId="billing-toggle" className="absolute inset-0 -z-10 rounded-full bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier, i) => {
          const isHighlighted = tier.highlighted;
          const price = billing === "monthly" ? tier.monthly : tier.yearly;
          
          return (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              key={tier.name}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden rounded-[32px] p-8 transition-colors ${
                isHighlighted
                  ? "border border-[var(--cta)]/30 bg-[#0A0D14] shadow-[0_0_80px_rgba(var(--cta-rgb),0.15)]"
                  : "border border-white/10 bg-[#0A0D14] hover:border-white/20"
              }`}
            >
              {isHighlighted && (
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--cta)]/10 to-transparent" />
              )}
              
              <div className="relative z-10 flex h-full flex-col">
                <div>
                  <p className={`text-sm font-semibold tracking-wide ${isHighlighted ? "text-[var(--cta)]" : "text-white/60"}`}>
                    {tier.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{tier.description}</p>
                  
                  <div className="mt-8 flex items-baseline gap-2">
                    <AnimatePresence mode="popLayout">
                      <motion.p 
                        key={price}
                        initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl font-bold tracking-tight text-white"
                      >
                        ${price}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-sm text-slate-400">/mo</p>
                  </div>
                  
                  {billing === "yearly" && (
                    <motion.p 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-2 text-xs font-semibold text-[var(--success)]"
                    >
                      Billed annually
                    </motion.p>
                  )}
                </div>

                <ul className="mb-10 mt-8 space-y-4 text-sm text-slate-300 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`h-1.5 w-1.5 rounded-full ${isHighlighted ? "bg-[var(--cta)]" : "bg-white/20"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`mt-auto w-full rounded-xl py-4 text-sm font-semibold transition-all active:scale-95 ${
                  isHighlighted 
                    ? "bg-[var(--cta)] text-white shadow-[0_0_20px_rgba(var(--cta-rgb),0.4)] hover:bg-[var(--cta)]/90" 
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}>
                  {tier.cta}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
