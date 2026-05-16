export type NavLink = { label: string; href: string };

export type FeatureCard = {
  title: string;
  summary: string;
  icon: string;
};

export type WorkflowStep = {
  title: string;
  detail: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
};

export type PricingTier = {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  readTime: string;
  publishDate: string;
  author: string;
  authorRole: string;
  heroImage: string;
  content: string[];
};

export const marketingNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const homeFeatures: FeatureCard[] = [
  {
    title: "AI SEO Automation",
    summary:
      "Discover high-intent opportunities with intelligent keyword clustering, topical mapping, and on-page recommendations.",
    icon: "01",
  },
  {
    title: "Content & Blog Generation",
    summary:
      "Generate long-form articles with structure, tone, and search intent alignment that your team can review and publish fast.",
    icon: "02",
  },
  {
    title: "Automated Image Creation",
    summary:
      "Create context-aware visuals for every article with one workflow, editable styles, and export-ready asset delivery.",
    icon: "03",
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Keyword Input",
    detail: "Add your target topics, audience intent, and business goals.",
  },
  {
    title: "Generate Content & Images",
    detail: "Run AI-powered workflows to build draft-ready blogs and visuals.",
  },
  {
    title: "Review & Export",
    detail: "Approve outputs, collaborate with your team, and publish faster.",
  },
];

export const homeStats: Stat[] = [
  { value: "1.2M+", label: "Content pieces generated" },
  { value: "4,800+", label: "Teams using ViralPro" },
  { value: "38%", label: "Average time saved" },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "ViralPro replaced scattered content tools with one structured workflow. We ship SEO pages in days, not weeks.",
    name: "Ayesha Khan",
    role: "Head of Growth",
    company: "Orbit Commerce",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80&auto=format&fit=crop",
  },
  {
    quote:
      "The keyword-to-blog pipeline is the cleanest we have used. Editorial quality stayed high while production doubled.",
    name: "Daniel Brooks",
    role: "Content Director",
    company: "Northline Media",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&q=80&auto=format&fit=crop",
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    monthly: 29,
    yearly: 24,
    description: "For solo creators and early teams",
    cta: "Start Free Trial",
    features: [
      "AI keyword research",
      "20 long-form generations / month",
      "Image generation workflows",
      "Basic analytics",
    ],
  },
  {
    name: "Growth",
    monthly: 99,
    yearly: 82,
    description: "For growth teams scaling content",
    cta: "Get Started",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Unlimited blog generations",
      "Team workspace and approvals",
      "Advanced SEO suggestions",
      "Automation templates",
    ],
  },
  {
    name: "Enterprise",
    monthly: 249,
    yearly: 199,
    description: "For large organizations and agencies",
    cta: "Book a Demo",
    features: [
      "Everything in Growth",
      "Custom workflows",
      "Role-based access control",
      "Priority support",
      "Dedicated success manager",
    ],
  },
];

export const homeFaqs: FaqItem[] = [
  {
    question: "How does ViralPro improve SEO performance?",
    answer:
      "ViralPro combines keyword clustering, SERP-aware briefs, and on-page recommendations so your content is created with search intent from the start.",
  },
  {
    question: "Can I control the brand voice of generated content?",
    answer:
      "Yes. You can set writing tone, audience level, and formatting rules so generated drafts stay aligned with your editorial standards.",
  },
  {
    question: "How does image generation work?",
    answer:
      "Image generation runs through your automation workflow and returns article-relevant visuals with selectable style and aspect ratio options.",
  },
  {
    question: "Is my data secure?",
    answer:
      "ViralPro uses secure API routing, controlled integrations, and environment-based secrets management to keep workflow data protected.",
  },
  {
    question: "Can multiple team members collaborate?",
    answer:
      "Yes. Shared workspaces, approvals, and permission controls are built for multi-user content operations.",
  },
];

