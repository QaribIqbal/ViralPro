import type { Env } from "../types/env";
import { createSupabaseAdmin } from "../db/supabase";
import { AppError } from "../utils/errors";

const GENERATED_IMAGES_BUCKET = "generated-images";

function extensionFromMimeType(mimeType?: string | null) {
  if (!mimeType) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("gif")) return "gif";
  return "png";
}

function decodeBase64(base64: string) {
  const normalized = base64.includes(",")
    ? base64.slice(base64.indexOf(",") + 1)
    : base64;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function uploadGeneratedImageIfNeeded(params: {
  env: Env;
  userId: string;
  imageId: string;
  imageBase64?: string | null;
  mimeType?: string | null;
}) {
  if (!params.imageBase64) return null;

  const supabase = createSupabaseAdmin(params.env);
  const extension = extensionFromMimeType(params.mimeType);
  const storagePath = `${params.userId}/${params.imageId}.${extension}`;
  const contentType = params.mimeType ?? `image/${extension}`;

  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .upload(storagePath, decodeBase64(params.imageBase64), {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to store generated image.");
  }

  const { data } = supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    imageUrl: data.publicUrl,
  };
}

export async function uploadGeneratedImageBytes(params: {
  env: Env;
  userId: string;
  imageId: string;
  bytes: Uint8Array;
  mimeType?: string | null;
}) {
  const supabase = createSupabaseAdmin(params.env);
  const extension = extensionFromMimeType(params.mimeType);
  const storagePath = `${params.userId}/${params.imageId}.${extension}`;
  const contentType = params.mimeType ?? `image/${extension}`;

  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .upload(storagePath, params.bytes, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to store generated image.");
  }

  const { data } = supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    imageUrl: data.publicUrl,
  };
}

export async function deleteGeneratedImageFromStorage(
  env: Env,
  storagePath?: string | null
) {
  if (!storagePath) return;

  const supabase = createSupabaseAdmin(env);
  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to delete stored image.");
  }
}
