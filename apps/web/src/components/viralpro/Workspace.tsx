"use client";

import { useEffect, useMemo, useState } from "react";
import type { HistoryItem } from "@/server/domain/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { HistoryPanel } from "@/components/viralpro/HistoryPanel";
import { OutputPanel } from "@/components/viralpro/OutputPanel";

export function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState("");
  const [output, setOutput] = useState("Choose an item from your history or create a new draft to get started.");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/history");
      const data = (await res.json()) as { items: HistoryItem[] };
      setHistory(data.items);
      if (data.items.length > 0) {
        setActiveHistoryId(data.items[0].id);
      }
    })();
  }, []);

  const activeHistory = useMemo(
    () => history.find((item) => item.id === activeHistoryId),
    [history, activeHistoryId]
  );

  const handleGenerate = async () => {
    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = (await res.json()) as { title: string; body: string };
    setOutput(`Title: ${data.title}\n\n${data.body}`);
    setLoading(false);
  };

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[300px_1fr]">
      <Card className="p-4">
        <h2 className="mb-3 text-base font-semibold text-[var(--text)]">Recent Drafts</h2>
        <HistoryPanel
          items={history}
          activeId={activeHistoryId}
          onSelect={(id) => {
            setActiveHistoryId(id);
            const target = history.find((item) => item.id === id);
            setOutput(target ? target.excerpt : output);
          }}
        />
      </Card>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-[var(--text)]">Editorial Workspace</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Refine and manage your AI-generated content in real-time.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-[var(--text)]" htmlFor="prompt">
              Writing Prompt
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Best SEO strategies for dentists in 2026"
            />
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Start Writing"}
              </Button>
              <Button variant="secondary" type="button">
                Save Draft
              </Button>
            </div>
            {activeHistory ? (
              <p className="text-xs text-[var(--text-muted)]">Currently viewing: {activeHistory.title}</p>
            ) : null}
          </div>
        </Card>

        <OutputPanel loading={loading} output={output} />
      </div>
    </div>
  );
}
