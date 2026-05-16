export type NavItem = { label: string; href: string };

export type HistoryItem = {
  id: string;
  title: string;
  keyword: string;
  excerpt: string;
  status: "done" | "draft";
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
};

export type ArticleStatus = "queued" | "generating" | "completed" | "failed" | "draft" | "published";

export type ContentItem = {
  id: string;
  title: string;
  keyword: string;
  status: ArticleStatus;
  updatedAt: string;
};

export type ImageItem = {
  id: string;
  title: string;
  url: string;
};

export type BillingSummary = {
  plan: string;
  renewalDate: string;
  usage: string;
};

export type DocsSection = {
  title: string;
  articles: string[];
};

export type AppSettings = {
  apiKeysConfigured: number;
  wordpressConnected: boolean;
  sitemapCount: number;
};

export type Article = {
  id: string;
  user_id: string;
  title: string | null;
  topic: string;
  primary_keyword: string | null;
  content_html: string | null;
  content_markdown: string | null;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  slug: string | null;
  word_count: number | null;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
};

export type GeneratedImage = {
  id: string;
  user_id: string;
  article_id: string | null;
  prompt: string;
  image_url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  provider: string;
  status: "queued" | "generating" | "completed" | "failed";
  width: number | null;
  height: number | null;
  aspect_ratio: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};
