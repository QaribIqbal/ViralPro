"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AiStatus, PoweredByAiBadge } from "@/components/ui/AiVisuals";
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

function enhanceArticleImageFallback(root: HTMLElement | null) {
  if (!root) return;

  const images = Array.from(root.querySelectorAll("img"));

  images.forEach((img) => {
    const element = img as HTMLImageElement;

    if (!element.dataset.fallbackBound) {
      const fallback = document.createElement("span");
      fallback.className = "article-image-fallback";
      fallback.setAttribute("role", "note");
      fallback.setAttribute("aria-live", "polite");
      fallback.textContent = "Image unavailable";
      element.insertAdjacentElement("afterend", fallback);

      const onError = () => {
        element.dataset.imageError = "true";
      };

      const onLoad = () => {
        element.dataset.imageError = "false";
      };

      element.addEventListener("error", onError);
      element.addEventListener("load", onLoad);
      element.dataset.fallbackBound = "true";
      element.dataset.fallbackErrorHandler = "true";
    }

    if (element.complete && element.naturalWidth === 0) {
      element.dataset.imageError = "true";
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
    enhanceArticleImageFallback(articleRef.current);
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--text)]">Generated Output</h3>
            {normalizedHtml ? <PoweredByAiBadge>AI content</PoweredByAiBadge> : null}
          </div>
          {loading ? <div className="mt-2"><AiStatus text="Generating insights..." /></div> : null}
        </div>
        <AnimatePresence>
          {normalizedHtml ? (
            <motion.button
              type="button"
              onClick={() => void handleCopyHtml()}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text)] hover:border-[var(--cta)]"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? "Copied" : "Copy HTML"}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="bg-[var(--surface-muted)]">
        {loading ? <LoadingState /> : null}

        <AnimatePresence mode="wait">
        {!loading && normalizedHtml ? (
          <motion.article
            key="html"
            ref={articleRef}
            className="article-content vp-article-doc"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div dangerouslySetInnerHTML={{ __html: normalizedHtml }} />
          </motion.article>
        ) : null}

        {!loading && !normalizedHtml ? (
          isJson ? (
            <motion.pre key="json" className="m-4 max-h-[600px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--bg)] p-4 text-xs text-[var(--text-muted)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <code>{output}</code>
            </motion.pre>
          ) : (
            <motion.p key="text" className="px-5 py-4 whitespace-pre-line text-sm text-[var(--text-muted)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{output}</motion.p>
          )
        ) : null}
        </AnimatePresence>
      </div>
    </Card>
  );
}
