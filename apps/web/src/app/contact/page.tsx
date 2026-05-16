"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { contactFaqs } from "@/lib/marketing-data";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <MarketingNavbar />

      <section className="border-b border-[var(--border)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 vp-reveal">
          <SectionTitle
            eyebrow="Contact Us"
            title="Talk to support, sales, or product specialists"
            description="Reach out for demos, onboarding guidance, or workflow troubleshooting."
          />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-card-hover vp-reveal">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
            <p><span className="font-semibold text-[var(--text)]">Support:</span> support@viralpro.ai</p>
            <p><span className="font-semibold text-[var(--text)]">Sales:</span> sales@viralpro.ai</p>
            <p><span className="font-semibold text-[var(--text)]">Hours:</span> Mon–Fri, 9:00 AM to 6:00 PM</p>
            <p><span className="font-semibold text-[var(--text)]">Address:</span> Karachi, Pakistan (Remote-first team)</p>
          </div>
        </article>

        <form
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 vp-reveal"
          onSubmit={(event) => {
            event.preventDefault();
            setLoading(true);
            setFeedback(null);
            setTimeout(() => {
              setLoading(false);
              setFeedback("Message sent successfully. Our team will respond soon.");
            }, 1000);
          }}
        >
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <div className="mt-5 grid gap-3">
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <input id="name" required className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm" />
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" required className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm" />
            <label className="text-sm font-medium" htmlFor="subject">Subject</label>
            <input id="subject" required className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm" />
            <label className="text-sm font-medium" htmlFor="message">Message</label>
            <textarea id="message" required rows={5} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" />
            {feedback ? <p className="text-sm text-[var(--success)]">{feedback}</p> : null}
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
          </div>
        </form>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionTitle eyebrow="FAQ" title="Common support and demo questions" />
          <FaqAccordion items={contactFaqs} />
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
