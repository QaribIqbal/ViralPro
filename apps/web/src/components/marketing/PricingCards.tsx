"use client";

import { useMemo, useState } from "react";
import { pricingTiers } from "@/lib/marketing-data";
import { Button } from "@/components/ui/Button";

export function PricingCards() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const savings = useMemo(() => {
    return pricingTiers.map((tier) => {
      const discount = Math.round((1 - tier.yearly / tier.monthly) * 100);
      return { name: tier.name, discount };
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${billing === "monthly" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${billing === "yearly" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}
        >
          Annual
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {pricingTiers.map((tier) => {
          const discount = savings.find((item) => item.name === tier.name)?.discount ?? 0;
          return (
            <article
              key={tier.name}
              className={`rounded-2xl border p-6 vp-card-hover vp-reveal ${tier.highlighted ? "border-[var(--cta)] bg-[var(--surface)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--cta)_30%,transparent)]" : "border-[var(--border)] bg-[var(--surface)]"}`}
            >
              <p className="text-sm font-semibold text-[var(--text)]">{tier.name}</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{tier.description}</p>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-4xl font-semibold text-[var(--text)]">${billing === "monthly" ? tier.monthly : tier.yearly}</p>
                <p className="pb-1 text-sm text-[var(--text-muted)]">/month</p>
              </div>
              {billing === "yearly" ? <p className="mt-1 text-xs font-semibold text-[var(--success)]">Save up to {discount}% annually</p> : null}
              <ul className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
                {tier.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button type="button" className="mt-6 w-full vp-shine" variant={tier.highlighted ? "primary" : "secondary"}>
                {tier.cta}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
