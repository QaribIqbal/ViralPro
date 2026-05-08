import type { HistoryItem } from "@/server/domain/types";

export function HistoryPanel({
  items,
  onSelect,
  activeId,
}: {
  items: HistoryItem[];
  onSelect: (id: string) => void;
  activeId: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`w-full rounded-xl border p-3 text-left transition ${
            activeId === item.id
              ? "border-slate-900 bg-slate-900 text-white dark:bg-indigo-500 dark:border-indigo-500"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-slate-400"
          }`}
        >
          <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
          <p className="mt-1 line-clamp-1 text-xs opacity-75">{item.keyword}</p>
        </button>
      ))}
    </div>
  );
}
