import type { Env } from "../types/env";
import { createSupabaseAdmin } from "../db/supabase";
import type { Article, GeneratedImage } from "../db/types";
import type {
  GenerateArticleInput,
  UpdateArticleInput,
} from "../validation/article.schema";
import { callArticleGenerationWorkflow } from "./n8n.service";
import { assertArticleLimit, incrementArticleUsage } from "./usage.service";
import { deleteArticleImages, generateImage } from "./images.service";
import { AppError } from "../utils/errors";
import { getPagination, paginatedResult } from "../utils/pagination";

type ArticleSummary = Pick<
  Article,
  | "id"
  | "title"
  | "topic"
  | "excerpt"
  | "status"
  | "primary_keyword"
  | "word_count"
  | "seo_score"
  | "created_at"
  | "updated_at"
  | "featured_image_id"
> & {
  featuredImage?: Pick<
    GeneratedImage,
    "id" | "image_url" | "alt_text" | "width" | "height"
  > | null;
};

async function assertTemplateOwnership(
  env: Env,
  userId: string,
  templateId?: string
) {
  if (!templateId) return;

  const supabase = createSupabaseAdmin(env);
  const { data, error } = await supabase
    .from("generation_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to verify template.");
  }

  if (!data) {
    throw new AppError(404, "NOT_FOUND", "Template not found.");
  }
}

export async function generateArticle(
  env: Env,
  userId: string,
  input: GenerateArticleInput
) {
  const supabase = createSupabaseAdmin(env);

  await assertArticleLimit(env, userId);
  await assertTemplateOwnership(env, userId, input.templateId);

  const generationSettings = {
    articleType: input.articleType ?? null,
    tone: input.tone ?? null,
    language: input.language ?? "English",
    intendedAudience: input.intendedAudience ?? null,
    customOutline: input.customOutline ?? null,
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
    throw new AppError(500, "INTERNAL_ERROR", "Unable to create article.");
  }

  try {
    const result = await callArticleGenerationWorkflow(env, {
      articleId: article.id,
      userId,
      topic: input.topic,
      primaryKeyword: input.primaryKeyword,
      articleType: input.articleType,
      tone: input.tone,
      language: input.language ?? "English",
      intendedAudience: input.intendedAudience,
      customOutline: input.customOutline,
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
        external_references: result.references ?? [],
        status: "completed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError || !completed) {
      throw new AppError(500, "INTERNAL_ERROR", "Unable to save article.");
    }

    await incrementArticleUsage(env, userId);

    let featuredImage: GeneratedImage | null = null;

    if (input.generateImage) {
      try {
        featuredImage = await generateImage(env, userId, {
          prompt:
            result.imagePrompt ??
            `Professional SEO blog image for: ${result.title ?? input.topic}`,
          articleId: article.id,
          aspectRatio: "16:9",
          style: "professional SaaS blog image",
          altText: result.title ?? input.topic,
        });

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
          error instanceof AppError
            ? error.publicMessage
            : "Article generation failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .eq("user_id", userId);

    throw error;
  }
}

export async function listArticles(
  env: Env,
  userId: string,
  requestUrl: string
) {
  const supabase = createSupabaseAdmin(env);
  const { searchParams } = new URL(requestUrl);
  const pagination = getPagination(searchParams);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();

  let query = supabase
    .from("articles")
    .select(
      "id,title,topic,primary_keyword,excerpt,status,word_count,seo_score,created_at,updated_at,featured_image_id",
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
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load articles.");
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
      throw new AppError(
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

export async function getArticleById(
  env: Env,
  userId: string,
  articleId: string
) {
  const supabase = createSupabaseAdmin(env);
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load article.");
  }

  if (!article) {
    throw new AppError(404, "NOT_FOUND", "Article not found.");
  }

  const { data: images, error: imagesError } = await supabase
    .from("generated_images")
    .select("*")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (imagesError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load article images.");
  }

  return {
    ...(article as Article),
    images: (images ?? []) as GeneratedImage[],
  };
}

export async function updateArticle(
  env: Env,
  userId: string,
  articleId: string,
  input: UpdateArticleInput
) {
  const supabase = createSupabaseAdmin(env);
  const patch: Record<string, string | null> = {};

  if ("title" in input) patch.title = input.title ?? null;
  if ("contentHtml" in input) patch.content_html = input.contentHtml ?? null;
  if ("contentMarkdown" in input) {
    patch.content_markdown = input.contentMarkdown ?? null;
  }
  if ("excerpt" in input) patch.excerpt = input.excerpt ?? null;
  if ("metaTitle" in input) patch.meta_title = input.metaTitle ?? null;
  if ("metaDescription" in input) {
    patch.meta_description = input.metaDescription ?? null;
  }
  if ("slug" in input) patch.slug = input.slug ?? null;
  if ("status" in input && input.status) patch.status = input.status;

  const { data, error } = await supabase
    .from("articles")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to update article.");
  }

  if (!data) {
    throw new AppError(404, "NOT_FOUND", "Article not found.");
  }

  return data as Article;
}

export async function deleteArticle(
  env: Env,
  userId: string,
  articleId: string
) {
  const supabase = createSupabaseAdmin(env);
  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load article.");
  }

  if (!article) {
    throw new AppError(404, "NOT_FOUND", "Article not found.");
  }

  await deleteArticleImages(env, userId, articleId);

  const { error: deleteError } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to delete article.");
  }

  return { deleted: true };
}

// Future queue/callback architecture can split this service into:
// create generation job -> enqueue worker -> n8n callback updates article status.
