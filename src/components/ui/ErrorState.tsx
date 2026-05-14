export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[var(--destructive)]/20 bg-[var(--destructive-muted)] p-4 text-sm text-[var(--destructive)]">
      {message}
    </div>
  );
}
