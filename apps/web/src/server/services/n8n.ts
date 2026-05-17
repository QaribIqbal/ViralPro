import { z } from "zod";
import { ApiError } from "@/server/utils/errors";

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
    targetKeyword?: string;
    customOutline?: string;
    liveWebResearch?: boolean;
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

export type ArticleGenerationResult = z.infer<
  typeof articleGenerationResponseSchema
>;

export type ImageGenerationPayload = {
  imageId: string;
  userId: string;
  articleId?: string;
  prompt: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  style?: string;
  altText?: string;
};

export type ImageGenerationResult = z.infer<typeof imageGenerationResponseSchema>;

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ApiError(
      500,
      "CONFIGURATION_ERROR",
      `${name} is not configured.`
    );
  }
  return value;
}

function parseWebhookUrl(rawUrl: string) {
  try {
    return new URL(rawUrl);
  } catch {
    throw new ApiError(
      500,
      "CONFIGURATION_ERROR",
      "Automation webhook URL is invalid."
    );
  }
}

async function postJsonToWebhook<TPayload, TResult>(
  params: {
    webhookUrl: string;
    payload: TPayload;
    timeoutMs?: number;
    schema: z.ZodType<TResult>;
  }
): Promise<TResult> {
  const webhookSecret = requireEnv("N8N_WEBHOOK_SECRET");
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
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify(params.payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("n8n webhook returned non-OK response", {
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        status: response.status,
        bodyPreview: responseText.slice(0, 400),
      });
      throw new ApiError(
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
        console.error("n8n webhook returned invalid JSON", {
          host: parsedUrl.host,
          pathname: parsedUrl.pathname,
          bodyPreview: responseText.slice(0, 400),
        });
        throw new ApiError(
          502,
          "UPSTREAM_ERROR",
          "Automation workflow returned an invalid response."
        );
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
      throw new ApiError(
        502,
        "UPSTREAM_ERROR",
        "Automation workflow response was incomplete."
      );
    }

    const result = parsed.data as TResult & {
      contentHtml?: unknown;
      output?: unknown;
    };

    // Map 'output' to 'contentHtml' if it exists and contentHtml is empty
    if (result.output && !result.contentHtml) {
      result.contentHtml = result.output;
    }

    return result as TResult;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      console.error("n8n webhook timed out", {
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
      });
      throw new ApiError(
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
    throw new ApiError(
      502,
      "UPSTREAM_ERROR",
      "Automation workflow is unavailable. Please try again."
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function callArticleGenerationWorkflow(
  payload: ArticleGenerationPayload
) {
  return postJsonToWebhook({
    webhookUrl: requireEnv("N8N_ARTICLE_GENERATION_WEBHOOK_URL"),
    payload,
    schema: articleGenerationResponseSchema,
  });
}

export function callImageGenerationWorkflow(payload: ImageGenerationPayload) {
  return postJsonToWebhook({
    webhookUrl: requireEnv("N8N_IMAGE_GENERATION_WEBHOOK_URL"),
    payload,
    schema: imageGenerationResponseSchema,
  });
}
