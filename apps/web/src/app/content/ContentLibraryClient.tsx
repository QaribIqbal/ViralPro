"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode, UIEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { apiRequest } from "@/lib/api-client";
import {
  buildHtmlExport,
  buildMarkdownExport,
  downloadTextFile,
  getArticleBaseFilename,
  type ExportableArticle,
} from "@/lib/article-export";

type ArticleStatus = "queued" | "generating" | "completed" | "failed" | "draft" | "published";

type ArticleSummary = {
  id: string;
  title: string | null;
  topic: string;
  primary_keyword: string | null;
  excerpt: string | null;
  status: ArticleStatus;
  word_count: number | null;
  seo_score: number | null;
  created_at: string;
  updated_at: string;
};

type ArticleDetail = ArticleSummary & {
  content_html: string | null;
  content_markdown: string | null;
  meta_title: string | null;
  meta_description: string | null;
  slug: string | null;
};

type ArticleDraft = {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  contentMarkdown: string;
  contentHtml: string;
  status: ArticleStatus;
};

type IconName =
  | "arrow-left"
  | "check"
  | "chevron"
  | "clock"
  | "copy"
  | "edit"
  | "external"
  | "file"
  | "focus"
  | "close"
  | "more"
  | "save"
  | "spark"
  | "trash"
  | "trend";

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const base = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow-left":
      return <svg {...base}><path d="m15 18-6-6 6-6" /><path d="M20 12H9" /></svg>;
    case "check":
      return <svg {...base}><path d="m5 12 4 4L19 6" /></svg>;
    case "chevron":
      return <svg {...base}><path d="m6 9 6 6 6-6" /></svg>;
    case "clock":
      return <svg {...base}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
    case "copy":
      return <svg {...base}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M5 15.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2v1" /></svg>;
    case "edit":
      return <svg {...base}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
    case "external":
      return <svg {...base}><path d="M14 4h6v6" /><path d="m10 14 10-10" /><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" /></svg>;
    case "file":
      return <svg {...base}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h4" /><path d="M10 13h5M10 17h5" /></svg>;
    case "focus":
      return <svg {...base}><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M21 16v3a2 2 0 0 1-2 2h-3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /></svg>;
    case "close":
      return <svg {...base}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
    case "more":
      return <svg {...base}><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></svg>;
    case "save":
      return <svg {...base}><path d="M5 3h12l2 2v16H5z" /><path d="M8 3v6h8V3" /><path d="M8 21v-7h8v7" /></svg>;
    case "spark":
      return <svg {...base}><path d="m12 3 1.8 4.4L18 9l-4.2 1.6L12 15l-1.8-4.4L6 9l4.2-1.6Z" /><path d="M5 17h3M16 18h3M12 20v2" /></svg>;
    case "trash":
      return <svg {...base}><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14" /><path d="M9 7V4h6v3" /></svg>;
    case "trend":
      return <svg {...base}><path d="m4 16 5-5 4 4 7-8" /><path d="M15 7h5v5" /></svg>;
  }
}

function toDraft(article: ArticleDetail): ArticleDraft {
  return {
    title: article.title ?? "",
    excerpt: article.excerpt ?? "",
    metaTitle: article.meta_title ?? "",
    metaDescription: article.meta_description ?? "",
    slug: article.slug ?? "",
    contentMarkdown: article.content_markdown ?? "",
    contentHtml: article.content_html ?? "",
    status: article.status,
  };
}

function toExportable(article: ArticleDetail, draft: ArticleDraft): ExportableArticle {
  return {
    title: draft.title || article.title,
    topic: article.topic,
    primary_keyword: article.primary_keyword,
    excerpt: draft.excerpt || null,
    meta_title: draft.metaTitle || null,
    meta_description: draft.metaDescription || null,
    content_html: draft.contentHtml || null,
    content_markdown: draft.contentMarkdown || null,
  };
}

