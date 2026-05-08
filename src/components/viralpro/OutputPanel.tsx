import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

export function OutputPanel({ loading, output }: { loading: boolean; output: string }) {
  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-[var(--text)]">Generated Output</h3>
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        {loading ? <LoadingState /> : <p className="whitespace-pre-line text-sm text-[var(--text-muted)]">{output}</p>}
      </div>
    </Card>
  );
}
