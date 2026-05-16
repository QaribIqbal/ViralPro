import { createServerSupabaseClient } from "@/server/db/supabase-server";
import type { Article, GeneratedImage } from "@/server/db/types";
import type { GenerateArticleInput } from "@/server/validation/article.schema";
import { callArticleGenerationWorkflow } from "@/server/services/n8n";
import {
  assertArticleLimit,
  incrementArticleUsage,
} from "@/server/services/usage";
import {
  deleteArticleImagesForUser,
  generateImageForUser,
} from "@/server/services/images";
import { ApiError } from "@/server/utils/errors";
import { getPagination, paginatedResult } from "@/server/utils/pagination";

type ArticleSummary = Pick<
  Article,
  | "id"
  | "title"
  | "topic"
  | "excerpt"
  | "status"
  | "word_count"
  | "seo_score"
  | "created_at"
  | "featured_image_id"
> & {
  featuredImage?: Pick<
    GeneratedImage,
    "id" | "image_url" | "alt_text" | "width" | "height"
  > | null;
};

async function assertTemplateOwnership(userId: string, templateId?: string) {
  if (!templateId) return;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("generation_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to verify template.");
  }

  if (!data) {
    throw new ApiError(404, "NOT_FOUND", "Template not found.");
  }
}

export async function generateArticleForUser(
  userId: string,
  input: GenerateArticleInput
) {
  const supabase = await createServerSupabaseClient();

  await assertArticleLimit(userId);
  await assertTemplateOwnership(userId, input.templateId);

  const generationSettings = {
    articleType: input.articleType ?? null,
    tone: input.tone ?? null,
    language: input.language ?? "English",
    wordCount: input.wordCount ?? 1500,
    generateImage: input.generateImage ?? false,
    aiSearchOptimized: input.aiSearchOptimized ?? false,
    templateId: input.templateId ?? null,
    extraInstructions: input.extraInstructions ?? null,
  };

  const { data: article, error: createError } = await supabase
    .from("articles")
    .insert({
      user_id: userId,
      topic: input.topic,
      primary_keyword: input.primaryKeyword ?? null,
      status: "generating",
      ai_search_optimized: input.aiSearchOptimized ?? false,
      generation_settings: generationSettings,
    })
    .select("*")
    .single();

  if (createError || !article) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to create article.");
  }

  try {
    const result = await callArticleGenerationWorkflow({
      articleId: article.id,
      userId,
      topic: input.topic,
      primaryKeyword: input.primaryKeyword,
      articleType: input.articleType,
      tone: input.tone,
      language: input.language ?? "English",
      wordCount: input.wordCount ?? 1500,
      aiSearchOptimized: input.aiSearchOptimized ?? false,
      generateImage: input.generateImage ?? false,
      extraInstructions: input.extraInstructions,
    });

    const { data: completed, error: updateError } = await supabase
      .from("articles")
      .update({
        title: result.title ?? null,
        content_html: result.contentHtml ?? null,
        content_markdown: result.contentMarkdown ?? null,
        excerpt: result.excerpt ?? null,
        meta_title: result.metaTitle ?? null,
        meta_description: result.metaDescription ?? null,
        slug: result.slug ?? null,
        word_count: result.wordCount ?? null,
        seo_score: result.seoScore ?? null,
        references: result.references ?? [],
        status: "completed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError || !completed) {
      throw new ApiError(500, "INTERNAL_ERROR", "Unable to save article.");
    }

    await incrementArticleUsage(userId);

    let featuredImage: GeneratedImage | null = null;

    if (input.generateImage) {
      try {
        featuredImage = await generateImageForUser(
          userId,
          {
            prompt:
              result.imagePrompt ??
              `Professional SEO blog image for: ${result.title ?? input.topic}`,
            articleId: article.id,
            aspectRatio: "16:9",
            style: "professional SaaS blog image",
            altText: result.title ?? input.topic,
          },
          { skipLimitCheck: false }
        );

        await supabase
          .from("articles")
          .update({
            featured_image_id: featuredImage.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", article.id)
          .eq("user_id", userId);
      } catch (imageError) {
        console.error("Optional article image generation failed", {
          articleId: article.id,
          message:
            imageError instanceof Error ? imageError.message : "unknown error",
        });
      }
    }

    return {
      ...completed,
      featuredImage,
    };
  } catch (error) {
    await supabase
      .from("articles")
      .update({
        status: "failed",
        error_message:
          error instanceof ApiError
            ? error.publicMessage
            : "Article generation failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .eq("user_id", userId);

    throw error;
  }
}

export async function listArticlesForUser(userId: string, url: string) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(url);
  const pagination = getPagination(searchParams);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();

  let query = supabase
    .from("articles")
    .select(
      "id,title,topic,excerpt,status,word_count,seo_score,created_at,featured_image_id",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    const safeSearch = search.replace(/[%,()]/g, " ").trim();
    if (safeSearch) {
      query = query.or(
        `title.ilike.%${safeSearch}%,topic.ilike.%${safeSearch}%,primary_keyword.ilike.%${safeSearch}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load articles.");
  }

  const summaries = (data ?? []) as ArticleSummary[];
  const featuredImageIds = summaries
    .map((article) => article.featured_image_id)
    .filter((id): id is string => Boolean(id));

  if (featuredImageIds.length > 0) {
    const { data: images, error: imageError } = await supabase
      .from("generated_images")
      .select("id,image_url,alt_text,width,height")
      .eq("user_id", userId)
      .in("id", featuredImageIds);

    if (imageError) {
      throw new ApiError(
        500,
        "INTERNAL_ERROR",
        "Unable to load featured images."
      );
    }

    const imageMap = new Map((images ?? []).map((image) => [image.id, image]));
    summaries.forEach((article) => {
      article.featuredImage = article.featured_image_id
        ? imageMap.get(article.featured_image_id) ?? null
        : null;
    });
  }

  return paginatedResult(summaries, count, pagination);
}

export async function getArticleForUser(userId: string, articleId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load article.");
  }

  if (!article) {
    throw new ApiError(404, "NOT_FOUND", "Article not found.");
  }

  const { data: images, error: imagesError } = await supabase
    .from("generated_images")
    .select("*")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (imagesError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load article images.");
  }

  return {
    ...(article as Article),
    images: (images ?? []) as GeneratedImage[],
  };
}

export async function deleteArticleForUser(userId: string, articleId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load article.");
  }

  if (!article) {
    throw new ApiError(404, "NOT_FOUND", "Article not found.");
  }

  await deleteArticleImagesForUser(userId, articleId);

  const { error: deleteError } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to delete article.");
  }

  return { deleted: true };
}

// Future queue/callback architecture can split this service into:
// create generation job -> enqueue worker -> n8n callback updates article status.
