"use client";

import { type CSSProperties, type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PoweredByAiBadge } from "@/components/ui/AiVisuals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { OutputPanel } from "@/components/viralpro/OutputPanel";
import { apiRequest } from "@/lib/api-client";
import type { Article, GeneratedImage } from "@/server/domain/types";

type IconName =
  | "article"
  | "image"
  | "edit"
  | "settings"
  | "brain"
  | "blocks"
  | "bulb"
  | "palette"
  | "rocket"
  | "info"
  | "outline";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const base = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "article":
      return <svg {...base}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" /></svg>;
    case "image":
      return <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 15-4.5-4.5L9 18" /></svg>;
    case "edit":
      return <svg {...base}><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20l-4 1 1-4z" /></svg>;
    case "settings":
      return <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" /></svg>;
    case "brain":
      return <svg {...base}><path d="M9.5 8A2.5 2.5 0 0 1 12 5.5 2.5 2.5 0 0 1 14.5 8 2.5 2.5 0 0 1 17 10.5v3A2.5 2.5 0 0 1 14.5 16 2.5 2.5 0 0 1 12 18.5 2.5 2.5 0 0 1 9.5 16 2.5 2.5 0 0 1 7 13.5v-3A2.5 2.5 0 0 1 9.5 8z" /><path d="M10 11h4M10 14h4" /></svg>;
    case "blocks":
      return <svg {...base}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>;
    case "bulb":
      return <svg {...base}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.4-1 2.5h-6c0-1.1-.3-1.8-1-2.5A6 6 0 0 1 12 3z" /></svg>;
    case "palette":
      return <svg {...base}><path d="M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 0-4.6h-1.2a2.5 2.5 0 0 1 0-5h2a4 4 0 0 0 0-8z" /><circle cx="6.5" cy="10" r="1" /><circle cx="9" cy="7" r="1" /><circle cx="13" cy="7" r="1" /><circle cx="16" cy="10" r="1" /></svg>;
    case "rocket":
      return <svg {...base}><path d="M13.5 3.5c3.7.5 6.5 3.3 7 7L14 17l-7 3 3-7z" /><path d="m7 14-3 3m2-6-2-2m8 8 2 2" /></svg>;
    case "info":
      return <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></svg>;
    case "outline":
      return <svg {...base}><path d="M4 5h16M4 10h16M4 15h10M4 20h10" /></svg>;
  }
}

function SectionHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)]/70 text-[var(--ai-accent)] dark:bg-white/5">{icon}</span>
      <div>
        <h3 className="text-[21px] font-semibold tracking-tight text-[var(--text)]">{title}</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-[var(--text)]/72">{subtitle}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, badge }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-3.5 backdrop-blur-md transition hover:border-[var(--border-strong)] dark:bg-white/[0.03]">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-[var(--text)]">
          {label}
          {badge ? <span className="ml-2 rounded-full bg-[var(--cta)]/12 px-2 py-0.5 text-[11px] font-medium text-[var(--cta)]">{badge}</span> : null}
        </p>
        {description ? <p className="mt-1 text-[13px] text-[var(--text)]/62">{description}</p> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

type ArticleFormState = {
  topic: string;
  liveWebResearch: boolean;
  targetKeyword: string;
  aiModel: string;
  customOutline: string;
  articleType: string;
  tone: string;
  language: string;
  intendedAudience: string;
  additionalContext: string;
  wordCount: number;
  brandVoiceKnowledge: boolean;
  competitorAnalysis: boolean;
  geoOptimization: boolean;
  firstPerson: boolean;
  hook: boolean;
  htmlElement: boolean;
  readabilityLevel: string;
  internalLinks: boolean;
  generateContentImages: boolean;
  generateCoverImage: boolean;
  contentImageCount: number;
  imageStyle: string;
  imageAspectRatio: string;
};

const initialState: ArticleFormState = {
  topic: "",
  liveWebResearch: false,
  targetKeyword: "",
  aiModel: "claude-sonnet-4.6",
  customOutline: "",
  articleType: "informational",
  tone: "professional",
  language: "english",
  intendedAudience: "",
  additionalContext: "",
  wordCount: 1500,
  brandVoiceKnowledge: false,
  competitorAnalysis: false,
  geoOptimization: false,
  firstPerson: false,
  hook: true,
  htmlElement: false,
  readabilityLevel: "default-7th",
  internalLinks: false,
  generateContentImages: true,
  generateCoverImage: true,
  contentImageCount: 2,
  imageStyle: "photoreal",
  imageAspectRatio: "16:9",
};

function Toggle({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (next: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-9 w-[68px] items-center rounded-full border transition ${checked
        ? "border-[var(--cta)] bg-[var(--cta)]/25"
        : "border-[var(--border)] bg-[var(--surface-muted)]"
        }`}
    >
      <span
        className={`inline-block h-7 w-7 rounded-full bg-[var(--primary)] shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-transform duration-200 ease-[var(--motion-ease-premium)] ${
          checked ? "translate-x-9" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[14px] font-medium text-[var(--text)]/90">
      {children}
    </label>
  );
}

export function GenerateArticleStudio() {
  const [form, setForm] = useState<ArticleFormState>(initialState);
  const [showOutline, setShowOutline] = useState(false);
  const [showAdvancedImageSettings, setShowAdvancedImageSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("Configure your content brief and click Generate Article.");
  const [outputHtml, setOutputHtml] = useState<string | null>(null);

  const extractHtmlDocument = (data: unknown): string | null => {
    if (typeof data === "string") {
      let normalized = data.trim();
      // Strip markdown code fences: ```html ... ``` or ``` ... ```
      const fenceMatch = normalized.match(/^```(?:html|htm)?\s*\n([\s\S]*?)```\s*$/);
      if (fenceMatch) {
        normalized = fenceMatch[1].trim();
      }
      if (
        normalized.startsWith("<!DOCTYPE") ||
        normalized.startsWith("<html") ||
        normalized.startsWith("<h1") ||
        normalized.startsWith("<h2") ||
        normalized.startsWith("<p>") ||
        normalized.includes("<!DOCTYPE html")
      ) {
        return normalized;
      }
      return null;
    }

    if (Array.isArray(data)) {
      for (const entry of data) {
        const nested = extractHtmlDocument(entry);
        if (nested) return nested;
      }
      return null;
    }

    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      // Check known keys first for speed
      const priorityKeys = ["output", "articleHtml", "html", "contentHtml", "content", "body", "article", "result"];
      for (const key of priorityKeys) {
        if (key in record) {
          const nested = extractHtmlDocument(record[key]);
          if (nested) return nested;
        }
      }
      // Fallback: iterate over ALL values
      for (const value of Object.values(record)) {
        const nested = extractHtmlDocument(value);
        if (nested) return nested;
      }
    }

    return null;
  };

  const updateField = <K extends keyof ArticleFormState>(key: K, value: ArticleFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      setError("Topic is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutputHtml(null);

    try {
      const result = await apiRequest<Article & { featuredImage?: GeneratedImage | null }>("/articles/generate", {
        method: "POST",
        body: JSON.stringify({
          topic: form.topic,
          primaryKeyword: form.targetKeyword,
          articleType: form.articleType,
          tone: form.tone,
          language: form.language,
          intendedAudience: form.intendedAudience,
          customOutline: form.customOutline,
          wordCount: form.wordCount,
          generateImage: form.generateCoverImage || form.generateContentImages,
          aiSearchOptimized: form.geoOptimization,
          extraInstructions: form.additionalContext,
        }),
      });

      const html = extractHtmlDocument(result.content_html || result);
      if (html) {
        setOutputHtml(html);
        setOutput("Article generated and saved to your library.");
      } else {
        setOutput(result.content_markdown || "Generation complete.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Article generation failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stagger className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
      <StaggerItem>
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--ai-accent-muted)] to-transparent opacity-50" />
          <div className="relative z-10 flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <PoweredByAiBadge>Guided AI writing assistant</PoweredByAiBadge>
              <h2 className="mt-3 text-[28px] font-semibold leading-[1.18] tracking-tight text-[var(--text)] sm:text-[32px]">
                Create your next article with a simple brief
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
                Share your topic and preferences, then we will generate a ready-to-edit draft for your content workflow.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-[13px] text-[var(--text-muted)] lg:block">
              Ready to generate
            </div>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 backdrop-blur-sm">
          <p className="text-[13px] text-[var(--text-muted)]">Article generations</p>
          <p className="mt-1 text-[24px] font-semibold text-[var(--text)]">128 <span className="text-[14px] font-medium text-[var(--text-muted)]">this month</span></p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 backdrop-blur-sm">
          <p className="text-[13px] text-[var(--text-muted)]">Image credits</p>
          <p className="mt-1 text-[24px] font-semibold text-[var(--text)]">680 <span className="text-[14px] font-medium text-[var(--text-muted)]">remaining</span></p>
        </div>
      </StaggerItem>

      <div className="grid gap-6 lg:grid-cols-2">
        <StaggerItem>
          <Card className="rounded-[22px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-7">
            <SectionHeader
              icon={<Icon name="edit" className="h-5 w-5" />}
              title="Content brief"
              subtitle="Start with a clear topic, then add your main keyword."
            />
            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="topic">What do you want to write about? <span className="text-[var(--cta)]">*</span></FieldLabel>
                <Input
                  id="topic"
                  placeholder="e.g., Best coffee brewing methods for beginners"
                  value={form.topic}
                  onChange={(e) => updateField("topic", e.target.value)}
                  className="!h-12 !rounded-xl"
                />
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">Use a short, clear topic. You can refine details below.</p>
              </div>

              <ToggleRow
                label="Use live web research"
                description="Pull in recent context and trends to improve factual relevance."
                checked={form.liveWebResearch}
                onChange={(next) => updateField("liveWebResearch", next)}
              />

              <div>
                <FieldLabel htmlFor="target-keyword">Main keyword</FieldLabel>
                <Input
                  id="target-keyword"
                  placeholder="e.g., coffee brewing"
                  value={form.targetKeyword}
                  onChange={(e) => updateField("targetKeyword", e.target.value)}
                  className="!h-12 !rounded-xl"
                />
              </div>
              <ToggleRow
                label="Use brand voice"
                description="Align writing style with your existing brand tone."
                checked={form.brandVoiceKnowledge}
                onChange={(next) => updateField("brandVoiceKnowledge", next)}
              />
              <ToggleRow
                label="Use first-person voice"
                description="Helpful for founder stories, personal insights, and opinion pieces."
                checked={form.firstPerson}
                onChange={(next) => updateField("firstPerson", next)}
              />
              <ToggleRow
                label="Add AI content images"
                description="Generate supporting visuals with your article."
                checked={form.generateContentImages}
                onChange={(next) => updateField("generateContentImages", next)}
              />

              <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOutline((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="outline" className="h-4 w-4 opacity-70" />
                    Custom Outline
                    <span className="text-xs font-normal text-[var(--text-muted)]">(Optional)</span>
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-transform duration-300 ${showOutline ? "rotate-180" : ""}`}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {showOutline && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="p-4 pt-0 border-t border-[var(--border)]">
                        <textarea
                          value={form.customOutline}
                          onChange={(e) => updateField("customOutline", e.target.value)}
                          placeholder="H2: Introduction&#10;H2: Main section&#10;H2: Conclusion"
                          className="mt-4 flex h-32 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem className="space-y-6">
          <Card className="rounded-[22px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-7">
            <SectionHeader
              icon={<Icon name="settings" className="h-5 w-5" />}
              title="Article settings"
              subtitle="Choose style, tone, and length."
            />
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="article-type">Article type</FieldLabel>
                  <select
                    id="article-type"
                    value={form.articleType}
                    onChange={(e) => updateField("articleType", e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                  >
                    <option value="informational">Informational</option>
                    <option value="how-to">How-to guide</option>
                    <option value="listicle">Listicle</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="tone">Tone</FieldLabel>
                  <select
                    id="tone"
                    value={form.tone}
                    onChange={(e) => updateField("tone", e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                  >
                    <option value="professional">Professional</option>
                    <option value="conversational">Conversational</option>
                    <option value="authoritative">Authoritative</option>
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="ai-model">AI model</FieldLabel>
                <select
                  id="ai-model"
                  value={form.aiModel}
                  onChange={(e) => updateField("aiModel", e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                >
                  <option value="claude-sonnet-4.6">Claude Sonnet 4.6 (quality)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (speed)</option>
                  <option value="gpt-4.1">GPT-4.1 (balanced)</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="language">Language</FieldLabel>
                  <select
                    id="language"
                    value={form.language}
                    onChange={(e) => updateField("language", e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                  >
                    <option value="english">English</option>
                    <option value="urdu">Urdu</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="intended-audience">Target Audience</FieldLabel>
                  <Input
                    id="intended-audience"
                    placeholder="e.g., Coffee enthusiasts"
                    value={form.intendedAudience}
                    onChange={(e) => updateField("intendedAudience", e.target.value)}
                    className="!h-12 !rounded-xl"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="additional-context">Extra instructions</FieldLabel>
                <textarea
                  id="additional-context"
                  value={form.additionalContext}
                  onChange={(e) => updateField("additionalContext", e.target.value)}
                  placeholder="Anything important the article should include or avoid?"
                  className="flex h-28 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                />
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/55 p-4 dark:bg-white/[0.03]">
                <div className="mb-3 flex items-center justify-between">
                  <FieldLabel>Target length</FieldLabel>
                  <span className="rounded-full bg-[var(--cta)]/10 px-3 py-1 text-[12px] font-semibold text-[var(--cta)]">{form.wordCount} words</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={form.wordCount}
                  onChange={(e) => updateField("wordCount", Number(e.target.value))}
                  style={{ "--range-fill": `${((form.wordCount - 500) / 4500) * 100}%` } as CSSProperties}
                  className="w-full cursor-pointer appearance-none rounded-lg accent-[var(--cta)]"
                />
              </div>
            </div>
          </Card>

          <Card className="rounded-[22px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-7">
            <SectionHeader
              icon={<Icon name="bulb" className="h-5 w-5" />}
              title="AI Intelligence"
              subtitle="Train the AI on your brand voice and competitor strategies"
            />
            <div className="space-y-3">
              <ToggleRow
                label="Brand Voice"
                description="Apply your unique brand personality and style guidelines"
                checked={form.brandVoiceKnowledge}
                onChange={(next) => updateField("brandVoiceKnowledge", next)}
              />
              <ToggleRow
                label="Competitor Analysis"
                description="Analyze top ranking pages for pattern discovery"
                checked={form.competitorAnalysis}
                onChange={(next) => updateField("competitorAnalysis", next)}
                badge="Pro"
              />
            </div>
          </Card>

          <Card className="rounded-[22px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-7">
            <SectionHeader
              icon={<Icon name="blocks" className="h-5 w-5" />}
              title="Structural elements"
              subtitle="Choose specific components to include in your draft"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow label="Local SEO Boost" checked={form.geoOptimization} onChange={(v) => updateField("geoOptimization", v)} badge="Beta" />
              <ToggleRow label="Engaging Intro" description="Add a compelling hook" checked={form.hook} onChange={(v) => updateField("hook", v)} />
              <ToggleRow label="Interactive Widget" description="Add HTML elements" checked={form.htmlElement} onChange={(v) => updateField("htmlElement", v)} />
              <ToggleRow label="Internal Linking" checked={form.internalLinks} onChange={(v) => updateField("internalLinks", v)} />
              
              <div className="col-span-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 transition hover:border-[var(--border-strong)]">
                <p className="mb-2 text-sm font-medium text-[var(--text)]">Readability Level</p>
                <select
                  value={form.readabilityLevel}
                  onChange={(e) => updateField("readabilityLevel", e.target.value)}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                >
                  <option value="default-7th">Default (7th Grade)</option>
                  <option value="5th-grade">5th Grade</option>
                  <option value="college">College Level</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="rounded-[22px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-7">
            <SectionHeader
              icon={<Icon name="image" className="h-5 w-5" />}
              title="Image settings"
              subtitle="Configure automatic image generation"
            />
            <div className="space-y-4">
              <ToggleRow label="Generate Cover Image" checked={form.generateCoverImage} onChange={(v) => updateField("generateCoverImage", v)} />
              
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/55 p-4 dark:bg-white/[0.03]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text)]">Content images count</p>
                  <span className="rounded-full bg-[var(--cta)]/10 px-3 py-1 text-[12px] font-semibold text-[var(--cta)]">{form.contentImageCount}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={form.contentImageCount}
                  onChange={(e) => updateField("contentImageCount", Number(e.target.value))}
                  className="w-full cursor-pointer appearance-none rounded-lg accent-[var(--cta)]"
                />
              </div>

              <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvancedImageSettings((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="palette" className="h-4 w-4 opacity-70" />
                    Advanced Image Settings
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-transform duration-300 ${showAdvancedImageSettings ? "rotate-180" : ""}`}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {showAdvancedImageSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="p-4 pt-0 border-t border-[var(--border)] space-y-4 pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel htmlFor="image-style">Image Style</FieldLabel>
                            <select
                              id="image-style"
                              value={form.imageStyle}
                              onChange={(e) => updateField("imageStyle", e.target.value)}
                              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                            >
                              <option value="photoreal">Photoreal</option>
                              <option value="illustration">Illustration</option>
                              <option value="cinematic">Cinematic</option>
                            </select>
                          </div>
                          <div>
                            <FieldLabel htmlFor="image-ratio">Aspect Ratio</FieldLabel>
                            <select
                              id="image-ratio"
                              value={form.imageAspectRatio}
                              onChange={(e) => updateField("imageAspectRatio", e.target.value)}
                              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] transition-colors focus-visible:border-[var(--cta)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cta)]"
                            >
                              <option value="16:9">16:9</option>
                              <option value="4:3">4:3</option>
                              <option value="1:1">1:1</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Card>

          <Card className="rounded-[22px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-7">
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className={`!h-12 !rounded-full !px-8 !text-base !font-medium`}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" fill="none" />
                      <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3.5A6.5 6.5 0 0 0 12 5.5z" />
                    </svg>
                    Generating your article...
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <Icon name="rocket" className="h-5 w-5" />
                    Generate my article
                  </span>
                )}
              </Button>
              <p className="text-center text-[13px] text-[var(--text-muted)]">Most drafts are ready in about 60–90 seconds.</p>
              {error ? (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
            </div>
          </Card>
        </StaggerItem>
      </div>

      <StaggerItem>
        <OutputPanel loading={loading} output={output} htmlDoc={outputHtml} />
      </StaggerItem>
    </Stagger>
  );
}
