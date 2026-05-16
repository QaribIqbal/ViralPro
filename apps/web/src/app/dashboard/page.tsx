"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
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
        label: "User Plan",
        value: plan,
        sub: "Current subscription tier",
        tone: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30",
      },
      {
        id: "articles-generated",
        label: "Articles Generated",
        value: `${articlesGenerated}/${UI_LIMITS.articles}`,
        sub: `${Math.max(UI_LIMITS.articles - articlesGenerated, 0)} remaining`,
        tone: "from-sky-500/15 to-sky-500/5 border-sky-500/30",
        progress: Math.min((articlesGenerated / UI_LIMITS.articles) * 100, 100),
      },
      {
        id: "images-generated",
        label: "Images Generated",
        value: `${imagesGenerated}/${UI_LIMITS.images}`,
        sub: `${Math.max(UI_LIMITS.images - imagesGenerated, 0)} remaining`,
        tone: "from-amber-500/15 to-amber-500/5 border-amber-500/30",
        progress: Math.min((imagesGenerated / UI_LIMITS.images) * 100, 100),
      },
      {
        id: "articles-total",
        label: "Articles in Library",
        value: `${totalArticles}`,
        sub: "Saved content items",
        tone: "from-violet-500/15 to-violet-500/5 border-violet-500/30",
      },
      {
        id: "images-total",
        label: "Images in Library",
        value: `${totalImages}`,
        sub: "Saved generated images",
        tone: "from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-500/30",
      },
    ],
    [plan, articlesGenerated, imagesGenerated, totalArticles, totalImages]
  );

  return (
    <AppShell>
      <Topbar title="Dashboard" subtitle="Usage and library overview" />
      <div className="space-y-4 p-4 sm:p-6">
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`border bg-gradient-to-br ${card.tone} p-5 shadow-sm`}
            >
              <p className="text-sm text-[var(--text-muted)]">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{card.value}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{card.sub}</p>
              {typeof card.progress === "number" ? (
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
