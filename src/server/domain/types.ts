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

export type ContentItem = {
  id: string;
  title: string;
  keyword: string;
  status: "published" | "draft";
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
