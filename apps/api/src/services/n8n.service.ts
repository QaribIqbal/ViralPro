import { z } from "zod";
import type { Env } from "../types/env";
import { AppError } from "../utils/errors";

const articleGenerationResponseSchema = z.object({
  title: z.string().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
  output: z.string().optional().nullable(), // Handle common n8n output field
  contentMarkdown: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  wordCount: z.coerce.number().int().nonnegative().optional().nullable(),
  seoScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
  references: z.array(z.record(z.string(), z.unknown())).optional(),
  imagePrompt: z.string().optional().nullable(),
});

const imageGenerationResponseSchema = z.object({
  imageUrl: z.string().url().optional().nullable(),
  storagePath: z.string().optional().nullable(),
  imageBase64: z.string().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  altText: z.string().optional().nullable(),
});

export type ArticleGenerationPayload = {
  articleId: string;
  userId: string;
  contentBrief: {
    topic: string;
    liveWebResearch?: boolean;
    targetKeyword?: string;
    customOutline?: string;
  };
  configuration: {
    aiModel?: string;
    articleType?: string;
    tone?: string;
    language?: string;
    intendedAudience?: string;
    additionalContext?: string;
    wordCount?: number;
    brandVoiceKnowledge?: boolean;
    competitorAnalysis?: boolean;
    geoOptimization?: boolean;
    firstPerson?: boolean;
    hook?: boolean;
    htmlElement?: boolean;
    readabilityLevel?: string;
    internalLinks?: boolean;
    generateContentImages?: boolean;
    generateCoverImage?: boolean;
    contentImageCount?: number;
    includeTextInImages?: boolean;
    imageStyle?: string;
    imageAspectRatio?: string;
  };
};

export type ImageGenerationPayload = {
  imageId: string;
  userId: string;
  articleId?: string;
  prompt: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  style?: string;
  altText?: string;
};

export type BulkGenerationPayload = {
  userId: string;
  batchName: string;
  source?: string;
  globalSettings: {
    batchName: string;
    wordCount: number;
    tone: string;
    articleType: string;
    language: string;
    aiModel: string;
    liveWebResearch: boolean;
    intendedAudience: string;
    additionalContext: string;
    geoOptimization: boolean;
    firstPerson: boolean;
    hook: boolean;
    readabilityLevel: string;
    brandVoiceKnowledge: boolean;
    competitorAnalysis: boolean;
    internalLinks: boolean;
    generateContentImages: boolean;
    includeTextInImages: boolean;
    contentImageCount: number;
  };
  topics: Array<{
    id: string;
    topic: string;
    customSettings?: Partial<{
      batchName: string;
      wordCount: number;
      tone: string;
      articleType: string;
      language: string;
      aiModel: string;
      liveWebResearch: boolean;
      intendedAudience: string;
      additionalContext: string;
      geoOptimization: boolean;
      firstPerson: boolean;
      hook: boolean;
      readabilityLevel: string;
      brandVoiceKnowledge: boolean;
      competitorAnalysis: boolean;
      internalLinks: boolean;
      generateContentImages: boolean;
      includeTextInImages: boolean;
      contentImageCount: number;
    }>;
  }>;
  meta?: {
    topicCount?: number;
    createdAt?: string;
  };
};

const bulkGenerationResponseSchema = z
  .object({
    accepted: z.boolean().optional(),
    runId: z.string().optional().nullable(),
    message: z.string().optional().nullable(),
  })
  .passthrough();

function requireBinding(env: Env, key: keyof Env) {
  const value = env[key];
  if (!value || !value.trim()) {
    throw new AppError(500, "CONFIGURATION_ERROR", `${key} is not configured.`);
  }
  return value.trim();
}

function parseWebhookUrl(rawUrl: string) {
  try {
    return new URL(rawUrl);
  } catch {
    throw new AppError(
      500,
      "CONFIGURATION_ERROR",
      "Automation webhook URL is invalid."
    );
  }
}

