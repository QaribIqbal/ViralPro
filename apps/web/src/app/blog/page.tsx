import Image from "next/image";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { blogPosts, homeFaqs } from "@/lib/marketing-data";

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <MarketingNavbar />

      <section className="border-b border-[var(--border)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 vp-reveal">
          <SectionTitle
            eyebrow="Blog"
            title="SEO insights, AI workflows, and growth strategy"
            description="Actionable frameworks from the ViralPro team on shipping high-performing content systems."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href={`/blog/${featured.slug}`} className="group grid gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:grid-cols-2 vp-card-hover vp-reveal">
          <Image src={featured.heroImage} alt={featured.title} width={1200} height={760} className="h-72 w-full rounded-xl object-cover" />
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cta)]">Featured</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight group-hover:text-[var(--cta)]">{featured.title}</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{featured.excerpt}</p>
            <p className="mt-4 text-xs text-[var(--text-muted)]">{featured.publishDate} • {featured.readTime}</p>
          </div>
        </Link>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 vp-card-hover vp-reveal">
              <Image src={post.heroImage} alt={post.title} width={900} height={520} className="h-44 w-full rounded-lg object-cover" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cta)]">{post.tag}</p>
              <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{post.excerpt}</p>
              <p className="mt-3 text-xs text-[var(--text-muted)]">{post.readTime}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionTitle eyebrow="FAQ" title="Questions about our blog and updates" />
          <FaqAccordion items={homeFaqs.slice(0, 4)} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 vp-reveal">
          <SectionTitle eyebrow="Newsletter" title="Get weekly SEO and AI content updates" />
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input aria-label="Email" type="email" placeholder="you@company.com" className="h-11 flex-1 rounded-xl border border-[var(--border)] px-4 text-sm" />
            <button type="submit" className="h-11 rounded-xl bg-[var(--cta)] px-6 text-sm font-semibold text-white">Subscribe</button>
          </form>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