function titleFor(article: ArticleSummary | ArticleDetail | null, draft?: ArticleDraft | null) {
  if (!article) return "Untitled Article";
  return draft?.title || article.title || article.topic;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(value);
}

function countWords(value: string) {
  return value.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(article: ArticleSummary | ArticleDetail | null, draft?: ArticleDraft | null) {
  const words = article?.word_count ?? countWords(draft?.contentMarkdown || draft?.contentHtml || article?.excerpt || "");
  return Math.max(1, Math.ceil(words / 225));
}

function statusClass(status: ArticleStatus) {
  if (status === "completed" || status === "published") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (status === "failed") return "border-red-400/20 bg-red-400/10 text-red-300";
  if (status === "generating" || status === "queued") return "border-cyan-300/25 bg-cyan-300/10 text-cyan-200";
  return "border-slate-400/20 bg-slate-400/10 text-slate-300";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function readerBodyHtml(article: ArticleDetail | null, draft: ArticleDraft | null) {
  if (!article || !draft || !draft.contentHtml) return "";
  if (typeof window === "undefined" || !("DOMParser" in window)) return draft.contentHtml;
  const parsed = new DOMParser().parseFromString(draft.contentHtml, "text/html");
  const body = parsed.body.innerHTML.trim();
  const html = body || draft.contentHtml;
  return parsed.body.querySelector("h1, h2") ? html : `<h1>${escapeHtml(titleFor(article, draft))}</h1>${html}`;
}

function outlineFromHtml(html: string) {
  if (typeof window === "undefined" || !html || !("DOMParser" in window)) return [];
  const parsed = new DOMParser().parseFromString(html, "text/html");
  return Array.from(parsed.body.querySelectorAll("h2, h3"))
    .slice(0, 8)
    .map((heading) => ({ text: heading.textContent?.trim() ?? "", level: heading.tagName === "H3" ? 3 : 2 }))
    .filter((item) => item.text);
}

function enhanceArticleImageFallback(root: HTMLElement | null) {
  if (!root) return;

  const images = Array.from(root.querySelectorAll("img"));
  images.forEach((image) => {
    const img = image as HTMLImageElement;

    if (!img.dataset.fallbackBound) {
      const fallback = document.createElement("span");
      fallback.className = "article-image-fallback";
      fallback.setAttribute("role", "note");
      fallback.setAttribute("aria-live", "polite");
      fallback.textContent = "Image unavailable";
      img.insertAdjacentElement("afterend", fallback);

      img.addEventListener("error", () => {
        img.dataset.imageError = "true";
      });

      img.addEventListener("load", () => {
        img.dataset.imageError = "false";
      });

      img.dataset.fallbackBound = "true";
    }

    if (img.complete && img.naturalWidth === 0) {
      img.dataset.imageError = "true";
    }
  });
}

function StatPill({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-300">
      <Icon name={icon} className="h-3.5 w-3.5 text-cyan-200" />
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ArticleThumbnail({ article }: { article: ArticleSummary }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_24%_24%,rgba(34,211,238,0.28),transparent_28%),linear-gradient(135deg,rgba(37,99,235,0.52),rgba(15,23,42,0.95)_58%,rgba(16,185,129,0.24))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">
        SEO {article.seo_score ?? "n/a"}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="mb-3 h-2 w-3/5 rounded-full bg-white/35" />
        <div className="h-2 w-4/5 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

function ArticleLibraryPanel({
  articles,
  loading,
  selectedId,
  onOpen,
  onSelect,
}: {
  articles: ArticleSummary[];
  loading: boolean;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="min-h-0 rounded-[28px] border border-white/10 bg-slate-950/78 p-4 shadow-[0_24px_80px_-48px_rgba(2,6,23,0.95)] ring-1 ring-white/[0.03] backdrop-blur-xl lg:p-5">
      <div className="mb-5 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">Content Library</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Articles</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300">{articles.length} Total</span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-245px)]">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 h-24 rounded-xl bg-white/[0.07]" />
              <div className="h-4 w-3/4 rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-1/2 rounded-full bg-white/10" />
            </div>
          ))
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <Icon name="file" className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Your library is empty</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Once you generate your first article, it will appear here with SEO insights and publishing tools.</p>
          </div>
        ) : (
          articles.map((article) => {
            const selected = selectedId === article.id;
            return (
              <motion.article
                key={article.id}
                layout
                className={`group rounded-[24px] border p-3 transition ${selected
                  ? "border-cyan-300/35 bg-cyan-300/[0.08] shadow-[0_18px_42px_-30px_rgba(34,211,238,0.72)]"
                  : "border-white/10 bg-white/[0.045] hover:border-white/18 hover:bg-white/[0.07]"
                  }`}
                whileHover={{ y: -3, scale: 1.006 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(article.id)}
                  onMouseEnter={() => onSelect(article.id)}
                  className="block w-full rounded-[18px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  <ArticleThumbnail article={article} />
                  <div className="px-1 pt-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-white">{article.title ?? article.topic}</h3>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClass(article.status)}`}>
                        {article.status}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-400">{article.excerpt || article.primary_keyword || article.topic}</p>
                  </div>
                </button>
                <div className="mt-4 flex items-center justify-between gap-3 px-1">
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span>{formatRelativeDate(article.updated_at)}</span>
                    <span>{article.word_count ?? 0} words</span>
                    <span>SEO {article.seo_score ?? "n/a"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpen(article.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    aria-label={`Open ${article.title ?? article.topic} in focus mode`}
                  >
                    <Icon name="focus" />
                  </button>
                </div>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}

function ArticleMetaPanel({
  article,
  draft,
  loading,
  dirty,
  saving,
  deleting,
  error,
  notice,
  onOpen,
  onSave,
  onExportMarkdown,
  onExportHtml,
  onDelete,
}: {
  article: ArticleDetail | null;
  draft: ArticleDraft | null;
  loading: boolean;
  dirty: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  notice: string | null;
  onOpen: () => void;
  onSave: () => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onDelete: () => void;
}) {
  if (loading && !article) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_80px_-52px_rgba(2,6,23,0.92)] backdrop-blur-xl">
        <div className="h-6 w-48 rounded-full bg-white/10" />
        <div className="mt-5 h-48 rounded-3xl bg-white/[0.06]" />
      </section>
    );
  }

  if (!article || !draft) {
    return (
      <section className="flex min-h-[520px] items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.05] p-8 text-center shadow-[0_24px_80px_-52px_rgba(2,6,23,0.92)] backdrop-blur-xl">
        <div className="max-w-md">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-300/10 text-cyan-200">
            <Icon name="spark" className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Select an article</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Pick an article from the list to view SEO performance, edit content, or export files.</p>
        </div>
      </section>
    );
  }

  const title = titleFor(article, draft);
  const score = article.seo_score ?? 0;
  const words = article.word_count ?? countWords(draft.contentMarkdown || draft.contentHtml || draft.excerpt);
  const minutes = readingMinutes(article, draft);

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_-52px_rgba(2,6,23,0.92)] ring-1 ring-white/[0.03] backdrop-blur-xl sm:p-6 xl:p-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${statusClass(draft.status)}`}>{draft.status}</span>
            <StatPill icon="clock">{minutes} min read</StatPill>
            <StatPill icon="spark">AI generated</StatPill>
          </div>
          <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{draft.excerpt || article.meta_description || "Open focus mode to review the full article in a dedicated editorial workspace."}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" className="h-10 gap-2 rounded-full bg-cyan-500 px-4 text-slate-950 hover:bg-cyan-400" onClick={onOpen}>
            <Icon name="focus" />
            Editor
          </Button>
          <Button type="button" variant="secondary" className="h-10 gap-2 rounded-full border-white/10 bg-white/[0.08] px-4 text-white hover:bg-white/[0.12]" disabled={!dirty || saving} onClick={onSave}>
            <Icon name="save" />
            {saving ? "Saving" : dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      {(error || notice) ? (
        <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>
          {error || notice}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">SEO score</p>
            <Icon name="trend" className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-white">{score || "n/a"}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-400" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-sm font-medium text-slate-400">Article length</p>
          <p className="mt-4 text-4xl font-semibold text-white">{words.toLocaleString()}</p>
          <p className="mt-3 text-sm text-slate-400">Words across a {minutes} minute read</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-sm font-medium text-slate-400">Updated</p>
          <p className="mt-4 text-3xl font-semibold text-white">{formatRelativeDate(article.updated_at)}</p>
          <p className="mt-3 text-sm text-slate-400">{formatDate(article.updated_at)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Content Preview</h3>
            <span className="text-xs text-slate-500">Snapshot</span>
          </div>
          <p className="line-clamp-4 text-sm leading-7 text-slate-300">{draft.excerpt || draft.metaDescription || draft.contentMarkdown || "Your article is ready. Open the editor to review and polish the final version."}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h3 className="text-base font-semibold text-white">Actions</h3>
          <div className="mt-4 grid gap-2">
            <button type="button" onClick={onExportMarkdown} className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.08]">Export Markdown <Icon name="external" className="h-4 w-4 text-slate-400" /></button>
            <button type="button" onClick={onExportHtml} className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.08]">Export HTML <Icon name="external" className="h-4 w-4 text-slate-400" /></button>
            <button type="button" onClick={onDelete} disabled={deleting} className="flex h-11 items-center justify-between rounded-2xl border border-red-400/15 bg-red-400/10 px-4 text-sm font-medium text-red-200 hover:bg-red-400/15 disabled:opacity-60">{deleting ? "Deleting" : "Delete Article"} <Icon name="trash" className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FocusArticleModal({
  article,
  draft,
  dirty,
  saving,
  open,
  progress,
  readerHtml,
  outline,
  editMode,
  onClose,
  onSave,
  onExportMarkdown,
  onExportHtml,
  onDelete,
  onToggleEdit,
  onScroll,
  onUpdateDraft,
}: {
  article: ArticleDetail | null;
  draft: ArticleDraft | null;
  dirty: boolean;
  saving: boolean;
  open: boolean;
  progress: number;
  readerHtml: string;
  outline: { text: string; level: number }[];
  editMode: boolean;
  onClose: () => void;
  onSave: () => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onDelete: () => void;
  onToggleEdit: () => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onUpdateDraft: <K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => void;
}) {
  const readerRef = useRef<HTMLElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!exportOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportOpen]);

  useEffect(() => {
    setPortalReady(true);
    return () => setPortalReady(false);
  }, []);

  useEffect(() => {
    if (!open || editMode) return;
    enhanceArticleImageFallback(readerRef.current);
  }, [open, editMode, readerHtml]);

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[1200] bg-slate-950/86 text-white backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} role="dialog" aria-modal="true" aria-label="Focused article reader">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(37,99,235,0.2),transparent_30%)]" />
          <div className="absolute left-0 right-0 top-0 z-20 h-1 bg-white/10">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-400" style={{ width: `${progress}%` }} />
          </div>

          <motion.div className="relative z-10 flex h-full flex-col" initial={{ y: 28, scale: 0.985 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: 0.99 }} transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}>
            <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 px-4 py-3 backdrop-blur-2xl sm:px-6">
              <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button type="button" onClick={onClose} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Back to content library">
                    <Icon name="arrow-left" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{titleFor(article, draft)}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 text-emerald-300"><Icon name="check" className="h-3.5 w-3.5" />{dirty ? "Unsaved changes" : "Saved"}</span>
                      {article ? <span>{readingMinutes(article, draft)} min read</span> : null}
                      {article?.seo_score ? <span>SEO {article.seo_score}</span> : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Close focus mode">
                    <Icon name="close" />
                  </button>
                  <div className="relative" ref={exportRef}>
                    <button
                      type="button"
                      onClick={() => setExportOpen(!exportOpen)}
                      className={`hidden h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all sm:inline-flex ${exportOpen
                        ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                        : "border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]"
                        }`}
                    >
                      Export <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform duration-200 ${exportOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {exportOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                        >
                          <button
                            onClick={() => {
                              onExportMarkdown();
                              setExportOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            <Icon name="copy" className="h-4 w-4 text-slate-400" />
                            Markdown (.md)
                          </button>
                          <button
                            onClick={() => {
                              onExportHtml();
                              setExportOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            <Icon name="external" className="h-4 w-4 text-slate-400" />
                            HTML (.html)
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button type="button" onClick={onToggleEdit} className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium ${editMode ? "border-cyan-300/40 bg-cyan-300/14 text-cyan-100" : "border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]"}`}><Icon name="edit" /><span className="hidden sm:inline">{editMode ? "Reading View" : "Edit Content"}</span></button>
                  <button type="button" onClick={onSave} disabled={!dirty || saving} className="inline-flex h-10 items-center gap-2 rounded-full bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"><Icon name="save" /><span className="hidden sm:inline">{saving ? "Saving" : "Save"}</span></button>
                  <button type="button" onClick={onDelete} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 hover:bg-red-400/12 hover:text-red-200" aria-label="More actions"><Icon name="more" /></button>
                </div>
              </div>
            </header>

            <div onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
              {!article || !draft ? (
                <div className="mx-auto mt-16 max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.05] p-8 text-center">
                  <div className="mx-auto mb-4 h-10 w-48 rounded-full bg-white/10" />
                  <div className="mx-auto h-4 w-72 rounded-full bg-white/10" />
                </div>
              ) : editMode ? (
                <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-2xl">
                    <Field label="HTML Content">
                      <textarea value={draft.contentHtml} onChange={(event) => onUpdateDraft("contentHtml", event.target.value)} className="min-h-[62vh] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/80 p-5 font-mono text-sm leading-7 text-slate-100 outline-none ring-cyan-300/30 focus:border-cyan-300/40 focus:ring-4" />
                    </Field>
                  </div>
                  <div className="space-y-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-2xl">
                    <Field label="Title"><input value={draft.title} onChange={(event) => onUpdateDraft("title", event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none focus:border-cyan-300/40" /></Field>
                    <Field label="Slug"><input value={draft.slug} onChange={(event) => onUpdateDraft("slug", event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none focus:border-cyan-300/40" /></Field>
                    <Field label="Status">
                      <select value={draft.status} onChange={(event) => onUpdateDraft("status", event.target.value as ArticleStatus)} className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-cyan-300/40">
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                        <option value="published">Published</option>
                        <option value="failed">Failed</option>
                        <option value="queued">Queued</option>
                        <option value="generating">Generating</option>
                      </select>
                    </Field>
                    <Field label="Excerpt"><textarea value={draft.excerpt} onChange={(event) => onUpdateDraft("excerpt", event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/40" /></Field>
                    <Field label="Meta description"><textarea value={draft.metaDescription} onChange={(event) => onUpdateDraft("metaDescription", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/40" /></Field>
                  </div>
                </div>
              ) : (
                <div className="mx-auto grid max-w-[1380px] gap-8 xl:grid-cols-[220px_minmax(0,900px)_220px]">
                  <aside className="hidden xl:block">
                    <div className="sticky top-8 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Outline</p>
                      {outline.length > 0 ? outline.map((item, index) => <p key={`${item.text}-${index}`} className={`${item.level === 3 ? "pl-3" : ""} mb-2 line-clamp-2 text-xs leading-5 text-slate-400`}>{item.text}</p>) : <p className="text-xs leading-5 text-slate-500">Article sections will appear here when headings are detected.</p>}
                    </div>
                  </aside>

                  <main className="min-w-0">
                    <div className="mb-8 text-center">
                      <div className="mb-4 flex flex-wrap justify-center gap-2">
                        <StatPill icon="spark">AI generated</StatPill>
                        <StatPill icon="clock">{readingMinutes(article, draft)} min read</StatPill>
                        {article.primary_keyword ? <StatPill icon="trend">{article.primary_keyword}</StatPill> : null}
                      </div>
                      <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">{titleFor(article, draft)}</h1>
                      {draft.excerpt ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">{draft.excerpt}</p> : null}
                    </div>

                    {readerHtml ? (
                      <article ref={readerRef} className="vp-focus-reader article-content" dangerouslySetInnerHTML={{ __html: readerHtml }} />
                    ) : (
                      <article ref={readerRef} className="vp-focus-reader article-content">
                        <pre className="whitespace-pre-wrap font-sans">{draft.contentMarkdown || draft.excerpt || "No article body yet."}</pre>
                      </article>
                    )}
                  </main>

                  <aside className="hidden xl:block">
                    <div className="sticky top-8 space-y-3">
                      <button type="button" onClick={onToggleEdit} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/[0.09]">Edit Content <Icon name="edit" /></button>
                      <button type="button" onClick={onExportHtml} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/[0.09]">HTML export <Icon name="external" /></button>
                      <button type="button" onClick={onExportMarkdown} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/[0.09]">Markdown <Icon name="copy" /></button>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (!portalReady) return null;
  return createPortal(modal, document.body);
}

export function ContentLibraryClient() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<ArticleDraft | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lastLoadedId = useRef<string | null>(null);

  const dirty = useMemo(() => {
    if (!draft || !savedDraft) return false;
    return JSON.stringify(draft) !== JSON.stringify(savedDraft);
  }, [draft, savedDraft]);

  const readerHtml = useMemo(() => readerBodyHtml(selectedArticle, draft), [draft, selectedArticle]);
  const outline = useMemo(() => outlineFromHtml(readerHtml), [readerHtml]);

  const loadArticles = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await apiRequest<{ items: ArticleSummary[] }>("/articles?limit=50");
      setArticles(data.items);
      setSelectedId((current) => current ?? data.items[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load articles.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadArticle = useCallback(async (articleId: string) => {
    setLoadingArticle(true);
    setError(null);
    setNotice(null);
    try {
      const article = await apiRequest<ArticleDetail>(`/articles/${articleId}`);
      const nextDraft = toDraft(article);
      lastLoadedId.current = articleId;
      setSelectedArticle(article);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load article.");
    } finally {
      setLoadingArticle(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadArticles(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadArticles]);

  useEffect(() => {
    if (!selectedId || lastLoadedId.current === selectedId) return;
    const timeout = window.setTimeout(() => void loadArticle(selectedId), 0);
    return () => window.clearTimeout(timeout);
  }, [loadArticle, selectedId]);

  useEffect(() => {
    const hasGenerating = articles.some((article) => article.status === "generating" || article.status === "queued");
    if (!hasGenerating) return;
    const interval = window.setInterval(() => {
      void loadArticles();
      if (selectedId) void loadArticle(selectedId);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [articles, loadArticle, loadArticles, selectedId]);

  useEffect(() => {
    if (!focusOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focusOpen]);

  const updateDraft = <K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setNotice(null);
  };

  const saveArticle = async () => {
    if (!selectedArticle || !draft || !dirty) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await apiRequest<ArticleDetail>(`/articles/${selectedArticle.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: draft.title || null,
          excerpt: draft.excerpt || null,
          metaTitle: draft.metaTitle || null,
          metaDescription: draft.metaDescription || null,
          slug: draft.slug || null,
          contentMarkdown: draft.contentMarkdown || null,
          contentHtml: draft.contentHtml || null,
          status: draft.status,
        }),
      });
      const nextDraft = toDraft(updated);
      setSelectedArticle(updated);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
      setArticles((current) =>
        current.map((article) =>
          article.id === updated.id
            ? { ...article, title: updated.title, excerpt: updated.excerpt, status: updated.status, updated_at: updated.updated_at, word_count: updated.word_count, seo_score: updated.seo_score }
            : article
        )
      );
      setNotice("Article saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save article.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedArticle = async () => {
    if (!selectedArticle) return;
    setDeleting(true);
    setError(null);
    try {
      const deletedId = selectedArticle.id;
      await apiRequest(`/articles/${deletedId}`, { method: "DELETE" });
      const remaining = articles.filter((article) => article.id !== deletedId);
      setArticles(remaining);
      setSelectedArticle(null);
      setDraft(null);
      setSavedDraft(null);
      lastLoadedId.current = null;
      setSelectedId(remaining[0]?.id ?? null);
      setNotice("Article deleted.");
      setShowDeleteModal(false);
      setFocusOpen(false);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete article.");
    } finally {
      setDeleting(false);
    }
  };

  const exportMarkdown = () => {
    if (!selectedArticle || !draft) return;
    const exportable = toExportable(selectedArticle, draft);
    downloadTextFile(`${getArticleBaseFilename(exportable)}.md`, buildMarkdownExport(exportable), "text/markdown;charset=utf-8");
  };

  const exportHtml = () => {
    if (!selectedArticle || !draft) return;
    const exportable = toExportable(selectedArticle, draft);
    downloadTextFile(`${getArticleBaseFilename(exportable)}.html`, buildHtmlExport(exportable), "text/html;charset=utf-8");
  };

  const openArticle = (id: string) => {
    setSelectedId(id);
    setEditMode(false);
    setFocusOpen(true);
    setReadingProgress(0);
  };

  const handleReaderScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const max = target.scrollHeight - target.clientHeight;
    setReadingProgress(max <= 0 ? 0 : Math.min(100, Math.max(0, (target.scrollTop / max) * 100)));
  };

  return (
    <div className="relative min-h-[calc(100vh-92px)] overflow-hidden bg-[#0F172A]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_76%_14%,rgba(37,99,235,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]" />
      <div className="relative z-10 grid gap-6 p-4 sm:p-6 xl:grid-cols-[430px_minmax(0,1fr)] xl:p-8">
        <ArticleLibraryPanel articles={articles} loading={loadingList} selectedId={selectedId} onOpen={openArticle} onSelect={setSelectedId} />

        <ArticleMetaPanel
          article={selectedArticle}
          draft={draft}
          loading={loadingArticle}
          dirty={dirty}
          saving={saving}
          deleting={deleting}
          error={error}
          notice={notice}
          onOpen={() => selectedId && openArticle(selectedId)}
          onSave={saveArticle}
          onExportMarkdown={exportMarkdown}
          onExportHtml={exportHtml}
          onDelete={() => setShowDeleteModal(true)}
        />
      </div>

      <FocusArticleModal
        article={selectedArticle}
        draft={draft}
        dirty={dirty}
        saving={saving}
        open={focusOpen}
        progress={readingProgress}
        readerHtml={readerHtml}
        outline={outline}
        editMode={editMode}
        onClose={() => setFocusOpen(false)}
        onSave={saveArticle}
        onExportMarkdown={exportMarkdown}
        onExportHtml={exportHtml}
        onDelete={() => setShowDeleteModal(true)}
        onToggleEdit={() => setEditMode((current) => !current)}
        onScroll={handleReaderScroll}
        onUpdateDraft={updateDraft}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Article"
        variant="danger"
        description="Are you sure you want to delete this article? This action cannot be undone."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={deleteSelectedArticle} disabled={deleting}>{deleting ? "Deleting..." : "Delete Article"}</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">This article will be permanently removed from your content library.</p>
      </Modal>
    </div>
  );
}
