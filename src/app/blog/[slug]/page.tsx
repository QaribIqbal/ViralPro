import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { blogPosts, homeFaqs } from "@/lib/marketing-data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <MarketingNavbar />

      <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 vp-reveal">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">← Back to Blog</Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cta)]">{post.tag}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-[var(--text-muted)]">{post.author} • {post.authorRole} • {post.publishDate} • {post.readTime}</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] vp-card-hover">
          <Image src={post.heroImage} alt={post.title} width={1600} height={900} className="h-auto w-full object-cover" />
        </div>

        <div className="prose mt-10 max-w-none space-y-6 text-[var(--text)]">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-[var(--text-muted)]">{paragraph}</p>
          ))}
          <blockquote className="rounded-xl border-l-4 border-[var(--cta)] bg-[var(--surface)] p-4 text-base text-[var(--text)]">
            &ldquo;Execution quality compounds when your team works from one connected system instead of scattered tools.&rdquo;
          </blockquote>
        </div>
      </article>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Ready to run this workflow in your team?</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Start your free trial and build your first AI SEO pipeline in minutes.</p>
          <div className="mt-5">
            <Link href="/sign-up"><Button type="button">Start Free Trial</Button></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 vp-reveal">
          <SectionTitle eyebrow="Newsletter" title="Get more SEO operating playbooks" />
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input aria-label="Email" type="email" placeholder="you@company.com" className="h-11 flex-1 rounded-xl border border-[var(--border)] px-4 text-sm" />
            <button type="submit" className="h-11 rounded-xl bg-[var(--cta)] px-6 text-sm font-semibold text-white">Subscribe</button>
          </form>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-4xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionTitle eyebrow="FAQ" title="Reader questions" />
          <FaqAccordion items={homeFaqs.slice(0, 4)} />
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
