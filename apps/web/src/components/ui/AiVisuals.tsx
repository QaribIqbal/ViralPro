import type { PropsWithChildren } from "react";

export function PoweredByAiBadge({
  children = "Powered by AI",
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--ai-accent)] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white dark:text-[#070A12] shadow-sm ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 dark:bg-black/40 vp-badge-pulse opacity-60"></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white dark:bg-black/80"></span>
      </span>
      {children}
    </span>
  );
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
