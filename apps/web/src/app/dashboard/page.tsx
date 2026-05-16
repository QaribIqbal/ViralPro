"use client";

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
        sub: "Your active subscription",
        tone: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30",
      },
      {
        id: "articles-generated",
        label: "Articles Created",
        value: `${articlesGenerated}/${UI_LIMITS.articles}`,
        sub: `${Math.max(UI_LIMITS.articles - articlesGenerated, 0)} available`,
        tone: "from-sky-500/15 to-sky-500/5 border-sky-500/30",
        progress: Math.min((articlesGenerated / UI_LIMITS.articles) * 100, 100),
      },
      {
        id: "images-generated",
        label: "Images Created",
        value: `${imagesGenerated}/${UI_LIMITS.images}`,
        sub: `${Math.max(UI_LIMITS.images - imagesGenerated, 0)} available`,
        tone: "from-amber-500/15 to-amber-500/5 border-amber-500/30",
        progress: Math.min((imagesGenerated / UI_LIMITS.images) * 100, 100),
      },
      {
        id: "articles-total",
        label: "Content Library",
        value: `${totalArticles}`,
        sub: "Total articles created",
        tone: "from-violet-500/15 to-violet-500/5 border-violet-500/30",
      },
      {
        id: "images-total",
        label: "Image Assets",
        value: `${totalImages}`,
        sub: "Total visuals generated",
        tone: "from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-500/30",
      },
    ],
    [plan, articlesGenerated, imagesGenerated, totalArticles, totalImages]
  );

  return (
    <AppShell>
      <Topbar title="Overview" subtitle="Monitor your usage and content library at a glance" />
      <div className="space-y-5 p-4 sm:p-6">
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/86 p-5 shadow-[0_20px_70px_-55px_rgba(15,23,42,0.7)] backdrop-blur">
          <div className="pointer-events-none absolute right-8 top-4 h-28 w-28 rounded-full bg-[var(--ai-accent)]/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <PoweredByAiBadge>Powered by AI insights</PoweredByAiBadge>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">Performance Overview</h2>
              <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                Track your content production, usage limits, and library health in real-time.
              </p>
            </div>
          </div>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.id}>
              <Card className={`relative overflow-hidden border bg-gradient-to-br ${card.tone} p-5 shadow-sm`}>
                <div className="absolute right-4 top-4 h-14 w-14 rounded-full bg-white/18 blur-2xl" />
                <p className="text-sm font-medium text-[var(--text)]/80">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{card.value}</p>
                <p className="mt-1 text-xs text-[var(--text)]/70">{card.sub}</p>
                {typeof card.progress === "number" ? (
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
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
      </div>
    </AppShell>
  );
}
