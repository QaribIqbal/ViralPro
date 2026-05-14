import { NextResponse } from "next/server";

function extensionFromMime(mime: string) {
  const normalized = mime.toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("jpeg") || normalized.includes("jpg")) return "jpg";
  if (normalized.includes("webp")) return "webp";
  return "png";
}

function extensionFromUrl(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "png";
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "jpg";
  if (lower.includes(".webp")) return "webp";
  return null;
}

function sanitizeFilename(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceUrl = searchParams.get("url");
    const rawName = searchParams.get("name") || "viralpro-image";
    const imageId = searchParams.get("imageId") || "image";

    if (!sourceUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(sourceUrl);
    } catch {
      return NextResponse.json({ error: "Invalid source url" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
    }

    const upstream = await fetch(sourceUrl);
    if (!upstream.ok) {
      console.error("image-download upstream failed", { status: upstream.status });
      return NextResponse.json({ error: "Unable to download image" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/png";
    const ext = extensionFromMime(contentType) || extensionFromUrl(sourceUrl) || "png";
    const safeBase = sanitizeFilename(rawName) || `viralpro-image-${sanitizeFilename(imageId) || "image"}`;
    const finalFilename = `${safeBase}.${ext}`;

    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename=\"${finalFilename}\"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("image-download route error", error);
    return NextResponse.json({ error: "Unable to download image" }, { status: 500 });
  }
}
