import { createServerSupabaseClient } from "@/server/db/supabase-server";
import type { GeneratedImage } from "@/server/db/types";
import type { GenerateImageInput } from "@/server/validation/image.schema";
import { callImageGenerationWorkflow } from "@/server/services/n8n";
import { assertImageLimit, incrementImageUsage } from "@/server/services/usage";
import {
  deleteGeneratedImageFromStorage,
  uploadGeneratedImage,
} from "@/server/services/storage";
import { ApiError } from "@/server/utils/errors";
import {
  getPagination,
  paginatedResult,
} from "@/server/utils/pagination";

async function verifyArticleOwnership(userId: string, articleId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to verify article.");
  }

  if (!data) {
    throw new ApiError(404, "NOT_FOUND", "Article not found.");
  }
}

export async function generateImageForUser(
  userId: string,
  input: GenerateImageInput,
  options?: { skipLimitCheck?: boolean }
) {
  const supabase = await createServerSupabaseClient();

  if (!options?.skipLimitCheck) {
    await assertImageLimit(userId);
  }

  if (input.articleId) {
    await verifyArticleOwnership(userId, input.articleId);
  }

  const { data: image, error: createError } = await supabase
    .from("generated_images")
    .insert({
      user_id: userId,
      article_id: input.articleId ?? null,
      prompt: input.prompt,
      alt_text: input.altText ?? null,
      aspect_ratio: input.aspectRatio ?? "16:9",
      status: "generating",
    })
    .select("*")
    .single();

  if (createError || !image) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to create image record.");
  }

  try {
    const result = await callImageGenerationWorkflow({
      imageId: image.id,
      userId,
      articleId: input.articleId,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio ?? "16:9",
      style: input.style ?? "professional SaaS blog image",
      altText: input.altText,
    });

    let imageUrl = result.imageUrl ?? null;
    let storagePath = result.storagePath ?? null;

    if (!imageUrl && result.imageBase64) {
      const uploaded = await uploadGeneratedImage({
        userId,
        imageId: image.id,
        imageBase64: result.imageBase64,
        mimeType: result.mimeType,
      });
      imageUrl = uploaded.imageUrl;
      storagePath = uploaded.storagePath;
    }

    if (!imageUrl) {
      throw new ApiError(
        502,
        "UPSTREAM_ERROR",
        "Automation workflow did not return an image."
      );
    }

    const { data: completed, error: updateError } = await supabase
      .from("generated_images")
      .update({
        image_url: imageUrl,
        storage_path: storagePath,
        width: result.width ?? null,
        height: result.height ?? null,
        alt_text: result.altText ?? input.altText ?? null,
        status: "completed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", image.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError || !completed) {
      throw new ApiError(500, "INTERNAL_ERROR", "Unable to save generated image.");
    }

    await incrementImageUsage(userId);

    return completed as GeneratedImage;
  } catch (error) {
    await supabase
      .from("generated_images")
      .update({
        status: "failed",
        error_message:
          error instanceof ApiError
            ? error.publicMessage
            : "Image generation failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", image.id)
      .eq("user_id", userId);

    throw error;
  }
}

export async function listImagesForUser(userId: string, url: string) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(url);
  const pagination = getPagination(searchParams);
  const articleId = searchParams.get("articleId");

  let query = supabase
    .from("generated_images")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  if (articleId) {
    query = query.eq("article_id", articleId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load images.");
  }

  return paginatedResult((data ?? []) as GeneratedImage[], count, pagination);
}

export async function deleteImageForUser(userId: string, imageId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: image, error: fetchError } = await supabase
    .from("generated_images")
    .select("*")
    .eq("id", imageId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load image.");
  }

  if (!image) {
    throw new ApiError(404, "NOT_FOUND", "Image not found.");
  }

  await deleteGeneratedImageFromStorage(image.storage_path);

  const { error: deleteError } = await supabase
    .from("generated_images")
    .delete()
    .eq("id", imageId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to delete image.");
  }

  return { deleted: true };
}

export async function deleteArticleImagesForUser(
  userId: string,
  articleId: string
) {
  const supabase = await createServerSupabaseClient();
  const { data: images, error } = await supabase
    .from("generated_images")
    .select("id, storage_path")
    .eq("user_id", userId)
    .eq("article_id", articleId);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load linked images.");
  }

  await Promise.all(
    (images ?? []).map((image) =>
      deleteGeneratedImageFromStorage(image.storage_path)
    )
  );

  const { error: deleteError } = await supabase
    .from("generated_images")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);

  if (deleteError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to delete linked images.");
  }
}
