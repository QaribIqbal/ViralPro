"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { ProBadge } from "@/components/ui/AiVisuals";
import { Card } from "@/components/ui/Card";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/Motion";
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
        <Reveal className="vp-glass-panel relative overflow-hidden rounded-[28px] border border-[var(--border)] p-7 sm:p-9">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30%] bg-[radial-gradient(circle_at_70%_50%,var(--cta),transparent_60%)] opacity-[0.08]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <ProBadge variant="glow" className="uppercase tracking-[0.12em]">Insight Engine</ProBadge>
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

            <div className="hidden relative h-[250px] overflow-hidden rounded-3xl border-transparent dark:border-[var(--border)] bg-transparent dark:bg-[#080B11] lg:block">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--cta-soft)_0%,transparent_60%)] opacity-40" />

              {/* Motherboard Traces */}
              <svg viewBox="0 0 400 250" className="absolute left-1/2 top-1/2 h-[250px] w-[400px] -translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-[var(--border-strong)]">
                {/* Static traces */}
                <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <path d="M40 50 h 60 l 40 40 h 30" />
                  <path d="M20 90 h 60 l 20 20 h 70" />
                  <path d="M20 160 h 60 l 20 -20 h 70" />
                  <path d="M40 200 h 60 l 40 -40 h 30" />

                  <path d="M360 50 h -60 l -40 40 h -30" />
                  <path d="M380 90 h -60 l -20 20 h -70" />
                  <path d="M380 160 h -60 l -20 -20 h -70" />
                  <path d="M360 200 h -60 l -40 -40 h -30" />

                  <circle cx="40" cy="50" r="2" fill="currentColor" />
                  <circle cx="20" cy="90" r="2" fill="currentColor" />
                  <circle cx="20" cy="160" r="2" fill="currentColor" />
                  <circle cx="40" cy="200" r="2" fill="currentColor" />
                  <circle cx="360" cy="50" r="2" fill="currentColor" />
                  <circle cx="380" cy="90" r="2" fill="currentColor" />
                  <circle cx="380" cy="160" r="2" fill="currentColor" />
                  <circle cx="360" cy="200" r="2" fill="currentColor" />
                </g>

                {/* Animated Data Streams */}
                <g fill="none" stroke="var(--ai-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                  <path d="M40 50 h 60 l 40 40 h 30" strokeDasharray="10 150" strokeDashoffset="150">
                    <animate attributeName="stroke-dashoffset" values="150;-10" dur="2s" repeatCount="indefinite" />
                  </path>
                  <path d="M20 160 h 60 l 20 -20 h 70" strokeDasharray="15 150" strokeDashoffset="150">
                    <animate attributeName="stroke-dashoffset" values="150;-15" dur="2.5s" repeatCount="indefinite" begin="1s" />
                  </path>
                  <path d="M360 50 h -60 l -40 40 h -30" strokeDasharray="10 150" strokeDashoffset="150">
                    <animate attributeName="stroke-dashoffset" values="150;-10" dur="2.2s" repeatCount="indefinite" begin="0.5s" />
                  </path>
                  <path d="M380 160 h -60 l -20 -20 h -70" strokeDasharray="12 150" strokeDashoffset="150">
                    <animate attributeName="stroke-dashoffset" values="150;-12" dur="1.8s" repeatCount="indefinite" begin="1.2s" />
                  </path>
                </g>
              </svg>

              {/* Central CPU */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-xl bg-[var(--cta)] opacity-20" style={{ animationDuration: "3s" }} />
                  <div className="vp-idle-pulse flex h-20 w-20 items-center justify-center rounded-xl border-2 border-[var(--cta)] bg-white dark:bg-[#0C101A] shadow-[0_0_40px_rgba(109,40,217,0.4)]">
                    <svg className="h-10 w-10 text-[var(--ai-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                      <rect x="9" y="9" width="6" height="6" />
                      <line x1="9" y1="1" x2="9" y2="4" />
                      <line x1="15" y1="1" x2="15" y2="4" />
                      <line x1="9" y1="20" x2="9" y2="23" />
                      <line x1="15" y1="20" x2="15" y2="23" />
                      <line x1="20" y1="9" x2="23" y2="9" />
                      <line x1="20" y1="14" x2="23" y2="14" />
                      <line x1="1" y1="9" x2="4" y2="9" />
                      <line x1="1" y1="14" x2="4" y2="14" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text)] backdrop-blur-md shadow-sm">
                  <span className="vp-badge-pulse h-1.5 w-1.5 rounded-full bg-[var(--ai-accent)]" />
                  Processor Active
                </span>
              </div>
            </div>
          </div>
        </Reveal>

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
                  <span className="vp-badge-pulse h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
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
