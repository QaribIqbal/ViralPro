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

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function plainTextFromHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function firstMatchGroup(input: string, pattern: RegExp) {
  const match = input.match(pattern);
  return match?.[1] ? plainTextFromHtml(match[1]) : "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function countWordsFromHtml(value: string) {
  if (!value.trim()) return 0;
  return plainTextFromHtml(value).split(/\s+/).filter(Boolean).length;
}

function deriveFieldsFromHtml(contentHtml: string) {
  if (!contentHtml.trim()) {
    return {
      title: "",
      excerpt: "",
      metaTitle: "",
      metaDescription: "",
    };
  }

  const title = firstMatchGroup(contentHtml, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const intro = firstMatchGroup(
    contentHtml,
    /<section\b[^>]*class=["'][^"']*\bintro\b[^"']*["'][^>]*>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/i
  );
  const firstParagraph = firstMatchGroup(contentHtml, /<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const metaTitle = firstMatchGroup(
    contentHtml,
    /<strong>\s*Meta\s*Title:\s*<\/strong>\s*([\s\S]*?)<\/p>/i
  );
  const metaDescription = firstMatchGroup(
    contentHtml,
    /<strong>\s*Meta\s*Description:\s*<\/strong>\s*([\s\S]*?)<\/p>/i
  );

  return {
    title,
    excerpt: intro || firstParagraph,
    metaTitle,
    metaDescription,
  };
}

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
  const { contentBrief, configuration } = input;

  await assertArticleLimit(userId);
  await assertTemplateOwnership(userId, input.templateId);

  const generationSettings = {
    articleType: configuration.articleType ?? null,
    tone: configuration.tone ?? null,
    language: configuration.language ?? "English",
    wordCount: configuration.wordCount ?? 1500,
    generateCoverImage: configuration.generateCoverImage ?? false,
    generateContentImages: configuration.generateContentImages ?? false,
    templateId: input.templateId ?? null,
    additionalContext: configuration.additionalContext ?? null,
  };

  const { data: article, error: createError } = await supabase
    .from("articles")
    .insert({
      user_id: userId,
      topic: contentBrief.topic,
      primary_keyword: contentBrief.targetKeyword ?? null,
      status: "generating",
      ai_search_optimized: false,
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
      contentBrief: {
        topic: contentBrief.topic,
        targetKeyword: contentBrief.targetKeyword,
        customOutline: contentBrief.customOutline,
        liveWebResearch: contentBrief.liveWebResearch,
      },
      configuration: {
        aiModel: configuration.aiModel,
        articleType: configuration.articleType,
        tone: configuration.tone,
        language: configuration.language ?? "English",
        intendedAudience: configuration.intendedAudience,
        additionalContext: configuration.additionalContext,
        wordCount: configuration.wordCount ?? 1500,
        brandVoiceKnowledge: configuration.brandVoiceKnowledge,
        competitorAnalysis: configuration.competitorAnalysis,
        geoOptimization: configuration.geoOptimization,
        firstPerson: configuration.firstPerson,
        hook: configuration.hook,
        htmlElement: configuration.htmlElement,
        readabilityLevel: configuration.readabilityLevel,
        internalLinks: configuration.internalLinks,
        generateContentImages: configuration.generateContentImages,
        generateCoverImage: configuration.generateCoverImage,
        contentImageCount: configuration.contentImageCount,
        includeTextInImages: configuration.includeTextInImages,
        imageStyle: configuration.imageStyle,
        imageAspectRatio: configuration.imageAspectRatio,
      },
    });
    const contentHtml = result.contentHtml ?? "";
    const derived = deriveFieldsFromHtml(contentHtml);
    const resolvedTitle = result.title ?? derived.title ?? contentBrief.topic;
    const resolvedExcerpt = result.excerpt ?? derived.excerpt ?? null;
    const resolvedMetaTitle =
      result.metaTitle ?? derived.metaTitle ?? resolvedTitle ?? null;
    const resolvedMetaDescription =
      result.metaDescription ?? derived.metaDescription ?? null;
    const resolvedSlug = result.slug ?? slugify(resolvedTitle);
    const resolvedWordCount =
      result.wordCount ??
      (contentHtml ? countWordsFromHtml(contentHtml) : null);

    const { data: completed, error: updateError } = await supabase
      .from("articles")
      .update({
        title: resolvedTitle ?? null,
        content_html: contentHtml || null,
        content_markdown: result.contentMarkdown ?? null,
        excerpt: resolvedExcerpt,
        meta_title: resolvedMetaTitle,
        meta_description: resolvedMetaDescription,
        slug: resolvedSlug || null,
        word_count: resolvedWordCount,
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

    if (configuration.generateCoverImage) {
      try {
        featuredImage = await generateImageForUser(
          userId,
          {
            prompt:
            result.imagePrompt ??
            `Professional SEO blog image for: ${resolvedTitle ?? contentBrief.topic}`,
            articleId: article.id,
            aspectRatio: "16:9",
            style: "professional SaaS blog image",
            altText: resolvedTitle ?? contentBrief.topic,
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
