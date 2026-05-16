"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { PoweredByAiBadge } from "@/components/ui/AiVisuals";
import { Card } from "@/components/ui/Card";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { ApiClientError, apiRequest } from "@/lib/api-client";

type UsageResponse = {
  plan: string;
  usage: {
    articlesGenerated: number;
    imagesGenerated: number;
  };
};

type ListResponse = {
  items: Array<{ id: string }>;
  total?: number;
};

const UI_LIMITS = {
  articles: 7,
  images: 4,
};

function DashIcon({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${tone}`}>
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const [plan, setPlan] = useState<string>("free");
  const [articlesGenerated, setArticlesGenerated] = useState(0);
  const [imagesGenerated, setImagesGenerated] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const [usage, articles, images] = await Promise.all([
          apiRequest<UsageResponse>("/usage"),
          apiRequest<ListResponse>("/articles?limit=1"),
          apiRequest<ListResponse>("/images?limit=1"),
        ]);

        if (!mounted) return;

        setPlan((usage.plan || "free").toUpperCase());
        setArticlesGenerated(usage.usage?.articlesGenerated ?? 0);
        setImagesGenerated(usage.usage?.imagesGenerated ?? 0);
        setTotalArticles(articles.total ?? 0);
        setTotalImages(images.total ?? 0);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiClientError && err.code === "UNAUTHORIZED") {
          setError("Please sign in to view your dashboard.");
          return;
        }
        setError("Unable to load dashboard stats.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        id: "plan",
        label: "Current Plan",
        value: plan,
        sub: "Professional tier",
        tone: "border-[var(--success)]/20 bg-[var(--success)]/8 text-[var(--success)]",
      },
      {
        id: "articles-generated",
        label: "Articles Created",
        value: `${articlesGenerated}/${UI_LIMITS.articles}`,
        sub: `${Math.max(UI_LIMITS.articles - articlesGenerated, 0)} available`,
        tone: "border-[var(--cta)]/20 bg-[var(--cta)]/8 text-[var(--cta)]",
        progress: Math.min((articlesGenerated / UI_LIMITS.articles) * 100, 100),
      },
      {
        id: "images-generated",
        label: "Images Created",
        value: `${imagesGenerated}/${UI_LIMITS.images}`,
        sub: `${Math.max(UI_LIMITS.images - imagesGenerated, 0)} available`,
        tone: "border-[var(--warning)]/20 bg-[var(--warning)]/8 text-[var(--warning)]",
        progress: Math.min((imagesGenerated / UI_LIMITS.images) * 100, 100),
      },
      {
        id: "articles-total",
        label: "Content Library",
        value: `${totalArticles}`,
        sub: "Total publications",
        tone: "border-[var(--cta)]/20 bg-[var(--cta)]/8 text-[var(--cta)]",
      },
      {
        id: "images-total",
        label: "Image Assets",
        value: `${totalImages}`,
        sub: "Total visual assets",
        tone: "border-[var(--ai-accent)]/20 bg-[var(--ai-accent)]/8 text-[var(--ai-accent)]",
      },
    ],
    [plan, articlesGenerated, imagesGenerated, totalArticles, totalImages]
  );

  return (
    <AppShell>
      <Topbar title="Overview" subtitle="Monitor your usage and content library at a glance" />
      <div className="space-y-6 p-4 sm:p-6">
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <div className="vp-glass-panel relative overflow-hidden rounded-[28px] border border-[var(--border)] p-7 sm:p-9">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30%] bg-[radial-gradient(circle_at_70%_50%,var(--cta),transparent_60%)] opacity-[0.08]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <PoweredByAiBadge className="uppercase tracking-[0.12em]">Powered by AI insights</PoweredByAiBadge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">Performance Overview</h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--text-muted)]">
                Track your content production, usage limits, and library health in real-time. Our AI engine is
                currently optimizing your content strategy.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/generate"
                  className="inline-flex h-12 items-center rounded-full bg-[var(--cta)] px-7 text-base font-semibold text-[var(--cta-foreground)] shadow-sm transition hover:bg-[var(--cta-hover)] active:scale-[0.97]"
                >
                  Generate New Article
                </Link>
                <Link
                  href="/content"
                  className="inline-flex h-12 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-7 text-base font-semibold text-[var(--text)] transition hover:border-[var(--border-strong)] active:scale-[0.97]"
                >
                  View Library
                </Link>
              </div>
            </div>

            <div className="hidden h-[250px] rounded-3xl border border-[var(--border)] bg-[var(--cta-soft,var(--cta))]/6 p-6 lg:block">
              <div className="mx-auto mt-3 flex h-48 w-48 items-center justify-center rounded-full border border-[var(--ai-accent)]/20 bg-[var(--ai-accent)]/8">
                <svg className="h-16 w-16 text-[var(--ai-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 3h7l5 5v13H7z" />
                  <path d="M14 3v5h5" />
                  <path d="M10 13h6M10 17h6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <StaggerItem key={card.id}>
              <Card className="relative h-full rounded-[22px] border border-[var(--border)] bg-[var(--surface)]/72 p-5">
                <div className="mb-4">
                  {card.id === "plan" ? (
                    <DashIcon tone={card.tone}>
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="m4 12 8-4 8 4-8 4-8-4Z" /><path d="m4 16 8 4 8-4" /><path d="m4 8 8 4 8-4" />
                      </svg>
                    </DashIcon>
                  ) : card.id === "articles-generated" ? (
                    <DashIcon tone={card.tone}>
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" />
                      </svg>
                    </DashIcon>
                  ) : card.id === "images-generated" ? (
                    <DashIcon tone={card.tone}>
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 15-4.5-4.5L9 18" />
                      </svg>
                    </DashIcon>
                  ) : card.id === "articles-total" ? (
                    <DashIcon tone={card.tone}>
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h6" />
                      </svg>
                    </DashIcon>
                  ) : (
                    <DashIcon tone={card.tone}>
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m8 15 3-3 3 2 3-3" />
                      </svg>
                    </DashIcon>
                  )}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">{card.value}</p>
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">{card.sub}</p>
                {typeof card.progress === "number" ? (
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--cta)] to-[var(--ai-accent)] transition-all duration-700"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                ) : null}
              </Card>
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger className="grid gap-4 xl:grid-cols-2">
          <StaggerItem>
            <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/72 p-0">
              <div className="border-b border-[var(--border)] px-6 py-5">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">Next Best Actions</h3>
              </div>
              <div className="space-y-2 px-6 py-5">
                <div className="flex items-start justify-between rounded-2xl px-2 py-3">
                  <div>
                    <p className="text-[15px] font-medium text-[var(--text)]">Optimize &apos;Coffee Brewing&apos; guide</p>
                    <p className="mt-1 text-[13px] text-[var(--text-muted)]">SEO score can be improved by 15%</p>
                  </div>
                  <span className="text-lg text-[var(--text-muted)]">›</span>
                </div>
                <div className="flex items-start justify-between rounded-2xl px-2 py-3">
                  <div>
                    <p className="text-[15px] font-medium text-[var(--text)]">Generate images for listicle</p>
                    <p className="mt-1 text-[13px] text-[var(--text-muted)]">Increase engagement by adding visuals</p>
                  </div>
                  <span className="text-lg text-[var(--text-muted)]">›</span>
                </div>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/72 p-0">
              <div className="border-b border-[var(--border)] px-6 py-5">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">System Status</h3>
              </div>
              <div className="px-6 py-8 text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/8 px-4 py-1.5 text-sm font-semibold text-[var(--success)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                  All Systems Operational
                </div>
                <p className="mx-auto mt-5 max-w-md text-[13px] leading-relaxed text-[var(--text-muted)]">
                  AI generation servers are performing optimally. Average generation time: 24s.
                </p>
              </div>
            </Card>
          </StaggerItem>
        </Stagger>
      </div>
    </AppShell>
  );
}
