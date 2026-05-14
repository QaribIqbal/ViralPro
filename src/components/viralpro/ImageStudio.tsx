"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { ImageItem } from "@/server/domain/types";

type GeneratedImage = {
  id: string;
  title: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
};

const HISTORY_KEY = "viralpro-generated-images";
const MAX_HISTORY_ITEMS = 12;

function loadGeneratedHistory(): GeneratedImage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GeneratedImage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGeneratedHistory(images: GeneratedImage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(images.slice(0, MAX_HISTORY_ITEMS)));
  } catch {
    // Ignore quota failures to avoid blocking generation flow.
  }
}

function sanitizeFilename(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function extensionFromMime(mime: string) {
  const normalized = mime.toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("jpeg") || normalized.includes("jpg")) return "jpg";
  if (normalized.includes("webp")) return "webp";
  return "png";
}

async function downloadImage(image: GeneratedImage) {
  const fileBase = sanitizeFilename(image.prompt || image.title || `viralpro-image-${image.id}`) || "viralpro-image";

  if (image.url.startsWith("blob:")) {
    const anchor = document.createElement("a");
    anchor.href = image.url;
    anchor.download = `${fileBase}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  // Data URLs can be downloaded directly with a proper extension.
  if (image.url.startsWith("data:")) {
    const mime = image.url.slice(5, image.url.indexOf(";")) || "image/png";
    const ext = extensionFromMime(mime);
    const anchor = document.createElement("a");
    anchor.href = image.url;
    anchor.download = `${fileBase}.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  // Use backend proxy to enforce stable filename + extension headers.
  const href = `/api/ai/image-download?url=${encodeURIComponent(image.url)}&name=${encodeURIComponent(fileBase)}&imageId=${encodeURIComponent(image.id)}`;
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `${fileBase}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("product");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryImages, setLibraryImages] = useState<GeneratedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => loadGeneratedHistory());
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const res = await fetch("/api/images");
        if (!res.ok) return;
        const data = (await res.json()) as { items: ImageItem[] };
        if (!mounted) return;

        const mapped = (Array.isArray(data.items) ? data.items : []).map((item) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          prompt: item.title,
          model: "demo-seed",
          createdAt: new Date().toISOString(),
        }));

        setLibraryImages(mapped);
      } catch (fetchError) {
        console.error("image library fetch failed", fetchError);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const allImages = useMemo(() => [...generatedImages, ...libraryImages], [generatedImages, libraryImages]);

  const handleGenerateImage = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/image-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, aspectRatio, negativePrompt }),
      });

      if (!response.ok) {
        let message = "Image generation failed";
        try {
          const errorJson = (await response.json()) as { error?: string };
          if (errorJson?.error) {
            message = errorJson.error;
          }
        } catch {
          try {
            const errorText = await response.text();
            if (errorText) {
              message = errorText;
            }
          } catch {
            // Ignore parse failures.
          }
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const nextImage: GeneratedImage = {
        id: `generated-${Date.now()}`,
        title: "Generated Image",
        url: blobUrl,
        prompt,
        model: "gemini-image",
        createdAt: new Date().toISOString(),
      };

      setGeneratedImages((prev) => {
        const next = [nextImage, ...prev].slice(0, MAX_HISTORY_ITEMS);
        saveGeneratedHistory(next);
        return next;
      });

      setSelectedImage(nextImage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image generation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">AI Image Studio</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Trigger n8n workflow for Gemini image generation.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--text)]" htmlFor="image-prompt">
              Prompt
            </label>
            <textarea
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Modern workspace desk setup with natural lighting, editorial style"
              className="min-h-[110px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
              suppressHydrationWarning
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
              suppressHydrationWarning
            >
              <option value="product">Product</option>
              <option value="photoreal">Photoreal</option>
              <option value="cinematic">Cinematic</option>
              <option value="illustration">Illustration</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
              suppressHydrationWarning
            >
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--text)]" htmlFor="negative-prompt">
              Negative Prompt (optional)
            </label>
            <Input
              id="negative-prompt"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, watermark, distorted text"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}

        <div className="mt-4">
          <Button type="button" onClick={handleGenerateImage} disabled={loading || !prompt.trim()}>
            {loading ? "Generating Image..." : "Generate Image"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text)]">Generated History</h3>
          {generatedImages.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setGeneratedImages([]);
                saveGeneratedHistory([]);
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>

        {generatedImages.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No generated images yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generatedImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <button type="button" onClick={() => setSelectedImage(image)} className="block w-full text-left" suppressHydrationWarning>
                  <Image
                    src={image.url}
                    alt={image.title}
                    width={1024}
                    height={1024}
                    unoptimized={image.url.startsWith("data:") || image.url.startsWith("blob:")}
                    className="h-52 w-full object-cover"
                  />
                </button>
                <div className="space-y-2 p-3">
                  <p className="text-sm font-medium text-[var(--text)]">{image.title}</p>
                  <p className="line-clamp-2 text-xs text-[var(--text-muted)]">{image.prompt}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[var(--cta)]">{image.model}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 px-2 text-xs"
                      onClick={() => void downloadImage(image)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Image Library</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(image)}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left"
              suppressHydrationWarning
            >
              <Image
                src={image.url}
                alt={image.title}
                width={1024}
                height={1024}
                unoptimized={image.url.startsWith("data:") || image.url.startsWith("blob:")}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-1 p-3">
                <p className="text-sm font-medium text-[var(--text)]">{image.title}</p>
                <p className="line-clamp-2 text-xs text-[var(--text-muted)]">{image.prompt}</p>
                <p className="text-[11px] text-[var(--cta)]">{image.model}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {selectedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-[var(--surface)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{selectedImage.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{selectedImage.model}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => void downloadImage(selectedImage)}>
                  Download
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="bg-black p-2">
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                width={1600}
                height={1200}
                unoptimized={selectedImage.url.startsWith("data:") || selectedImage.url.startsWith("blob:")}
                className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-[var(--text-muted)]">{selectedImage.prompt}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
