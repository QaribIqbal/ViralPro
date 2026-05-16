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
              ? "border-[var(--cta)] bg-[var(--cta)] text-white"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--cta)]/40"
          }`}
        >
          <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
          <p className="mt-1 line-clamp-1 text-xs opacity-75">{item.keyword}</p>
        </button>
      ))}
    </div>
  );
}
