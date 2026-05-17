"use client";

import { type ChangeEvent, type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AiScanLine, AiStatus, ProBadge } from "@/components/ui/AiVisuals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AnimatedPanel, Stagger, StaggerItem } from "@/components/ui/Motion";
import { apiRequest } from "@/lib/api-client";
import { modalBackdrop, modalPanel } from "@/lib/motion";

type IconName = "article" | "edit" | "settings" | "blocks" | "bulb" | "image" | "rocket" | "check";

interface GlobalSettings {
  batchName: string;
  wordCount: number;
  tone: string;
  articleType: string;
  language: string;
  aiModel: string;
  liveWebResearch: boolean;
  intendedAudience: string;
  additionalContext: string;
  geoOptimization: boolean;
  firstPerson: boolean;
  hook: boolean;
  readabilityLevel: string;
  brandVoiceKnowledge: boolean;
  competitorAnalysis: boolean;
  internalLinks: boolean;
  generateContentImages: boolean;
  includeTextInImages: boolean;
  contentImageCount: number;
}

interface TopicItem {
  id: string;
  topic: string;
  customSettings?: Partial<GlobalSettings>;
}

interface BulkGenerateResponse {
  accepted: boolean;
  topicCount: number;
  upstream: {
    accepted?: boolean;
    runId?: string | null;
    message?: string | null;
  };
}

interface BulkGenerationState {
  currentStep: 1 | 2 | 3;
  globalSettings: GlobalSettings;
  topics: TopicItem[];
}

const initialGlobalSettings: GlobalSettings = {
  batchName: "January 2026 SEO Push",
  wordCount: 1800,
  tone: "professional",
  articleType: "informational",
  language: "english",
  aiModel: "claude-sonnet-4.6",
  liveWebResearch: true,
  intendedAudience: "",
  additionalContext: "",
  geoOptimization: true,
  firstPerson: false,
  hook: true,
  readabilityLevel: "default-7th",
  brandVoiceKnowledge: true,
  competitorAnalysis: true,
  internalLinks: true,
  generateContentImages: true,
  includeTextInImages: false,
  contentImageCount: 2,
};

const initialState: BulkGenerationState = {
  currentStep: 1,
  globalSettings: initialGlobalSettings,
  topics: [],
};

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
    case "edit":
      return <svg {...base}><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20l-4 1 1-4z" /></svg>;
    case "settings":
      return <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" /></svg>;
    case "blocks":
      return <svg {...base}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>;
    case "bulb":
      return <svg {...base}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.4-1 2.5h-6c0-1.1-.3-1.8-1-2.5A6 6 0 0 1 12 3z" /></svg>;
    case "image":
      return <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 15-4.5-4.5L9 18" /></svg>;
    case "rocket":
      return <svg {...base}><path d="M13.5 3.5c3.7.5 6.5 3.3 7 7L14 17l-7 3 3-7z" /><path d="m7 14-3 3m2-6-2-2m8 8 2 2" /></svg>;
    case "check":
      return <svg {...base}><path d="m5 12 4.2 4.2L19 6.4" /></svg>;
  }
}

function SectionHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cta)]/10 text-[var(--cta)] shadow-[0_10px_30px_-18px_rgba(var(--cta-rgb),0.8)]">
        {icon}
      </span>
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">{title}</h3>
        <p className="mt-0.5 text-sm text-[var(--text)]/70">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold tracking-tight text-[var(--text)]">
      {children}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  children,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text)] shadow-sm transition-colors hover:border-[var(--cta)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--cta)]"
    >
      {children}
    </select>
  );
}

