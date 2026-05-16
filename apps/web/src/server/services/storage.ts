import { createServerSupabaseClient } from "@/server/db/supabase-server";
import { ApiError } from "@/server/utils/errors";

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

  return Buffer.from(normalized, "base64");
}

export async function uploadGeneratedImage(params: {
  userId: string;
  imageId: string;
  imageBase64: string;
  mimeType?: string | null;
}) {
  const supabase = await createServerSupabaseClient();
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
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to store generated image.");
  }

  const { data } = supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    imageUrl: data.publicUrl,
  };
}

export async function deleteGeneratedImageFromStorage(storagePath?: string | null) {
  if (!storagePath) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to delete stored image.");
  }
}
