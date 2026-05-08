import type {
  AppSettings,
  BillingSummary,
  ContentItem,
  DashboardMetric,
  DocsSection,
  HistoryItem,
  ImageItem,
  NavItem,
} from "@/server/domain/types";

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Generate", href: "/generate" },
  { label: "Content", href: "/content" },
  { label: "Images", href: "/images" },
  { label: "Settings", href: "/settings" },
  { label: "Billing", href: "/billing" },
  { label: "Docs", href: "/docs" },
];

export const historyItems: HistoryItem[] = [
  {
    id: "h1",
    title: "Best Coffee Machines for Small Kitchens",
    keyword: "best coffee machines 2026",
    excerpt: "A practical guide to compact espresso and drip options.",
    status: "done",
  },
  {
    id: "h2",
    title: "How to Build Local SEO Content Clusters",
    keyword: "local seo content strategy",
    excerpt: "Plan topic clusters that rank in local and AI search.",
    status: "done",
  },
  {
    id: "h3",
    title: "B2B SaaS Onboarding Email Sequence",
    keyword: "b2b onboarding email sequence",
    excerpt: "Drafting a concise, conversion-focused onboarding series.",
    status: "draft",
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { id: "m1", label: "Articles", value: "128", change: "+14%" },
  { id: "m2", label: "Images", value: "42", change: "+8%" },
  { id: "m3", label: "Usage", value: "63%", change: "-3%" },
];

export const contentItems: ContentItem[] = [
  {
    id: "c1",
    title: "Local SEO for Dental Clinics",
    keyword: "dental local seo",
    status: "published",
    updatedAt: "2026-05-06",
  },
  {
    id: "c2",
    title: "AI Content Workflow for SaaS",
    keyword: "saas content workflow",
    status: "draft",
    updatedAt: "2026-05-05",
  },
];

export const imageItems: ImageItem[] = [
  { id: "i1", title: "Productivity Desk Setup", url: "https://picsum.photos/seed/viralpro-1/600/400" },
  { id: "i2", title: "SEO Dashboard Concept", url: "https://picsum.photos/seed/viralpro-2/600/400" },
  { id: "i3", title: "Marketing Team Workshop", url: "https://picsum.photos/seed/viralpro-3/600/400" },
  { id: "i4", title: "Content Strategy Board", url: "https://picsum.photos/seed/viralpro-4/600/400" },
];

export const billingSummary: BillingSummary = {
  plan: "Pro",
  renewalDate: "2026-06-08",
  usage: "63% credits used",
};

export const appSettings: AppSettings = {
  apiKeysConfigured: 2,
  wordpressConnected: true,
  sitemapCount: 3,
};

export const docsSections: DocsSection[] = [
  {
    title: "Getting Started",
    articles: ["Quick Start Guide", "Understanding the Dashboard", "Your First Article", "Account & Profile Setup"],
  },
  {
    title: "Core Features",
    articles: ["Generate Content", "Bulk Generation", "Image Generation"],
  },
  {
    title: "Advanced Features",
    articles: ["Brand Voice", "Internal Linking", "Automation"],
  },
  {
    title: "Settings & Configuration",
    articles: ["API Keys", "Sitemaps", "WordPress Connection"],
  },
];
