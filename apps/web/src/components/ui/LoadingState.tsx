export function LoadingState() {
  return (
    <div className="space-y-3 p-5">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ai-accent)]/25 bg-[var(--ai-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--cta)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ai-accent)] motion-safe:animate-pulse" />
        AI is analyzing...
      </div>
      <div className="vp-skeleton h-4 w-44 rounded" />
      <div className="vp-skeleton h-4 w-full rounded" />
      <div className="vp-skeleton h-4 w-5/6 rounded" />
      <div className="vp-skeleton h-4 w-2/3 rounded" />
    </div>
  );
}
