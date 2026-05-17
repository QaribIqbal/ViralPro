"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { blogPosts } from "@/lib/marketing-data";

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030509] text-white selection:bg-[var(--cta)] selection:text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--ai-accent-muted)_0%,transparent_60%)] opacity-20 blur-[100px]" />
      
      <div className="dark">
        <MarketingNavbar />
      </div>

      <section className="relative px-4 pb-20 pt-48 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-[3rem] font-bold leading-[1.1] tracking-tight sm:text-[4.5rem]">
              The ViralPro Journal.
            </h1>
            <p className="mt-8 text-lg font-light leading-relaxed text-slate-400">
              Insights, operational playbooks, and strategic deep-dives for elite marketing teams.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-32 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, i) => (
              <motion.div 
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0D14] p-2 transition-colors hover:border-white/20">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px]">
                      <div className="absolute inset-0 z-10 bg-black/20 transition-colors group-hover:bg-transparent" />
                      <Image 
                        src={post.heroImage} 
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--cta)]">
                        <span>{post.tag}</span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-white/40">{post.readTime}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold leading-snug text-white transition-colors group-hover:text-[var(--cta)]">
                        {post.title}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="dark">
        <MarketingFooter />
      </div>
    </main>
  );
}
