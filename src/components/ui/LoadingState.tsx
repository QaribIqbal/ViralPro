export function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
    </div>
  );
}