async function postJsonToWebhook<TPayload, TResult>(params: {
  env: Env;
  webhookUrl: string;
  payload: TPayload;
  schema: z.ZodType<TResult>;
  timeoutMs?: number;
  allowPlainTextOutput?: boolean;
}) {
  const parsedUrl = parseWebhookUrl(params.webhookUrl);
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    params.timeoutMs ?? 120000
  );

  try {
    const response = await fetch(parsedUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": requireBinding(params.env, "N8N_WEBHOOK_SECRET"),
      },
      body: JSON.stringify(params.payload),
      signal: controller.signal,
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("n8n webhook returned non-OK response", {
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        status: response.status,
        bodyPreview: responseText.slice(0, 400),
      });
      throw new AppError(
        502,
        "UPSTREAM_ERROR",
        "Automation workflow failed. Please try again."
      );
    }

    let json: unknown = {};
    if (responseText.trim()) {
      try {
        json = JSON.parse(responseText);
      } catch {
        if (params.allowPlainTextOutput) {
          json = { output: responseText };
        } else {
          console.error("n8n webhook returned invalid JSON", {
            host: parsedUrl.host,
            pathname: parsedUrl.pathname,
            bodyPreview: responseText.slice(0, 400),
          });
          throw new AppError(
            502,
            "UPSTREAM_ERROR",
            "Automation workflow returned an invalid response."
          );
        }
      }
    }

    let data = json;
    // n8n often returns an array of items. We want the first one.
    if (Array.isArray(json) && json.length > 0) {
      data = json[0];
    } else if (Array.isArray(json) && json.length === 0) {
      data = {};
    }

    const parsed = params.schema.safeParse(data);
    if (!parsed.success) {
      console.error("n8n webhook JSON failed validation", {
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        issues: parsed.error.issues,
        receivedData: typeof data === 'object' ? JSON.stringify(data).slice(0, 500) : data
      });
      throw new AppError(
        502,
        "UPSTREAM_ERROR",
        "Automation workflow response was incomplete."
      );
    }

    const result = parsed.data as any;

    // Map 'output' to 'contentHtml' if it exists and contentHtml is empty
    if (result.output && !result.contentHtml) {
      result.contentHtml = result.output;
    }

    return result as TResult;
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(
        504,
        "UPSTREAM_ERROR",
        "Automation workflow timed out. Please try again."
      );
    }

    console.error("n8n webhook request failed", {
      host: parsedUrl.host,
      pathname: parsedUrl.pathname,
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new AppError(
      502,
      "UPSTREAM_ERROR",
      "Automation workflow is unavailable. Please try again."
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function callArticleGenerationWorkflow(
  env: Env,
  payload: ArticleGenerationPayload
) {
  const structuredPayload = {
    // Tracking metadata for database update callback
    articleId: payload.articleId,
    userId: payload.userId,

    // Core grouped payload from frontend
    contentBrief: {
      topic: payload.contentBrief.topic,
      targetKeyword: payload.contentBrief.targetKeyword ?? "",
      customOutline: payload.contentBrief.customOutline ?? "",
      liveWebResearch: payload.contentBrief.liveWebResearch ?? false,
    },
    configuration: {
      articleType: payload.configuration.articleType ?? "informational",
      tone: payload.configuration.tone ?? "professional",
      language: payload.configuration.language ?? "english",
      intendedAudience: payload.configuration.intendedAudience ?? "",
      additionalContext: payload.configuration.additionalContext ?? "",
      wordCount: payload.configuration.wordCount ?? 1500,
      aiModel: payload.configuration.aiModel ?? "claude-sonnet-4.6",
    },

    // Keep compatibility fields for existing n8n workflow nodes.
    topic: payload.contentBrief.topic,
    targetKeyword: payload.contentBrief.targetKeyword ?? "",

    intelligence: {
      brandVoiceKnowledge: payload.configuration.brandVoiceKnowledge ?? false,
      competitorAnalysis: payload.configuration.competitorAnalysis ?? false,
    },

    structuralElements: {
      geoOptimization: payload.configuration.geoOptimization ?? false,
      firstPerson: payload.configuration.firstPerson ?? false,
      hook: payload.configuration.hook ?? false,
      htmlElement: payload.configuration.htmlElement ?? false,
      readabilityLevel: payload.configuration.readabilityLevel ?? "default-7th",
      internalLinks: payload.configuration.internalLinks ?? false,
    },

    visualEngine: {
      generateContentImages: payload.configuration.generateContentImages ?? false,
      generateCoverImage: payload.configuration.generateCoverImage ?? false,
      contentImageCount: payload.configuration.contentImageCount ?? 0,
      advanced: {
        style: payload.configuration.imageStyle ?? "photoreal",
        aspectRatio: payload.configuration.imageAspectRatio ?? "16:9",
      },
    },
  };

  return postJsonToWebhook({
    env,
    webhookUrl: requireBinding(env, "N8N_ARTICLE_GENERATION_WEBHOOK_URL"),
    payload: structuredPayload,
    schema: articleGenerationResponseSchema,
    timeoutMs: 300000,
    allowPlainTextOutput: true,
  });
}

export function callImageGenerationWorkflow(
  env: Env,
  payload: ImageGenerationPayload
) {
  const webhookUrl = requireBinding(env, "N8N_IMAGE_GENERATION_WEBHOOK_URL");
  const parsedUrl = parseWebhookUrl(webhookUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  return fetch(parsedUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": requireBinding(env, "N8N_WEBHOOK_SECRET"),
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const bodyPreview = await response.text().catch(() => "");
        console.error("n8n image webhook returned non-OK response", {
          host: parsedUrl.host,
          pathname: parsedUrl.pathname,
          status: response.status,
          bodyPreview: bodyPreview.slice(0, 400),
        });
        throw new AppError(
          502,
          "UPSTREAM_ERROR",
          "Automation workflow failed. Please try again."
        );
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

      // Support direct binary responses from n8n/providers (e.g., image/png).
      if (contentType.startsWith("image/")) {
        const arrayBuffer = await response.arrayBuffer();
        return {
          imageBytes: new Uint8Array(arrayBuffer),
          mimeType: contentType.split(";")[0],
          imageUrl: null,
          storagePath: null,
          imageBase64: null,
          width: null,
          height: null,
          altText: null,
        };
      }

      const responseText = await response.text();
      let json: unknown = {};
      if (responseText.trim()) {
        try {
          json = JSON.parse(responseText);
        } catch {
          console.error("n8n image webhook returned invalid JSON", {
            host: parsedUrl.host,
            pathname: parsedUrl.pathname,
            bodyPreview: responseText.slice(0, 400),
          });
          throw new AppError(
            502,
            "UPSTREAM_ERROR",
            "Automation workflow returned an invalid response."
          );
        }
      }

      let data = json;
      if (Array.isArray(json) && json.length > 0) {
        data = json[0];
      } else if (Array.isArray(json) && json.length === 0) {
        data = {};
      }

      const parsed = imageGenerationResponseSchema.safeParse(data);
      if (!parsed.success) {
        console.error("n8n image webhook JSON failed validation", {
          host: parsedUrl.host,
          pathname: parsedUrl.pathname,
          issues: parsed.error.issues,
        });
        throw new AppError(
          502,
          "UPSTREAM_ERROR",
          "Automation workflow response was incomplete."
        );
      }

      return parsed.data as z.infer<typeof imageGenerationResponseSchema> & {
        imageBytes?: Uint8Array;
      };
    })
    .catch((error: unknown) => {
      if (error instanceof AppError) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError(
          504,
          "UPSTREAM_ERROR",
          "Automation workflow timed out. Please try again."
        );
      }

      console.error("n8n image webhook request failed", {
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        message: error instanceof Error ? error.message : "unknown",
      });
      throw new AppError(
        502,
        "UPSTREAM_ERROR",
        "Automation workflow is unavailable. Please try again."
      );
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}

export function callBulkGenerationWorkflow(
  env: Env,
  payload: BulkGenerationPayload
) {
  const structuredPayload = {
    source: payload.source ?? "viralpro-bulk-studio",
    userId: payload.userId,
    batchName: payload.batchName,
    globalSettings: payload.globalSettings,
    topics: payload.topics,
    meta: {
      topicCount: payload.meta?.topicCount ?? payload.topics.length,
      createdAt: payload.meta?.createdAt ?? new Date().toISOString(),
    },
  };

  const bulkWebhookFromEnv = env.N8N_BULK_GENERATION_WEBHOOK_URL?.trim();
  const webhookUrl = (() => {
    if (bulkWebhookFromEnv) return bulkWebhookFromEnv;

    // Keep bulk generation on the exact same n8n base URL as article generation.
    const articleWebhook = requireBinding(env, "N8N_ARTICLE_GENERATION_WEBHOOK_URL");
    const articleWebhookUrl = parseWebhookUrl(articleWebhook);
    return `${articleWebhookUrl.origin}/webhook-test/11c1ce1b-04ff-436b-8055-1be0c4e951f9`;
  })();

  return postJsonToWebhook({
    env,
    webhookUrl,
    payload: structuredPayload,
    schema: bulkGenerationResponseSchema,
    timeoutMs: 300000,
    allowPlainTextOutput: true,
  });
}
