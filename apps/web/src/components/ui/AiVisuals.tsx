import type { PropsWithChildren } from "react";

/**
 * Premium membership / exclusivity badge — Apple-style subtle elegance.
 * NOT an "AI" badge. This conveys that the user belongs to a premium tier.
 */
export function ProBadge({
  children = "Pro",
  className = "",
  variant = "default",
}: PropsWithChildren<{ className?: string; variant?: "default" | "subtle" | "glow" }>) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase shadow-sm";

  const variants: Record<string, string> = {
    default:
      "bg-gradient-to-r from-[var(--cta)] to-[color-mix(in_srgb,var(--cta)_70%,var(--ai-accent))] px-3 py-[3px] text-white",
    subtle:
      "border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-[var(--text-muted)]",
    glow:
      "bg-gradient-to-r from-[var(--cta)] to-[var(--ai-accent)] px-3 py-[3px] text-white shadow-[0_0_16px_rgba(var(--cta-rgb),0.35)]",
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Contextual label for AI-generated content — used ONLY on actual generated output,
 * not on the app shell or navigation.
 */
export function OutputBadge({
  children = "Studio Output",
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--text-muted)] shadow-sm ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)]/40 vp-badge-pulse opacity-60"></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--success)]"></span>
      </span>
      {children}
    </span>
  );
}

/** @deprecated Use ProBadge or OutputBadge instead */
export function PoweredByAiBadge({
  children = "Pro",
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <ProBadge className={className}>{children}</ProBadge>;
}

export function AiOrb({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`vp-ai-orb ${className}`} />;
}

export function AiScanLine({ active = true }: { active?: boolean }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      {active ? <span className="vp-ai-scan-line" /> : null}
    </span>
  );
}

export function NeuralBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden opacity-50 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,var(--cta)_0%,transparent_40%),radial-gradient(circle_at_80%_8%,var(--ai-accent)_0%,transparent_38%)] opacity-10" />
      <AiOrb className="absolute right-[8%] top-24 h-44 w-44 opacity-20" />
      <div className="absolute left-[12%] top-[42%] h-52 w-52 rounded-full bg-[var(--cta)] opacity-10 blur-3xl" />
    </div>
  );
}

export function AiStatus({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--text)] shadow-sm backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ai-accent)] vp-badge-pulse opacity-60"></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--ai-accent)]"></span>
      </span>
      {text}
    </div>
  );
}
