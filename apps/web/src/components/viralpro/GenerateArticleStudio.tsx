"use client";

import { type ReactNode, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AiScanLine, AiStatus, ProBadge } from "@/components/ui/AiVisuals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { OutputPanel } from "@/components/viralpro/OutputPanel";
import { apiRequest } from "@/lib/api-client";

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
        <p className="mt-0.5 text-sm text-[var(--text)]/70">{subtitle}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, badge }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-3 transition hover:border-[var(--cta)]/50">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text)]">
          {label}
          {badge ? <span className="ml-2 rounded-full bg-[var(--cta)] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">{badge}</span> : null}
        </p>
        {description ? <p className="mt-0.5 text-xs text-[var(--text)]/60">{description}</p> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

function Toggle({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (next: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${checked
        ? "border-[var(--cta)] bg-[var(--cta)]/25"
        : "border-[var(--border)] bg-[var(--surface-muted)]"
        }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--motion-ease-premium)] ${checked ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[var(--text)]">
      {children}
    </label>
  );
}

export function GenerateArticleStudio() {
  const [form, setForm] = useState({
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
    includeTextInImages: false,
    imageStyle: "photoreal",
    imageAspectRatio: "16:9",
  });

  const [showOutline, setShowOutline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("Configure your content brief and click Generate Article.");
  const [outputHtml, setOutputHtml] = useState<string | null>(null);

  const extractHtmlDocument = (data: unknown): string | null => {
    if (typeof data === "string") {
      let normalized = data.trim();
      const fenceMatch = normalized.match(/^```(?:html|htm)?\s*\n([\s\S]*?)```\s*$/);
      if (fenceMatch) normalized = fenceMatch[1].trim();
      if (normalized.startsWith("<!DOCTYPE") || normalized.startsWith("<html") || normalized.includes("<!DOCTYPE html")) return normalized;
      return null;
    }
    if (Array.isArray(data)) {
      for (const entry of data) {
        const nested = extractHtmlDocument(entry);
        if (nested) return nested;
      }
    }
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      const priorityKeys = ["output", "articleHtml", "html", "contentHtml", "content"];
      for (const key of priorityKeys) {
        if (key in record) {
          const nested = extractHtmlDocument(record[key]);
          if (nested) return nested;
        }
      }
    }
    return null;
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
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
      const payload = {
        contentBrief: {
          topic: form.topic,
          liveWebResearch: form.liveWebResearch,
          targetKeyword: form.targetKeyword,
          customOutline: form.customOutline,
        },
        configuration: {
          aiModel: form.aiModel,
          articleType: form.articleType,
          tone: form.tone,
          language: form.language,
          intendedAudience: form.intendedAudience,
          additionalContext: form.additionalContext,
          wordCount: form.wordCount,
          brandVoiceKnowledge: form.brandVoiceKnowledge,
          competitorAnalysis: form.competitorAnalysis,
          geoOptimization: form.geoOptimization,
          firstPerson: form.firstPerson,
          hook: form.hook,
          htmlElement: form.htmlElement,
          readabilityLevel: form.readabilityLevel,
          internalLinks: form.internalLinks,
          generateContentImages: form.generateContentImages,
          generateCoverImage: form.generateCoverImage,
          contentImageCount: form.contentImageCount,
          includeTextInImages: form.includeTextInImages,
          imageStyle: form.imageStyle,
          imageAspectRatio: form.imageAspectRatio,
        },
      };

      const result = await apiRequest<unknown>("/articles/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const resultRecord = typeof result === "object" && result !== null ? result as Record<string, unknown> : null;
      const html = extractHtmlDocument(resultRecord?.content_html ?? result);
      if (html) {
        setOutputHtml(html);
        setOutput("Article generated and saved to your library.");
      } else {
        setOutput("Article generation started. Find it in your library shortly.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stagger className="space-y-6 p-4 sm:p-6">
      <StaggerItem>
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/88 p-6 backdrop-blur-md">
          <AiScanLine active={loading} />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <ProBadge variant="glow">ViralPro Exclusive</ProBadge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">Content Studio</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Generate high-authority articles in seconds.</p>
            </div>
            <AiStatus text={loading ? "Generating..." : "Engine Ready"} />
          </div>
        </div>
      </StaggerItem>

      {/* Primary Grid: Brief & Config */}
      <StaggerItem className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
          <SectionHeader icon={<Icon name="edit" />} title="Content Brief" subtitle="Set the core focus of your article" />
          <div className="space-y-5">
            <div>
              <FieldLabel htmlFor="topic">Main Topic *</FieldLabel>
              <Input id="topic" value={form.topic} onChange={(e) => updateField("topic", e.target.value)} placeholder="e.g., The Future of Remote Work" className="!h-12 !rounded-xl" />
            </div>
            <ToggleRow label="Live Search" description="Access real-time web context" checked={form.liveWebResearch} onChange={(v) => updateField("liveWebResearch", v)} />
            <div>
              <FieldLabel htmlFor="keyword">Target Keyword</FieldLabel>
              <Input id="keyword" value={form.targetKeyword} onChange={(e) => updateField("targetKeyword", e.target.value)} placeholder="e.g., remote work trends" className="!h-12 !rounded-xl" />
            </div>
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <button onClick={() => setShowOutline(!showOutline)} className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2"><Icon name="outline" className="h-4 w-4 opacity-70" /> Custom Outline</span>
                <span className={`transition-transform duration-300 ${showOutline ? "rotate-180" : ""}`}>▾</span>
              </button>
              <AnimatePresence>
                {showOutline && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 border-t border-[var(--border)]">
                    <textarea value={form.customOutline} onChange={(e) => updateField("customOutline", e.target.value)} placeholder="H2: Introduction..." className="min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--cta)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
          <SectionHeader icon={<Icon name="settings" />} title="Configuration" subtitle="Style and target length settings" />
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Format</FieldLabel>
                <select value={form.articleType} onChange={(e) => updateField("articleType", e.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm focus:outline-none">
                  <option value="informational">Informational</option>
                  <option value="how-to">How-to Guide</option>
                </select>
              </div>
              <div>
                <FieldLabel>Tone</FieldLabel>
                <select value={form.tone} onChange={(e) => updateField("tone", e.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm focus:outline-none">
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>
            </div>
            <div>
              <FieldLabel>Audience</FieldLabel>
              <Input value={form.intendedAudience} onChange={(e) => updateField("intendedAudience", e.target.value)} placeholder="e.g., Tech Leaders" className="!h-11 !rounded-xl" />
            </div>
            <div>
              <FieldLabel>Extra Instructions</FieldLabel>
              <textarea value={form.additionalContext} onChange={(e) => updateField("additionalContext", e.target.value)} placeholder="Avoid passive voice..." className="min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm focus:outline-none" />
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-black/5 p-4">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium">Target Word Count</span>
                <span className="rounded-full bg-[var(--cta)] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">{form.wordCount} words</span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={form.wordCount}
                onChange={(e) => updateField("wordCount", Number(e.target.value))}
                style={{ "--range-fill": `${((form.wordCount - 500) / 4500) * 100}%` } as CSSProperties}
                className="w-full h-1.5 rounded-lg appearance-none bg-[var(--border)] cursor-pointer"
              />
            </div>
          </div>
        </Card>
      </StaggerItem>

      {/* Secondary Sections: Full Width Stack */}
      <StaggerItem>
        <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
          <SectionHeader icon={<Icon name="bulb" />} title="Intelligence" subtitle="Brand voice and competitor data" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleRow label="Brand Personality" checked={form.brandVoiceKnowledge} onChange={(v) => updateField("brandVoiceKnowledge", v)} />
            <ToggleRow label="SERP Analysis" checked={form.competitorAnalysis} onChange={(v) => updateField("competitorAnalysis", v)} badge="Pro" />
          </div>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
          <SectionHeader icon={<Icon name="blocks" />} title="Structural Elements" subtitle="Control components and perspective" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ToggleRow label="Local SEO" checked={form.geoOptimization} onChange={(v) => updateField("geoOptimization", v)} badge="Beta" />
            <ToggleRow label="First Person" checked={form.firstPerson} onChange={(v) => updateField("firstPerson", v)} />
            <ToggleRow label="Hook Intro" checked={form.hook} onChange={(v) => updateField("hook", v)} />
          </div>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
          <SectionHeader icon={<Icon name="image" />} title="Visual Engine" subtitle="Automatic image generation settings" />
          <div className="space-y-4">
            <ToggleRow label="Auto-Generated Images" description="Add visuals throughout the article" checked={form.generateContentImages} onChange={(v) => updateField("generateContentImages", v)} />
            <ToggleRow label="Include Text in Images" description="AI will attempt to add relevant text to visuals" checked={form.includeTextInImages} onChange={(v) => updateField("includeTextInImages", v)} />
            <AnimatePresence>
              {form.generateContentImages && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                  <div className="rounded-xl border border-[var(--border)] bg-black/5 p-4">
                    <div className="flex justify-between mb-3 text-sm">
                      <span>Total Support Images</span>
                      <span className="rounded-full bg-[var(--cta)] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">{form.contentImageCount}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={form.contentImageCount}
                      onChange={(e) => updateField("contentImageCount", Number(e.target.value))}
                      style={{ "--range-fill": `${(form.contentImageCount / 5) * 100}%` } as CSSProperties}
                      className="w-full h-1.5 rounded-lg appearance-none bg-[var(--border)] cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="relative overflow-hidden rounded-[24px] border border-[var(--cta)]/20 bg-[var(--surface)]/70 p-8 shadow-2xl">
          <AiScanLine active={loading} />
          <div className="flex flex-col items-center gap-6">
            <motion.button 
              onClick={handleGenerate} 
              disabled={loading} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex h-16 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl bg-[var(--cta)] text-xl font-bold text-white shadow-[0_20px_50px_-20px_rgba(var(--cta-rgb),0.5)] transition-colors hover:bg-[var(--cta-hover)] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name="rocket" className="h-6 w-6" /> 
                    Generate High-Authority Article
                  </>
                )}
              </span>
              {!loading && (
                <motion.div 
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 z-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
            </motion.button>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Icon name="info" className="h-4 w-4" />
              <span>Est. time: 60-90 seconds. We&apos;ll notify you when it&apos;s ready.</span>
            </div>
            {error && <p className="text-red-500 font-medium">{error}</p>}
          </div>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <OutputPanel loading={loading} output={output} htmlDoc={outputHtml} />
      </StaggerItem>
    </Stagger>
  );
}
