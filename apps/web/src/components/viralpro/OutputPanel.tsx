"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AiStatus, OutputBadge } from "@/components/ui/AiVisuals";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

const TRANSPARENT_PIXEL_DATA_URI =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const failedArticleImageSources = new Set<string>();

function isInvalidImageUrl(url: string): boolean {
  if (!url) return true;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed === "" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "[object object]" ||
    trimmed === "[object]" ||
    trimmed === "placeholder" ||
    trimmed === "/" ||
    trimmed === "#" ||
    trimmed.endsWith("/null") ||
    trimmed.endsWith("/undefined") ||
    trimmed.includes("://null") ||
    trimmed.includes("://undefined")
  ) {
    return true;
  }
  return false;
}

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

  // Un-nest the AI's <article> wrapper if present (since we render our own)
  const articleMatch = html.match(/^\s*<article[^>]*>([\s\S]*?)<\/article>\s*$/i);
  if (articleMatch?.[1]) {
    html = articleMatch[1];
  }

  if (typeof window === "undefined" || !("DOMParser" in window)) {
    return html.trim();
  }

  try {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const images = Array.from(parsed.body.querySelectorAll("img"));

    const resolveImageRatio = (img: HTMLImageElement) => {
      const widthAttr = Number(img.getAttribute("width") || 0);
      const heightAttr = Number(img.getAttribute("height") || 0);
      if (widthAttr > 0 && heightAttr > 0) return `${widthAttr} / ${heightAttr}`;
      return "16 / 9";
    };

    images.forEach((node) => {
      const img = node as HTMLImageElement;
      const src = img.getAttribute("src") || "";
      const absoluteSrc = img.src || "";

      const hasFailed =
        isInvalidImageUrl(src) ||
        isInvalidImageUrl(absoluteSrc) ||
        (src && failedArticleImageSources.has(src)) ||
        (absoluteSrc && failedArticleImageSources.has(absoluteSrc)) ||
        failedArticleImageSources.has(src.trim()) ||
        failedArticleImageSources.has(absoluteSrc.trim());

      // Always ensure img is associated with .article-image-shell
      let shell = img.parentElement;
      if (shell?.tagName === "PICTURE") {
        shell.classList.add("article-image-shell");
        shell.style.setProperty("--article-image-ratio", resolveImageRatio(img));
      } else if (!shell || !shell.classList.contains("article-image-shell")) {
        const wrapper = img.ownerDocument.createElement("span");
        wrapper.className = "article-image-shell";
        wrapper.style.setProperty("--article-image-ratio", resolveImageRatio(img));
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        shell = wrapper;
      }

      if (hasFailed) {
        img.dataset.imageError = "true";
        img.dataset.imageErrorLocked = "true";
        img.dataset.originalSrc = src;
        img.classList.add("article-image-broken");
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.setAttribute("src", TRANSPARENT_PIXEL_DATA_URI);

        shell?.setAttribute("data-image-error", "true");
        shell?.classList.add("article-image-shell--broken");
        shell?.style.setProperty("--article-image-ratio", resolveImageRatio(img));
        const picture = img.closest("picture");
        if (picture) {
          picture.querySelectorAll("source").forEach((source) => {
            source.removeAttribute("srcset");
            source.removeAttribute("sizes");
          });
        }

        if (shell && !shell.querySelector(".article-image-fallback")) {
          const fallback = img.ownerDocument.createElement("span");
          fallback.className = "article-image-fallback";
          fallback.setAttribute("role", "note");
          fallback.setAttribute("aria-live", "polite");
          fallback.textContent = "Image is invalid";
          shell.appendChild(fallback);
        }
      }
    });

    return parsed.body.innerHTML.trim();
  } catch (e) {
    console.error("DOM parsing failed in normalizeArticleHtml", e);
    return html.trim();
  }
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

    if (
      title !== "key takeaways" ||
      heading.closest(".article-key-takeaways-card") ||
      heading.closest("aside.key-takeaways")
    ) {
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

  const resolveImageRatio = (img: HTMLImageElement) => {
    const widthAttr = Number(img.getAttribute("width") || 0);
    const heightAttr = Number(img.getAttribute("height") || 0);
    if (widthAttr > 0 && heightAttr > 0) return `${widthAttr} / ${heightAttr}`;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      return `${img.naturalWidth} / ${img.naturalHeight}`;
    }
    return "16 / 9";
  };

  const ensureImageShell = (img: HTMLImageElement) => {
    if (img.parentElement?.classList.contains("article-image-shell")) {
      return img.parentElement as HTMLElement;
    }
    if (img.parentElement?.tagName === "PICTURE") {
      const picture = img.parentElement as HTMLElement;
      picture.classList.add("article-image-shell");
      picture.style.setProperty("--article-image-ratio", resolveImageRatio(img));
      return picture;
    }
    const parent = img.parentNode;
    if (!parent) return null;
    const shell = document.createElement("span");
    shell.className = "article-image-shell";
    shell.style.setProperty("--article-image-ratio", resolveImageRatio(img));
    parent.insertBefore(shell, img);
    shell.appendChild(img);
    return shell;
  };

  const lockImageAsFallback = (img: HTMLImageElement, source?: string) => {
    const shell = ensureImageShell(img);
    if (source && source !== TRANSPARENT_PIXEL_DATA_URI) {
      failedArticleImageSources.add(source);
      const attrSrc = img.getAttribute("src");
      if (attrSrc && attrSrc !== TRANSPARENT_PIXEL_DATA_URI) {
        failedArticleImageSources.add(attrSrc);
      }
      img.dataset.originalSrc = source;
    }
    if (shell) {
      shell.dataset.imageError = "true";
      shell.classList.add("article-image-shell--broken");
      shell.style.setProperty("--article-image-ratio", resolveImageRatio(img));
      if (!shell.querySelector(".article-image-fallback")) {
        const fallback = document.createElement("span");
        fallback.className = "article-image-fallback";
        fallback.setAttribute("role", "note");
        fallback.setAttribute("aria-live", "polite");
        fallback.textContent = "Image is invalid";
        shell.appendChild(fallback);
      }
    }
    img.dataset.imageError = "true";
    img.dataset.imageErrorLocked = "true";
    img.classList.add("article-image-broken");
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    const picture = img.closest("picture");
    if (picture) {
      picture.querySelectorAll("source").forEach((source) => {
        source.removeAttribute("srcset");
        source.removeAttribute("sizes");
      });
    }
    if (img.getAttribute("src") !== TRANSPARENT_PIXEL_DATA_URI) {
      img.setAttribute("src", TRANSPARENT_PIXEL_DATA_URI);
    }
  };

  const images = Array.from(root.querySelectorAll("img"));
  images.forEach((image) => {
    const img = image as HTMLImageElement;
    const shell = ensureImageShell(img);
    if (!shell) return;
    const currentSource =
      img.dataset.originalSrc ||
      img.currentSrc ||
      img.getAttribute("src") ||
      "";

    if (!img.dataset.fallbackBound) {
      if (!shell.querySelector(".article-image-fallback")) {
        const fallback = document.createElement("span");
        fallback.className = "article-image-fallback";
        fallback.setAttribute("role", "note");
        fallback.setAttribute("aria-live", "polite");
        fallback.textContent = "Image is invalid";
        shell.appendChild(fallback);
      }

      img.addEventListener("error", () => {
        const failedSourceCandidate =
          img.dataset.originalSrc ||
          img.currentSrc ||
          img.getAttribute("src") ||
          currentSource ||
          literalSrc ||
          absoluteSrc;
        lockImageAsFallback(img, failedSourceCandidate || undefined);
      });

      img.addEventListener("load", () => {
        if (img.dataset.imageErrorLocked === "true") return;
        if (img.currentSrc === TRANSPARENT_PIXEL_DATA_URI || img.getAttribute("src") === TRANSPARENT_PIXEL_DATA_URI) return;
        img.dataset.imageError = "false";
        img.classList.remove("article-image-broken");
        const imgShell = ensureImageShell(img);
        if (imgShell) {
          delete imgShell.dataset.imageError;
          imgShell.classList.remove("article-image-shell--broken");
          imgShell.style.setProperty("--article-image-ratio", resolveImageRatio(img));
        }
      });

      img.dataset.fallbackBound = "true";
    }

    const literalSrc = img.getAttribute("src") || "";
    const absoluteSrc = img.src || "";
    const hasFailed =
      img.dataset.imageErrorLocked === "true" ||
      shell.classList.contains("article-image-shell--broken") ||
      isInvalidImageUrl(currentSource) ||
      isInvalidImageUrl(literalSrc) ||
      isInvalidImageUrl(absoluteSrc) ||
      (currentSource && failedArticleImageSources.has(currentSource) && currentSource !== TRANSPARENT_PIXEL_DATA_URI) ||
      (literalSrc && failedArticleImageSources.has(literalSrc) && literalSrc !== TRANSPARENT_PIXEL_DATA_URI) ||
      (absoluteSrc && failedArticleImageSources.has(absoluteSrc) && absoluteSrc !== TRANSPARENT_PIXEL_DATA_URI);

    if (hasFailed) {
      lockImageAsFallback(img, currentSource || literalSrc || absoluteSrc);
      return;
    }

    if (img.complete && img.naturalWidth === 0) {
      lockImageAsFallback(img, currentSource);
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
            <h3 className="text-base font-semibold text-[var(--text)]">Article Preview</h3>
            {normalizedHtml ? <OutputBadge>Studio Output</OutputBadge> : null}
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
              {copied ? "Copied!" : "Copy Code"}
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
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <div dangerouslySetInnerHTML={{ __html: normalizedHtml }} />
            </motion.article>
          ) : null}

          {!loading && !normalizedHtml ? (
            isJson ? (
              <motion.pre key="json" className="m-4 max-h-[600px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--bg)] p-4 text-xs text-[var(--text-muted)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <code>{output}</code>
              </motion.pre>
            ) : (
              <motion.p key="text" className="px-5 py-4 whitespace-pre-line text-sm text-[var(--text-muted)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>{output}</motion.p>
            )
          ) : null}
        </AnimatePresence>
      </div>
    </Card>
  );
}