function TextareaField({
  id,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)] shadow-sm transition-colors placeholder:text-[var(--text-muted)] hover:border-[var(--cta)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--cta)] ${className}`}
    />
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  badge,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-3 shadow-sm transition-all duration-200 hover:border-[var(--cta)]/50 hover:bg-[var(--surface)]">
      <div className="min-w-0">
        <p className="text-sm font-medium tracking-tight text-[var(--text)]">
          {label}
          {badge ? (
            <span className="ml-2 rounded-full bg-[var(--cta)] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              {badge}
            </span>
          ) : null}
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
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all duration-200 ease-[var(--motion-ease-premium)] ${
        checked
          ? "border-[var(--cta)] bg-[var(--cta)]/25 shadow-[0_0_24px_-12px_rgba(var(--cta-rgb),0.9)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--motion-ease-premium)] ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium tracking-tight text-[var(--text)]">{label}</span>
        <span className="rounded-full bg-[var(--cta)] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
          {value}{unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--range-fill": `${fill}%` } as CSSProperties}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border)]"
      />
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = ["Global Settings", "Add Topics", "Review & Customize"];

  return (
    <div className="grid gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/72 p-3 shadow-sm backdrop-blur-md sm:grid-cols-3">
      {steps.map((step, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3;
        const active = currentStep === stepNumber;
        const completed = stepNumber < currentStep;

        return (
          <div
            key={step}
            className={`relative flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 transition ${
              active ? "bg-[var(--cta)]/12 text-[var(--text)]" : "text-[var(--text-muted)]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                active
                  ? "bg-[var(--cta)] text-[var(--cta-foreground)] shadow-[0_12px_30px_-16px_rgba(var(--cta-rgb),0.95)]"
                  : completed
                    ? "bg-[var(--success)] text-white"
                    : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
              }`}
            >
              {completed ? <Icon name="check" className="h-4 w-4" /> : stepNumber}
            </span>
            <span className={`min-w-0 text-sm tracking-tight ${active ? "font-semibold" : "font-medium"}`}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}

function parseTopics(input: string) {
  const pieces = input
    .split(/\r?\n|,/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const piece of pieces) {
    const key = piece.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(piece);
    }
  }
  return deduped;
}

export function BulkGenerateStudio() {
  const [state, setState] = useState<BulkGenerationState>(initialState);
  const [topicInput, setTopicInput] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [draftTopicName, setDraftTopicName] = useState("");
  const [draftOverrides, setDraftOverrides] = useState<Partial<GlobalSettings>>({});
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeTopic = useMemo(
    () => state.topics.find((topic) => topic.id === activeTopicId) ?? null,
    [activeTopicId, state.topics],
  );

  const updateGlobalSetting = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    setState((previous) => ({
      ...previous,
      globalSettings: {
        ...previous.globalSettings,
        [key]: value,
      },
    }));
  };

  const updateOverride = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    setDraftOverrides((previous) => ({ ...previous, [key]: value }));
  };

  const continueToTopics = () => {
    setState((previous) => ({ ...previous, currentStep: 2 }));
    setTopicError(null);
  };

  const scanTopicsAndContinue = () => {
    const parsed = parseTopics(topicInput);
    if (!parsed.length) {
      setTopicError("Add at least one topic before continuing.");
      return;
    }

    const topicItems = parsed.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      topic,
    }));

    setState((previous) => ({
      ...previous,
      currentStep: 3,
      topics: topicItems,
    }));
    setTopicError(null);
  };

  const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const csvText = await file.text();

    setTopicInput((previous) => {
      const base = previous.trim();
      if (!base) return csvText;
      return `${base}\n${csvText}`;
    });

    event.target.value = "";
  };

  const openTopicEditor = (topic: TopicItem) => {
    setActiveTopicId(topic.id);
    setDraftTopicName(topic.topic);
    setDraftOverrides(topic.customSettings ?? {});
  };

  const closeTopicEditor = () => {
    setActiveTopicId(null);
    setDraftTopicName("");
    setDraftOverrides({});
  };

  const saveTopicCustomizations = () => {
    if (!activeTopicId) return;
    const cleanedTitle = draftTopicName.trim();
    if (!cleanedTitle) return;

    setState((previous) => ({
      ...previous,
      topics: previous.topics.map((topic) =>
        topic.id === activeTopicId
          ? {
              ...topic,
              topic: cleanedTitle,
              customSettings: Object.keys(draftOverrides).length ? draftOverrides : undefined,
            }
          : topic,
      ),
    }));
    closeTopicEditor();
  };

  const handleStartBulkGeneration = async () => {
    if (!state.topics.length) {
      setSubmitError("No topics available to submit.");
      return;
    }

    const payload = {
      batchName: globalSettings.batchName,
      source: "viralpro-bulk-studio",
      globalSettings,
      topics: state.topics,
      meta: {
        topicCount: state.topics.length,
        createdAt: new Date().toISOString(),
      },
    };

    setSubmittingBulk(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const result = await apiRequest<BulkGenerateResponse>("/articles/bulk-generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const upstreamRunId = result.upstream?.runId;
      setSubmitMessage(
        upstreamRunId
          ? `Bulk run accepted (${result.topicCount} topics). Run ID: ${upstreamRunId}`
          : `Bulk run accepted (${result.topicCount} topics).`,
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Bulk generation request failed.");
    } finally {
      setSubmittingBulk(false);
    }
  };

  const currentStep = state.currentStep;
  const globalSettings = state.globalSettings;

  return (
    <>
      <Stagger className="space-y-6 p-4 sm:p-6">
        <StaggerItem>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/88 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <AiScanLine active />
            <div className="absolute right-8 top-6 h-28 w-28 rounded-full bg-[var(--ai-accent)]/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex min-w-0 flex-wrap items-center justify-between gap-5">
              <div className="min-w-0">
                <ProBadge variant="glow">Bulk Intelligence</ProBadge>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                  {currentStep === 1 ? "Global Settings" : currentStep === 2 ? "Add Topics" : "Review & Customize"}
                </h2>
                <p className="mt-1 max-w-2xl break-words text-sm text-[var(--text-muted)]">
                  {currentStep === 1
                    ? "Define shared quality, structure, and intelligence settings for the whole batch."
                    : currentStep === 2
                      ? "Provide topics in bulk and let ViralPro prepare your content queue."
                      : "Review parsed topics and apply per-article overrides before launch."}
                </p>
              </div>
              <AiStatus text={`Step ${currentStep} of 3`} />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Stepper currentStep={currentStep} />
        </StaggerItem>

        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <AnimatedPanel>
                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader icon={<Icon name="edit" />} title="Batch Information" subtitle="Identify this content run" />
                  <div>
                    <FieldLabel htmlFor="batch-name">Batch Name *</FieldLabel>
                    <Input
                      id="batch-name"
                      value={globalSettings.batchName}
                      onChange={(event) => updateGlobalSetting("batchName", event.target.value)}
                      placeholder="January 2026 SEO Push"
                      className="!h-12 !rounded-xl"
                    />
                  </div>
                </Card>
              </AnimatedPanel>

              <AnimatedPanel>
                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader
                    icon={<Icon name="settings" />}
                    title="Content Settings"
                    subtitle="These settings apply to all articles in this batch"
                  />
                  <div className="space-y-5">
                    <RangeField
                      label="Target Word Count"
                      min={500}
                      max={5000}
                      step={100}
                      value={globalSettings.wordCount}
                      unit="words"
                      onChange={(value) => updateGlobalSetting("wordCount", value)}
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <FieldLabel htmlFor="bulk-tone">Tone</FieldLabel>
                        <SelectField id="bulk-tone" value={globalSettings.tone} onChange={(value) => updateGlobalSetting("tone", value)}>
                          <option value="professional">Professional</option>
                          <option value="conversational">Conversational</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="friendly">Friendly</option>
                        </SelectField>
                      </div>
                      <div>
                        <FieldLabel htmlFor="bulk-format">Format/Article Type</FieldLabel>
                        <SelectField id="bulk-format" value={globalSettings.articleType} onChange={(value) => updateGlobalSetting("articleType", value)}>
                          <option value="informational">Informational</option>
                          <option value="how-to">How-to Guide</option>
                          <option value="listicle">Listicle</option>
                          <option value="comparison">Comparison</option>
                        </SelectField>
                      </div>
                      <div>
                        <FieldLabel htmlFor="bulk-language">Language</FieldLabel>
                        <SelectField id="bulk-language" value={globalSettings.language} onChange={(value) => updateGlobalSetting("language", value)}>
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </SelectField>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <FieldLabel htmlFor="bulk-model">Content Generation Model</FieldLabel>
                          <span className="rounded-full bg-[var(--ai-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ai-accent-foreground)]">
                            Default
                          </span>
                        </div>
                        <SelectField id="bulk-model" value={globalSettings.aiModel} onChange={(value) => updateGlobalSetting("aiModel", value)}>
                          <option value="claude-sonnet-4.6">Sonnet 4.6</option>
                          <option value="gpt-5.2">GPT-5.2</option>
                          <option value="auto">Auto-select best model</option>
                        </SelectField>
                      </div>
                    </div>
                    <ToggleRow
                      label="Live Web Research"
                      description="Enrich every article with current web context before drafting."
                      checked={globalSettings.liveWebResearch}
                      onChange={(value) => updateGlobalSetting("liveWebResearch", value)}
                    />
                    <div>
                      <FieldLabel htmlFor="bulk-audience">Intended Audience</FieldLabel>
                      <Input
                        id="bulk-audience"
                        value={globalSettings.intendedAudience}
                        onChange={(event) => updateGlobalSetting("intendedAudience", event.target.value)}
                        placeholder="e.g., SaaS founders, marketing directors, local business owners"
                        className="!h-12 !rounded-xl"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="bulk-instructions">Custom Instructions</FieldLabel>
                      <TextareaField
                        id="bulk-instructions"
                        value={globalSettings.additionalContext}
                        onChange={(value) => updateGlobalSetting("additionalContext", value)}
                        placeholder="Add brand rules, sources to prioritize, claims to avoid, formatting preferences, or CTA guidance."
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </Card>
              </AnimatedPanel>

              <AnimatedPanel className="grid gap-6 xl:grid-cols-3">
                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader icon={<Icon name="blocks" />} title="Structural Elements" subtitle="Control components and perspective" />
                  <div className="space-y-4">
                    <ToggleRow label="GEO Optimization" description="Tune content for AI answer engines." badge="Beta" checked={globalSettings.geoOptimization} onChange={(value) => updateGlobalSetting("geoOptimization", value)} />
                    <ToggleRow label="First Person" description="Use a direct editorial perspective." checked={globalSettings.firstPerson} onChange={(value) => updateGlobalSetting("firstPerson", value)} />
                    <ToggleRow label="Hook Intro" description="Open each article with a strong hook." checked={globalSettings.hook} onChange={(value) => updateGlobalSetting("hook", value)} />
                    <div>
                      <FieldLabel htmlFor="bulk-readability">Readability Level</FieldLabel>
                      <SelectField id="bulk-readability" value={globalSettings.readabilityLevel} onChange={(value) => updateGlobalSetting("readabilityLevel", value)}>
                        <option value="default-7th">Default - 7th Grade</option>
                        <option value="simple">Simple</option>
                        <option value="professional">Professional</option>
                        <option value="expert">Expert</option>
                      </SelectField>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader icon={<Icon name="bulb" />} title="Intelligence" subtitle="Brand voice and competitor data" />
                  <div className="space-y-4">
                    <ToggleRow label="Brand Personality" description="Apply your saved voice profile." checked={globalSettings.brandVoiceKnowledge} onChange={(value) => updateGlobalSetting("brandVoiceKnowledge", value)} />
                    <ToggleRow label="SERP Analysis / Competitor Data" description="Use ranking pages as research context." checked={globalSettings.competitorAnalysis} onChange={(value) => updateGlobalSetting("competitorAnalysis", value)} />
                    <ToggleRow label="Internal Links" description="Suggest links across your existing library." checked={globalSettings.internalLinks} onChange={(value) => updateGlobalSetting("internalLinks", value)} />
                  </div>
                </Card>

                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader icon={<Icon name="image" />} title="Visual Engine" subtitle="Automatic image generation settings" />
                  <div className="space-y-4">
                    <ToggleRow label="Generate Content Images" description="Create supporting visuals per article." checked={globalSettings.generateContentImages} onChange={(value) => updateGlobalSetting("generateContentImages", value)} />
                    <ToggleRow label="Include Text in Images" description="Allow short labels or callouts inside generated imagery." checked={globalSettings.includeTextInImages} onChange={(value) => updateGlobalSetting("includeTextInImages", value)} />
                    <AnimatePresence initial={false}>
                      {globalSettings.generateContentImages ? (
                        <motion.div
                          key="support-images"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <RangeField
                            label="Total Support Images"
                            min={0}
                            max={5}
                            step={1}
                            value={globalSettings.contentImageCount}
                            onChange={(value) => updateGlobalSetting("contentImageCount", value)}
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Card>
              </AnimatedPanel>

              <AnimatedPanel>
                <Card className="relative overflow-hidden rounded-[24px] border border-[var(--cta)]/20 bg-[var(--surface)]/76 p-6 shadow-2xl sm:p-8">
                  <AiScanLine active />
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Button
                      type="button"
                      onClick={continueToTopics}
                      className="!h-16 !w-full max-w-md !rounded-2xl !text-lg !font-bold shadow-[0_20px_50px_-20px_rgba(var(--cta-rgb),0.5)] transition-transform hover:scale-[1.02] active:scale-[0.98] sm:!text-xl"
                    >
                      <span className="flex items-center gap-3">
                        Continue to Topics →
                      </span>
                    </Button>
                  </div>
                </Card>
              </AnimatedPanel>
            </motion.div>
          ) : null}

          {currentStep === 2 ? (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <AnimatedPanel>
                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader icon={<Icon name="article" />} title="Enter Topics" subtitle="Provide the topics you want to generate articles for." />
                  <div className="space-y-5">
                    <div>
                      <FieldLabel htmlFor="topic-entry">Topics</FieldLabel>
                      <TextareaField
                        id="topic-entry"
                        value={topicInput}
                        onChange={setTopicInput}
                        placeholder="Enter one topic per line, or separate them by commas."
                        className="min-h-[200px] vp-input"
                      />
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Enter one topic per line, or separate them by commas.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/55 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium tracking-tight text-[var(--text)]">Upload CSV</p>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--cta)]/45">
                          <span>Select File</span>
                          <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="sr-only" />
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        CSV values are appended into the topic input and parsed together.
                      </p>
                    </div>

                    {topicError ? <p className="text-sm font-medium text-[var(--destructive)]">{topicError}</p> : null}
                  </div>
                </Card>
              </AnimatedPanel>

              <AnimatedPanel>
                <Card className="relative overflow-hidden rounded-[24px] border border-[var(--cta)]/20 bg-[var(--surface)]/76 p-6 shadow-2xl sm:p-8">
                  <AiScanLine active />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button" variant="secondary" onClick={() => setState((previous) => ({ ...previous, currentStep: 1 }))} className="!h-12 !rounded-xl !px-5">
                      ← Back to Settings
                    </Button>
                    <Button
                      type="button"
                      onClick={scanTopicsAndContinue}
                      className="!h-12 !rounded-xl !px-6 shadow-[0_20px_50px_-20px_rgba(var(--cta-rgb),0.5)]"
                    >
                      Scan &amp; Preview Topics →
                    </Button>
                  </div>
                </Card>
              </AnimatedPanel>
            </motion.div>
          ) : null}

          {currentStep === 3 ? (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <AnimatedPanel>
                <Card className="rounded-[24px] border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8">
                  <SectionHeader icon={<Icon name="blocks" />} title="Review Batch" subtitle="Verify and customize individual article settings." />
                  <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                    <div className="grid grid-cols-[minmax(0,1fr)_200px_140px] gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      <span>Topic</span>
                      <span>Overrides</span>
                      <span className="text-right">Action</span>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {state.topics.map((topic) => {
                        const overrideCount = Object.keys(topic.customSettings ?? {}).length;
                        return (
                          <div key={topic.id} className="grid grid-cols-[minmax(0,1fr)_200px_140px] items-center gap-3 px-4 py-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--text)]">{topic.topic}</p>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">
                              {overrideCount ? `${overrideCount} custom field${overrideCount > 1 ? "s" : ""}` : "Using global defaults"}
                            </p>
                            <div className="text-right">
                              <Button type="button" variant="secondary" className="!h-9 !rounded-lg !px-3 text-xs" onClick={() => openTopicEditor(topic)}>
                                Customize
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </AnimatedPanel>

              <AnimatedPanel>
                <Card className="relative overflow-hidden rounded-[24px] border border-[var(--cta)]/20 bg-[var(--surface)]/76 p-6 shadow-2xl sm:p-8">
                  <AiScanLine active />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button" variant="secondary" onClick={() => setState((previous) => ({ ...previous, currentStep: 2 }))} className="!h-12 !rounded-xl !px-5">
                      ← Back to Topics
                    </Button>
                    <Button
                      type="button"
                      onClick={handleStartBulkGeneration}
                      disabled={submittingBulk}
                      className="!h-12 !rounded-xl !px-6 shadow-[0_20px_50px_-20px_rgba(var(--cta-rgb),0.5)]"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name="rocket" className="h-4 w-4" />
                        {submittingBulk ? "Starting..." : "Start Bulk Generation"}
                      </span>
                    </Button>
                  </div>
                  {submitMessage ? <p className="mt-3 text-sm font-medium text-[var(--success)]">{submitMessage}</p> : null}
                  {submitError ? <p className="mt-3 text-sm font-medium text-[var(--destructive)]">{submitError}</p> : null}
                </Card>
              </AnimatedPanel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Stagger>

      <AnimatePresence>
        {activeTopic && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="absolute inset-0 bg-black/55" onClick={closeTopicEditor} />
            <motion.div
              variants={modalPanel}
              className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            >
              <SectionHeader
                icon={<Icon name="edit" />}
                title="Topic Override Editor"
                subtitle="Adjust this single article while keeping all other items on global defaults."
              />

              <div className="space-y-5">
                <div>
                  <FieldLabel htmlFor="override-topic-title">Topic Title</FieldLabel>
                  <Input
                    id="override-topic-title"
                    value={draftTopicName}
                    onChange={(event) => setDraftTopicName(event.target.value)}
                    className="!h-12 !rounded-xl"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <RangeField
                    label="Word Count"
                    min={500}
                    max={5000}
                    step={100}
                    value={draftOverrides.wordCount ?? globalSettings.wordCount}
                    unit="words"
                    onChange={(value) => updateOverride("wordCount", value)}
                  />
                  <div>
                    <FieldLabel htmlFor="override-tone">Tone</FieldLabel>
                    <SelectField
                      id="override-tone"
                      value={draftOverrides.tone ?? globalSettings.tone}
                      onChange={(value) => updateOverride("tone", value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="conversational">Conversational</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="friendly">Friendly</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel htmlFor="override-article-type">Article Type</FieldLabel>
                    <SelectField
                      id="override-article-type"
                      value={draftOverrides.articleType ?? globalSettings.articleType}
                      onChange={(value) => updateOverride("articleType", value)}
                    >
                      <option value="informational">Informational</option>
                      <option value="how-to">How-to Guide</option>
                      <option value="listicle">Listicle</option>
                      <option value="comparison">Comparison</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel htmlFor="override-readability">Readability Level</FieldLabel>
                    <SelectField
                      id="override-readability"
                      value={draftOverrides.readabilityLevel ?? globalSettings.readabilityLevel}
                      onChange={(value) => updateOverride("readabilityLevel", value)}
                    >
                      <option value="default-7th">Default - 7th Grade</option>
                      <option value="simple">Simple</option>
                      <option value="professional">Professional</option>
                      <option value="expert">Expert</option>
                    </SelectField>
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="override-context">Custom Instructions</FieldLabel>
                  <TextareaField
                    id="override-context"
                    value={draftOverrides.additionalContext ?? globalSettings.additionalContext}
                    onChange={(value) => updateOverride("additionalContext", value)}
                    className="min-h-[120px]"
                    placeholder="Add specific instructions just for this topic."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ToggleRow
                    label="Live Web Research"
                    checked={draftOverrides.liveWebResearch ?? globalSettings.liveWebResearch}
                    onChange={(value) => updateOverride("liveWebResearch", value)}
                  />
                  <ToggleRow
                    label="First Person"
                    checked={draftOverrides.firstPerson ?? globalSettings.firstPerson}
                    onChange={(value) => updateOverride("firstPerson", value)}
                  />
                  <ToggleRow
                    label="Hook Intro"
                    checked={draftOverrides.hook ?? globalSettings.hook}
                    onChange={(value) => updateOverride("hook", value)}
                  />
                  <ToggleRow
                    label="GEO Optimization"
                    checked={draftOverrides.geoOptimization ?? globalSettings.geoOptimization}
                    onChange={(value) => updateOverride("geoOptimization", value)}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={closeTopicEditor} className="!h-11 !rounded-xl !px-5">
                    Cancel
                  </Button>
                  <Button type="button" onClick={saveTopicCustomizations} className="!h-11 !rounded-xl !px-6">
                    Save Customizations
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