export const featureHighlights: FeatureCard[] = [
  {
    title: "Workflow Automation",
    summary:
      "Build end-to-end publishing sequences with scheduled generation, review steps, and integration-ready triggers.",
    icon: "A",
  },
  {
    title: "Collaboration Tools",
    summary:
      "Coordinate writers, editors, and marketers with shared workspaces, approvals, and granular access controls.",
    icon: "B",
  },
  {
    title: "Analytics & Reporting",
    summary:
      "Track production velocity and SEO outcomes with live dashboards and exportable reports for stakeholders.",
    icon: "C",
  },
];

export const featureFaqs: FaqItem[] = [
  {
    question: "Do I need technical skills to set up workflows?",
    answer:
      "No. Most workflows can be configured from templates and adjusted with simple form fields and step controls.",
  },
  {
    question: "Can we connect our publishing stack?",
    answer:
      "Yes. ViralPro is designed for integration-driven workflows and can be mapped to your publishing or CMS process.",
  },
  {
    question: "Is there an approval flow before publishing?",
    answer:
      "Yes. Drafts can move through review stages so nothing publishes before editorial sign-off.",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-seo-workflow-blueprint",
    title: "AI SEO Workflow Blueprint for Lean Content Teams",
    excerpt:
      "A practical framework to go from keyword ideas to ranked content faster with fewer handoffs.",
    tag: "SEO Automation",
    readTime: "8 min read",
    publishDate: "May 10, 2026",
    author: "Qarib Iqbal",
    authorRole: "Product & Growth",
    heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop",
    content: [
      "Most teams do not fail at content because they lack ideas. They fail because execution is fragmented across too many disconnected tools.",
      "A strong AI SEO workflow starts with grouped keyword intent, not single keywords. Once intent clusters are defined, outlines and supporting visuals can be generated with consistent quality.",
      "Use a review gate before publishing. AI accelerates drafting, but human review protects brand quality and factual trust.",
    ],
  },
  {
    slug: "content-velocity-without-quality-loss",
    title: "How to Increase Content Velocity Without Losing Quality",
    excerpt:
      "Ship more articles while maintaining editorial standards by using structured generation and approval loops.",
    tag: "Content Ops",
    readTime: "6 min read",
    publishDate: "May 7, 2026",
    author: "Ayesha Khan",
    authorRole: "Head of Growth",
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80&auto=format&fit=crop",
    content: [
      "Quality drops when teams skip structure. Keep briefs, tone rules, and fact checks consistent for every output.",
      "Define clear ownership between strategy, generation, and editing. This removes review bottlenecks and gives predictable publishing cadence.",
      "Measure quality and velocity together. High output only matters when content still performs.",
    ],
  },
  {
    slug: "image-automation-for-seo-articles",
    title: "Image Automation for SEO Articles: Practical Setup Guide",
    excerpt:
      "Generate article-relevant visuals that support readability and improve page experience metrics.",
    tag: "AI Images",
    readTime: "7 min read",
    publishDate: "May 3, 2026",
    author: "Daniel Brooks",
    authorRole: "Content Director",
    heroImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1600&q=80&auto=format&fit=crop",
    content: [
      "Readers scan before they commit. Relevant imagery helps structure attention across long-form pages.",
      "Use style and aspect controls to keep visual identity consistent across your content library.",
      "Automating image generation inside the editorial flow reduces context switching and keeps teams focused on output quality.",
    ],
  },
];

export const contactFaqs: FaqItem[] = [
  {
    question: "How fast does support respond?",
    answer: "Most support requests receive a response within one business day.",
  },
  {
    question: "Can I request a live demo?",
    answer: "Yes. Use the contact form and select demo in your subject line.",
  },
  {
    question: "Do you offer onboarding help for teams?",
    answer: "Yes. Growth and Enterprise plans include onboarding and workflow setup guidance.",
  },
  {
    question: "Where can I discuss integrations?",
    answer: "Share your stack in the contact form and our team will suggest a suitable integration path.",
  },
];
