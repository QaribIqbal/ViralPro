"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

function normalizeArticleHtml(rawHtml: string): string {
  let html = rawHtml.trim();

  // Remove markdown fences if model wrapped HTML in ```html ... ```.
  const fenceMatch = html.match(/^```(?:html|htm)?\s*\n([\s\S]*?)```\s*$/i);
  if (fenceMatch) {
    html = fenceMatch[1].trim();
  }

  // If full HTML doc was returned, extract <body> content only.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch?.[1]) {
    html = bodyMatch[1].trim();
  }

  // Strip unsafe/non-content tags and keep content semantic.
  html = html
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?head[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "");

  return html.trim();
}

function enhanceKeyTakeawaysPreview(root: HTMLElement | null) {
  if (!root) return;

  const headings = Array.from(root.querySelectorAll("h2, h3, h4"));

  headings.forEach((heading) => {
    const title = (heading.textContent ?? "")
      .replace(/\s+/g, " ")
      .replace(/[:#]+$/g, "")
      .trim()
      .toLowerCase();

    if (title !== "key takeaways" || heading.closest(".article-key-takeaways-card")) {
      return;
    }

    const parent = heading.parentNode;
    if (!parent) return;

    const card = document.createElement("section");
    card.className = "article-key-takeaways-card";
    card.setAttribute("aria-label", "Key Takeaways");
    parent.insertBefore(card, heading);

    const headingLevel = Number(heading.tagName.slice(1));
    let current: ChildNode | null = heading;

    while (current) {
      const nextNode: ChildNode | null = current.nextSibling;

      if (
        current !== heading &&
        current instanceof HTMLElement &&
        /^H[1-6]$/.test(current.tagName) &&
        Number(current.tagName.slice(1)) <= headingLevel
      ) {
        break;
      }

      card.appendChild(current);
      current = nextNode;
    }
  });
}

export function OutputPanel({
  loading,
  output,
  htmlDoc,
}: {
  loading: boolean;
  output: string;
  htmlDoc?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const normalizedHtml = useMemo(
    () => (htmlDoc ? normalizeArticleHtml(htmlDoc) : null),
    [htmlDoc]
  );

  const isJson = output.trim().startsWith("{") || output.trim().startsWith("[");

  useEffect(() => {
    enhanceKeyTakeawaysPreview(articleRef.current);
  }, [normalizedHtml]);

  const handleCopyHtml = async () => {
    if (!normalizedHtml) return;

    try {
      await navigator.clipboard.writeText(normalizedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("copy html failed", error);
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <h3 className="text-base font-semibold text-[var(--text)]">Generated Output</h3>
        {normalizedHtml ? (
          <button
            type="button"
            onClick={() => void handleCopyHtml()}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text)] hover:border-[var(--cta)]"
          >
            {copied ? "Copied" : "Copy HTML"}
          </button>
        ) : null}
      </div>

      <div className="bg-[var(--surface-muted)]">
        {loading ? <LoadingState /> : null}

        {!loading && normalizedHtml ? (
          <article ref={articleRef} className="article-content vp-article-doc">
            <div dangerouslySetInnerHTML={{ __html: normalizedHtml }} />
          </article>
        ) : null}

        {!loading && !normalizedHtml ? (
          isJson ? (
            <pre className="m-4 max-h-[600px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--bg)] p-4 text-xs text-[var(--text-muted)]">
              <code>{output}</code>
            </pre>
          ) : (
            <p className="px-5 py-4 whitespace-pre-line text-sm text-[var(--text-muted)]">{output}</p>
          )
        ) : null}
      </div>
    </Card>
  );
}
