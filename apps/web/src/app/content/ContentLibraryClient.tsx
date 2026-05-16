"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { apiRequest } from "@/lib/api-client";
import {
  buildHtmlExport,
  buildMarkdownExport,
  downloadTextFile,
  getArticleBaseFilename,
  type ExportableArticle,
} from "@/lib/article-export";

type ArticleStatus =
  | "queued"
  | "generating"
  | "completed"
  | "failed"
  | "draft"
  | "published";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: ArticleStatus) {
  if (status === "completed" || status === "published") {
    return "bg-[var(--success)]/10 text-[var(--success)]";
  }
  if (status === "failed") return "bg-red-500/10 text-red-500";
  if (status === "generating" || status === "queued") {
    return "bg-blue-500/10 text-blue-500";
  }
  return "bg-[var(--text-muted)]/10 text-[var(--text-muted)]";
}

export function ContentLibraryClient() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(
    null
  );
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<ArticleDraft | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "content" | "settings">("preview");

  const dirty = useMemo(() => {
    if (!draft || !savedDraft) return false;
    return JSON.stringify(draft) !== JSON.stringify(savedDraft);
  }, [draft, savedDraft]);

  const loadArticles = useCallback(async () => {
    setLoadingList(true);
    setError(null);

    try {
      const data = await apiRequest<{
        items: ArticleSummary[];
      }>("/articles?limit=50");

      setArticles(data.items);
      setSelectedId((current) => current ?? data.items[0]?.id ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load articles."
      );
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
      setSelectedArticle(article);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load article."
      );
    } finally {
      setLoadingArticle(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadArticles();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadArticles]);

  useEffect(() => {
    if (!selectedId) return;

    const timeout = window.setTimeout(() => {
      void loadArticle(selectedId);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadArticle, selectedId]);

  useEffect(() => {
    const hasGenerating = articles.some(
      (article) => article.status === "generating" || article.status === "queued"
    );

    if (!hasGenerating) return;

    const interval = window.setInterval(() => {
      void loadArticles();
      if (selectedId) void loadArticle(selectedId);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [articles, loadArticle, loadArticles, selectedId]);

  const updateDraft = <K extends keyof ArticleDraft>(
    key: K,
    value: ArticleDraft[K]
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setNotice(null);
  };

  const saveArticle = async () => {
    if (!selectedArticle || !draft || !dirty) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await apiRequest<ArticleDetail>(
        `/articles/${selectedArticle.id}`,
        {
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
        }
      );
      const nextDraft = toDraft(updated);

      setSelectedArticle(updated);
      setDraft(nextDraft);
      setSavedDraft(nextDraft);
      setArticles((current) =>
        current.map((article) =>
          article.id === updated.id
            ? {
                ...article,
                title: updated.title,
                excerpt: updated.excerpt,
                status: updated.status,
                updated_at: updated.updated_at,
              }
            : article
        )
      );
      setNotice("Article saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save article."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedArticle = async () => {
    if (!selectedArticle) return;

    setDeleting(true);
    setError(null);

    try {
      await apiRequest(`/articles/${selectedArticle.id}`, { method: "DELETE" });
      setArticles((current) =>
        current.filter((article) => article.id !== selectedArticle.id)
      );
      setSelectedArticle(null);
      setDraft(null);
      setSavedDraft(null);
      setSelectedId((current) => {
        const next = articles.find((article) => article.id !== current);
        return next?.id ?? null;
      });
      setNotice("Article deleted.");
      setShowDeleteModal(false);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete article."
      );
    } finally {
      setDeleting(false);
    }
  };

  const exportMarkdown = () => {
    if (!selectedArticle || !draft) return;
    const exportable = toExportable(selectedArticle, draft);
    downloadTextFile(
      `${getArticleBaseFilename(exportable)}.md`,
      buildMarkdownExport(exportable),
      "text/markdown;charset=utf-8"
    );
  };

  const exportHtml = () => {
    if (!selectedArticle || !draft) return;
    const exportable = toExportable(selectedArticle, draft);
    downloadTextFile(
      `${getArticleBaseFilename(exportable)}.html`,
      buildHtmlExport(exportable),
      "text/html;charset=utf-8"
    );
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="overflow-hidden rounded-lg">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Generated articles
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Select an article to view, edit, export, or delete.
          </p>
        </div>

        <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {loadingList ? (
            <p className="px-4 py-8 text-sm text-[var(--text-muted)]">
              Loading articles...
            </p>
          ) : articles.length === 0 ? (
            <p className="px-4 py-8 text-sm text-[var(--text-muted)]">
              No generated articles yet.
            </p>
          ) : (
            articles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setSelectedId(article.id)}
                className={`block w-full border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--surface-muted)] ${
                  selectedId === article.id ? "bg-[var(--surface-muted)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {article.title ?? article.topic}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                      {article.primary_keyword ?? article.topic}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(
                      article.status
                    )}`}
                  >
                    {article.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span>{formatDate(article.updated_at)}</span>
                  {article.word_count ? <span>{article.word_count} words</span> : null}
                  {article.seo_score ? <span>SEO {article.seo_score}</span> : null}
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      <Card className="min-h-[calc(100vh-170px)] overflow-hidden rounded-lg">
        {!selectedArticle || !draft ? (
          <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">
                {loadingArticle ? "Loading article..." : "Select an article"}
              </h2>
              <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
                Open a generated article to inspect content, edit the copy, save
                changes, or export it as Markdown or HTML.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[calc(100vh-170px)] flex-col bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-[var(--text)]">
                  {draft.title || selectedArticle.topic}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Last updated {formatDate(selectedArticle.updated_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="h-9 px-3"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
                <div className="h-6 w-px bg-[var(--border)] mx-1 hidden sm:block" />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 px-3"
                  onClick={exportMarkdown}
                >
                  Export .md
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 px-3"
                  onClick={exportHtml}
                >
                  Export .html
                </Button>
                <Button
                  type="button"
                  className="h-9 px-4 sm:ml-1"
                  disabled={!dirty || saving}
                  onClick={saveArticle}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="border-b border-[var(--border)] px-5 flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "preview"
                    ? "border-cyan-400 text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "content"
                    ? "border-cyan-400 text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Edit Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "settings"
                    ? "border-cyan-400 text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Settings
              </button>
            </div>

            {error ? (
              <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-500">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="border-b border-[var(--success)]/20 bg-[var(--success)]/10 px-5 py-3 text-sm text-[var(--success)]">
                {notice}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto bg-[var(--surface-muted)]/20">
              {activeTab === "preview" && (
                <div className="h-full w-full p-4 sm:p-6 lg:p-8">
                  {draft.contentHtml ? (
                    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm ring-1 ring-black/5">
                      <iframe
                        title="Article preview"
                        sandbox=""
                        srcDoc={buildHtmlExport(toExportable(selectedArticle, draft))}
                        className="h-[calc(100vh-320px)] min-h-[600px] w-full"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto max-w-4xl rounded-xl border border-[var(--border)] bg-white p-8 shadow-sm ring-1 ring-black/5">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                        {draft.contentMarkdown || draft.excerpt || "No article body yet."}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "content" && (
                <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[var(--text)]">
                      HTML Content (Raw)
                    </span>
                    <textarea
                      value={draft.contentHtml}
                      onChange={(event) =>
                        updateDraft("contentHtml", event.target.value)
                      }
                      className="min-h-[200px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 font-mono text-sm leading-relaxed text-[var(--text)] shadow-sm transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </label>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6 lg:p-8">
                  <div className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[var(--text)] border-b border-[var(--border)] pb-3">Basic Information</h3>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                        Title
                      </span>
                      <input
                        value={draft.title}
                        onChange={(event) => updateDraft("title", event.target.value)}
                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                          Slug
                        </span>
                        <input
                          value={draft.slug}
                          onChange={(event) => updateDraft("slug", event.target.value)}
                          className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                          Status
                        </span>
                        <select
                          value={draft.status}
                          onChange={(event) =>
                            updateDraft("status", event.target.value as ArticleStatus)
                          }
                          className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        >
                          <option value="draft">Draft</option>
                          <option value="completed">Completed</option>
                          <option value="published">Published</option>
                          <option value="failed">Failed</option>
                          <option value="queued">Queued</option>
                          <option value="generating">Generating</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                        Excerpt
                      </span>
                      <textarea
                        value={draft.excerpt}
                        onChange={(event) =>
                          updateDraft("excerpt", event.target.value)
                        }
                        className="min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </label>
                  </div>

                  <div className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[var(--text)] border-b border-[var(--border)] pb-3">SEO Metadata</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                          Meta Title
                        </span>
                        <input
                          value={draft.metaTitle}
                          onChange={(event) =>
                            updateDraft("metaTitle", event.target.value)
                          }
                          className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                          Meta Description
                        </span>
                        <input
                          value={draft.metaDescription}
                          onChange={(event) =>
                            updateDraft("metaDescription", event.target.value)
                          }
                          className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Article"
        variant="danger"
        description="Are you sure you want to delete this article? This action cannot be undone."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteSelectedArticle}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Article"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          This article will be permanently removed from your content library.
        </p>
      </Modal>
    </div>
  );
}
