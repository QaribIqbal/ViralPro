import type { Env } from "../types/env";
import { createSupabaseAdmin } from "../db/supabase";
import type { GeneratedImage } from "../db/types";
import type { GenerateImageInput } from "../validation/image.schema";
import { callImageGenerationWorkflow } from "./n8n.service";
import { assertImageLimit, incrementImageUsage } from "./usage.service";
import {
  deleteGeneratedImageFromStorage,
  uploadGeneratedImageBytes,
  uploadGeneratedImageIfNeeded,
} from "./storage.service";
import { AppError } from "../utils/errors";
import { getPagination, paginatedResult } from "../utils/pagination";

async function verifyArticleOwnership(
  env: Env,
  userId: string,
  articleId: string
) {
  const supabase = createSupabaseAdmin(env);
  const { data, error } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to verify article.");
  }

  if (!data) {
    throw new AppError(404, "NOT_FOUND", "Article not found.");
  }
}

export async function generateImage(
  env: Env,
  userId: string,
  input: GenerateImageInput,
  options?: { skipLimitCheck?: boolean }
) {
  const supabase = createSupabaseAdmin(env);

  if (!options?.skipLimitCheck) {
    await assertImageLimit(env, userId);
  }

  if (input.articleId) {
    await verifyArticleOwnership(env, userId, input.articleId);
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
    throw new AppError(500, "INTERNAL_ERROR", "Unable to create image record.");
  }

  try {
    const result = await callImageGenerationWorkflow(env, {
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

    if (!imageUrl && result.imageBytes) {
      const uploaded = await uploadGeneratedImageBytes({
        env,
        userId,
        imageId: image.id,
        bytes: result.imageBytes,
        mimeType: result.mimeType,
      });
      imageUrl = uploaded.imageUrl;
      storagePath = uploaded.storagePath;
    }

    if (!imageUrl && result.imageBase64) {
      const uploaded = await uploadGeneratedImageIfNeeded({
        env,
        userId,
        imageId: image.id,
        imageBase64: result.imageBase64,
        mimeType: result.mimeType,
      });
      imageUrl = uploaded?.imageUrl ?? null;
      storagePath = uploaded?.storagePath ?? null;
    }

    if (!imageUrl) {
      throw new AppError(
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
      throw new AppError(
        500,
        "INTERNAL_ERROR",
        "Unable to save generated image."
      );
    }

    await incrementImageUsage(env, userId);

    return completed as GeneratedImage;
  } catch (error) {
    await supabase
      .from("generated_images")
      .update({
        status: "failed",
        error_message:
          error instanceof AppError
            ? error.publicMessage
            : "Image generation failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", image.id)
      .eq("user_id", userId);

    throw error;
  }
}

export async function listImages(env: Env, userId: string, requestUrl: string) {
  const supabase = createSupabaseAdmin(env);
  const { searchParams } = new URL(requestUrl);
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
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load images.");
  }

  return paginatedResult((data ?? []) as GeneratedImage[], count, pagination);
}

export async function deleteImage(env: Env, userId: string, imageId: string) {
  const supabase = createSupabaseAdmin(env);
  const { data: image, error: fetchError } = await supabase
    .from("generated_images")
    .select("*")
    .eq("id", imageId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load image.");
  }

  if (!image) {
    throw new AppError(404, "NOT_FOUND", "Image not found.");
  }

  await deleteGeneratedImageFromStorage(env, image.storage_path);

  const { error: deleteError } = await supabase
    .from("generated_images")
    .delete()
    .eq("id", imageId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to delete image.");
  }

  return { deleted: true };
}

export async function deleteArticleImages(
  env: Env,
  userId: string,
  articleId: string
) {
  const supabase = createSupabaseAdmin(env);
  const { data: images, error } = await supabase
    .from("generated_images")
    .select("id, storage_path")
    .eq("user_id", userId)
    .eq("article_id", articleId);

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load linked images.");
  }

  await Promise.all(
    (images ?? []).map((image) =>
      deleteGeneratedImageFromStorage(env, image.storage_path)
    )
  );

  const { error: deleteError } = await supabase
    .from("generated_images")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);

  if (deleteError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to delete linked images.");
  }
}
