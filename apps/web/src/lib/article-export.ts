export type ExportableArticle = {
  title: string | null;
  topic: string;
  primary_keyword: string | null;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content_html: string | null;
  content_markdown: string | null;
};

function safeFilename(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "article"
  );
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getArticleBaseFilename(article: ExportableArticle) {
  return safeFilename(article.title ?? article.topic);
}

export function htmlToMarkdown(html: string) {
  if (typeof window === "undefined" || !("DOMParser" in window)) {
    return html.replace(/<[^>]+>/g, "").trim();
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const lines: string[] = [];

  document.body.childNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      const text = node.textContent?.trim();
      if (text) lines.push(text);
      return;
    }

    const text = node.textContent?.trim() ?? "";
    if (!text) return;

    if (node.tagName === "H1") lines.push(`# ${text}`);
    else if (node.tagName === "H2") lines.push(`## ${text}`);
    else if (node.tagName === "H3") lines.push(`### ${text}`);
    else if (node.tagName === "LI") lines.push(`- ${text}`);
    else lines.push(text);
  });

  return lines.join("\n\n").trim();
}

export function buildMarkdownExport(article: ExportableArticle) {
  const title = article.title ?? article.topic;
  const body =
    article.content_markdown ??
    (article.content_html ? htmlToMarkdown(article.content_html) : "");
  const metadata = [
    `# ${title}`,
    article.primary_keyword ? `Primary keyword: ${article.primary_keyword}` : "",
    article.meta_title ? `Meta title: ${article.meta_title}` : "",
    article.meta_description
      ? `Meta description: ${article.meta_description}`
      : "",
    article.excerpt ? `Excerpt: ${article.excerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${metadata}\n\n---\n\n${body}`.trim();
}

export function buildHtmlExport(article: ExportableArticle) {
  const title = article.title ?? article.topic;
  const body =
    article.content_html ??
    `<article>${(article.content_markdown ?? "")
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("")}</article>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.meta_title ?? title)}</title>
    ${
      article.meta_description
        ? `<meta name="description" content="${escapeHtml(
            article.meta_description
          )}" />`
        : ""
    }
    <style>
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; background: #f8fafc; }
      main { max-width: 860px; margin: 0 auto; padding: 48px 24px; background: #fff; min-height: 100vh; }
      article { line-height: 1.7; font-size: 17px; }
      h1, h2, h3 { line-height: 1.2; color: #0f172a; }
      img { max-width: 100%; height: auto; }
      table { width: 100%; border-collapse: collapse; margin: 24px 0; display: block; overflow-x: auto; }
      table thead { background: #2563eb; color: #f8fafc; }
      table th, table td { border: 1px solid rgba(37, 99, 235, 0.2); padding: 10px 12px; text-align: left; vertical-align: top; white-space: nowrap; }
      table tbody tr:nth-child(even) { background: #f8fafc; }
      table tbody tr:hover { background: #eef6ff; }
      pre, code { white-space: pre-wrap; background: #f1f5f9; border-radius: 6px; }
    </style>
  </head>
  <body>
    <main>
      ${body}
    </main>
  </body>
</html>`;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
