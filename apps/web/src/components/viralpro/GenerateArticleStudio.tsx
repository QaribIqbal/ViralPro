"use client";

import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AiScanLine, AiStatus, PoweredByAiBadge } from "@/components/ui/AiVisuals";
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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cta)]/10 text-[var(--cta)]">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, badge }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-3 transition hover:border-[var(--cta)]/30">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text)]">
          {label}
          {badge ? <span className="ml-2 rounded-full bg-[var(--cta)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--cta)]">{badge}</span> : null}
        </p>
        {description ? <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p> : null}
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
      className={`relative inline-flex h-9 w-[68px] items-center rounded-full border transition ${
        checked
          ? "border-[var(--cta)] bg-[var(--cta)]/25"
          : "border-[var(--border)] bg-[var(--surface-muted)]"
      }`}
    >
      <motion.span
        layout
        className="inline-block h-7 w-7 rounded-full bg-[var(--primary)] shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
        animate={{ x: checked ? 36 : 4 }}
        transition={{ type: "spring", stiffness: 480, damping: 32 }}
      />
    </button>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[var(--text)]">
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
  const [output, setOutput] = useState("Fill your content brief and click Generate SEO Content.");
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
    <Stagger className="space-y-5 p-4 sm:p-6">
      <StaggerItem>
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/88 p-5 backdrop-blur vp-ai-border">
          <AiScanLine active={loading} />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <PoweredByAiBadge>Powered by AI writing engine</PoweredByAiBadge>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">Generate investor-grade content workflows</h2>
              <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                ViralPro analyzes intent, SEO structure, voice, and image needs before building the draft.
              </p>
            </div>
            <AiStatus text={loading ? "AI is analyzing..." : "Ready to generate"} />
          </div>
        </div>
      </StaggerItem>
      {/* Usage Stats */}
      <StaggerItem className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--cta)]/10 text-[var(--cta)]">
            <Icon name="article" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Article Generations</p>
            <p className="text-xl font-bold text-[var(--text)]">0 <span className="text-sm font-normal text-[var(--text-muted)]">/&nbsp;999,999</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Icon name="image" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Image Credits</p>
            <p className="text-xl font-bold text-[var(--text)]">680 <span className="text-sm font-normal text-[var(--text-muted)]">remaining</span></p>
          </div>
        </div>
      </StaggerItem>

      {/* Main Form Grid */}
      <StaggerItem className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        {/* Left Column: Content Brief */}
        <Card className="rounded-2xl p-5">
          <SectionHeader icon={<Icon name="edit" className="h-5 w-5" />} title="Content Brief" subtitle="Define your article topic and core settings" />

          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="topic">Topic *</FieldLabel>
              <Input
                id="topic"
                placeholder="e.g., Best Coffee Brewing Methods"
                value={form.topic}
                onChange={(event) => updateField("topic", event.target.value)}
              />
            </div>

            <ToggleRow
              label="Live Web Research"
              description="Generate using real-time SEO-optimized data"
              checked={form.liveWebResearch}
              onChange={(next) => updateField("liveWebResearch", next)}
            />

            <div>
              <FieldLabel htmlFor="target-keyword">Target Keyword</FieldLabel>
              <Input
                id="target-keyword"
                placeholder="e.g., coffee brewing"
                value={form.targetKeyword}
                onChange={(event) => updateField("targetKeyword", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel htmlFor="ai-model">AI Model</FieldLabel>
              <select
                id="ai-model"
                value={form.aiModel}
                onChange={(event) => updateField("aiModel", event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30"
              >
                <option value="claude-sonnet-4.6">Claude Sonnet 4.6 (Default)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gpt-4.1">GPT-4.1</option>
              </select>
            </div>

            <div className="rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowOutline((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-muted)]/50"
              >
                <span className="inline-flex items-center gap-2"><Icon name="outline" className="h-4 w-4" /> Custom Outline <span className="text-xs font-normal text-[var(--text-muted)]">(Optional)</span></span>
                <span className={`text-[var(--text-muted)] transition-transform duration-200 ${showOutline ? "rotate-180" : ""}`}>▾</span>
              </button>
              <AnimatePresence initial={false}>
              {showOutline ? (
                <motion.div
                  className="border-t border-[var(--border)] p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <textarea
                    aria-label="Custom Outline"
                    value={form.customOutline}
                    onChange={(event) => updateField("customOutline", event.target.value)}
                    placeholder="H2: Introduction&#10;H2: Main section&#10;H2: Conclusion"
                    className="min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30"
                  />
                </motion.div>
              ) : null}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Right Column: Content Settings */}
        <Card className="rounded-2xl p-5">
          <SectionHeader icon={<Icon name="settings" className="h-5 w-5" />} title="Content Settings" subtitle="Configure article type, tone, and length" />

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="article-type">Article Type</FieldLabel>
                <select
                  id="article-type"
                  value={form.articleType}
                  onChange={(event) => updateField("articleType", event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30"
                >
                  <option value="informational">Informational</option>
                  <option value="how-to">How-to Guide</option>
                  <option value="comparison">Comparison</option>
                  <option value="listicle">Listicle</option>
                  <option value="story">Story</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="tone">Tone</FieldLabel>
                <select
                  id="tone"
                  value={form.tone}
                  onChange={(event) => updateField("tone", event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30"
                >
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="language">Language</FieldLabel>
                <select
                  id="language"
                  value={form.language}
                  onChange={(event) => updateField("language", event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30"
                >
                  <option value="english">English</option>
                  <option value="urdu">Urdu</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="intended-audience">Intended Audience</FieldLabel>
                <Input
                  id="intended-audience"
                  placeholder="e.g., Coffee enthusiasts"
                  value={form.intendedAudience}
                  onChange={(event) => updateField("intendedAudience", event.target.value)}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="additional-context">Additional Context</FieldLabel>
              <textarea
                id="additional-context"
                value={form.additionalContext}
                onChange={(event) => updateField("additionalContext", event.target.value)}
                placeholder="Include any specific information or context"
                className="min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--cta)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/30"
              />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text)]">Word Count</p>
                <span className="rounded-lg bg-[var(--cta)]/10 px-3 py-1 text-sm font-semibold text-[var(--cta)]">{form.wordCount}</span>
              </div>
              <input
                aria-label="Word Count"
                type="range"
                min={500}
                max={5000}
                step={100}
                value={form.wordCount}
                onChange={(event) => updateField("wordCount", Number(event.target.value))}
                className="mt-3 w-full accent-[var(--cta)]"
              />
              <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
                <span>500</span>
                <span>5,000</span>
              </div>
            </div>
          </div>
        </Card>
      </StaggerItem>

      {/* Content Intelligence */}
      <StaggerItem>
      <Card className="rounded-2xl p-5">
        <SectionHeader icon={<Icon name="brain" className="h-5 w-5" />} title="Content Intelligence" subtitle="Enhance with brand voice, knowledge base & competitor insights" />
        <div className="space-y-3">
          <ToggleRow
            label="Brand Voice & Knowledge"
            description="Match your established brand tone and guidelines"
            checked={form.brandVoiceKnowledge}
            onChange={(next) => updateField("brandVoiceKnowledge", next)}
          />
          <ToggleRow
            label="Competitor Analysis"
            description="Available on Pro, Unlimited, and Lifetime plans"
            checked={form.competitorAnalysis}
            onChange={(next) => updateField("competitorAnalysis", next)}
            badge="Pro"
          />
        </div>
      </Card>
      </StaggerItem>

      {/* Article Elements */}
      <StaggerItem>
      <Card className="rounded-2xl p-5">
        <SectionHeader icon={<Icon name="blocks" className="h-5 w-5" />} title="Article Elements" subtitle="Select which elements to include in your article" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ToggleRow label="GEO Optimization" description="Optimize for AI search engines" checked={form.geoOptimization} onChange={(next) => updateField("geoOptimization", next)} badge="Beta" />
          <ToggleRow label="First Person" description='Use "I" perspective' checked={form.firstPerson} onChange={(next) => updateField("firstPerson", next)} />
          <ToggleRow label="Hook" description="Engaging introduction" checked={form.hook} onChange={(next) => updateField("hook", next)} />
          <ToggleRow label="HTML Element" description="Interactive widget" checked={form.htmlElement} onChange={(next) => updateField("htmlElement", next)} />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-3">
            <p className="mb-2 text-sm font-medium text-[var(--text)]">Readability Level</p>
            <select
              value={form.readabilityLevel}
              onChange={(event) => updateField("readabilityLevel", event.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none"
              aria-label="Readability level"
            >
              <option value="default-7th">Default (7th)</option>
              <option value="5th-grade">5th Grade</option>
              <option value="9th-grade">9th Grade</option>
              <option value="college">College</option>
            </select>
          </div>
          <ToggleRow label="Internal Links" description="Link to your content" checked={form.internalLinks} onChange={(next) => updateField("internalLinks", next)} />
        </div>
      </Card>
      </StaggerItem>

      {/* Image Settings */}
      <StaggerItem>
      <Card className="rounded-2xl p-5 vp-ai-border">
        <SectionHeader icon={<Icon name="image" className="h-5 w-5" />} title="Image Settings" subtitle="Configure automatic image generation" />

        <div className="space-y-3">
          <ToggleRow
            label="Generate Content Images"
            description="Add images throughout your article"
            checked={form.generateContentImages}
            onChange={(next) => updateField("generateContentImages", next)}
          />

          <AnimatePresence initial={false}>
          {form.generateContentImages ? (
            <motion.div
              className="ml-2 space-y-3 border-l-2 border-[var(--cta)]/20 pl-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <label className="flex items-center gap-3 text-sm text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={form.generateCoverImage}
                  onChange={(event) => updateField("generateCoverImage", event.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--cta)]"
                />
                Generate Cover Image
              </label>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text)]">Content Images</p>
                  <span className="rounded-lg bg-[var(--cta)]/10 px-3 py-1 text-sm font-semibold text-[var(--cta)]">{form.contentImageCount}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={form.contentImageCount}
                  onChange={(event) => updateField("contentImageCount", Number(event.target.value))}
                  aria-label="Number of content images"
                  className="mt-3 w-full accent-[var(--cta)]"
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>
            </motion.div>
          ) : null}
          </AnimatePresence>

          <div className="flex items-center gap-2 rounded-xl bg-[var(--cta)]/5 px-4 py-2.5 text-xs text-[var(--text-muted)]">
            <span className="text-[var(--cta)]"><Icon name="bulb" className="h-4 w-4" /></span>
            Est. {form.contentImageCount + (form.generateCoverImage ? 1 : 0)} image credits per article · Monthly: 40/700
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowAdvancedImageSettings((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-muted)]/50"
          >
            <span className="inline-flex items-center gap-2"><Icon name="palette" className="h-4 w-4" /> Advanced Image Settings <span className="text-xs font-normal text-[var(--text-muted)]">(Optional)</span></span>
            <span className={`text-[var(--text-muted)] transition-transform duration-200 ${showAdvancedImageSettings ? "rotate-180" : ""}`}>▾</span>
          </button>

          <AnimatePresence initial={false}>
          {showAdvancedImageSettings ? (
            <motion.div
              className="grid gap-4 border-t border-[var(--border)] p-4 sm:grid-cols-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24 }}
            >
              <div>
                <FieldLabel htmlFor="image-style">Image Style</FieldLabel>
                <select
                  id="image-style"
                  value={form.imageStyle}
                  onChange={(event) => updateField("imageStyle", event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none"
                >
                  <option value="photoreal">Photoreal</option>
                  <option value="illustration">Illustration</option>
                  <option value="minimal">Minimal</option>
                  <option value="cinematic">Cinematic</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="image-ratio">Aspect Ratio</FieldLabel>
                <select
                  id="image-ratio"
                  value={form.imageAspectRatio}
                  onChange={(event) => updateField("imageAspectRatio", event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text)] focus:border-[var(--cta)] focus:outline-none"
                >
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1</option>
                  <option value="9:16">9:16</option>
                </select>
              </div>
            </motion.div>
          ) : null}
          </AnimatePresence>
        </div>
      </Card>
      </StaggerItem>

      {/* Generate Action */}
      <StaggerItem>
      <Card className="relative overflow-hidden rounded-2xl p-5">
        <AiScanLine active={loading} />
        <Button type="button" onClick={handleGenerate} disabled={loading} className="h-14 w-full text-base shadow-[0_16px_44px_-22px_var(--cta)]">
          <span className="inline-flex items-center gap-2">
            <Icon name="rocket" className="h-4 w-4" />
            {loading ? "Generating SEO Content..." : "Generate SEO Content"}
          </span>
        </Button>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--cta)]/5 px-4 py-3">
          <span className="mt-0.5 text-[var(--cta)]"><Icon name="info" className="h-4 w-4" /></span>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Background Generation</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Your content will be generated in the background. Check &quot;My Content&quot; to see it when ready.
            </p>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
      </Card>
      </StaggerItem>

      <StaggerItem>
      <OutputPanel loading={loading} output={output} htmlDoc={outputHtml} />
      </StaggerItem>
    </Stagger>
  );
}
