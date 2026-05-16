import { PoweredByAiBadge } from "@/components/ui/AiVisuals";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="animate-page-in relative overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-10 text-center">
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ai-accent)]/70 to-transparent" />
      <div className="absolute left-1/2 top-4 h-20 w-20 -translate-x-1/2 rounded-full bg-[var(--ai-accent)]/10 blur-2xl" />
      <PoweredByAiBadge className="relative mb-4" />
      <h3 className="relative text-lg font-semibold text-[var(--text)]">{title}</h3>
      <p className="relative mt-2 text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
