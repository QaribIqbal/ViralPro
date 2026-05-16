import { createServerSupabaseClient } from "@/server/db/supabase-server";
import type { GenerationTemplate } from "@/server/db/types";
import type { CreateTemplateInput } from "@/server/validation/template.schema";
import { ApiError } from "@/server/utils/errors";

export async function createTemplateForUser(
  userId: string,
  input: CreateTemplateInput
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("generation_templates")
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      settings: input.settings,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to create template.");
  }

  return data as GenerationTemplate;
}

export async function listTemplatesForUser(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("generation_templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load templates.");
  }

  return { items: (data ?? []) as GenerationTemplate[] };
}

export async function deleteTemplateForUser(userId: string, templateId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error: fetchError } = await supabase
    .from("generation_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load template.");
  }

  if (!data) {
    throw new ApiError(404, "NOT_FOUND", "Template not found.");
  }

  const { error } = await supabase
    .from("generation_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", userId);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to delete template.");
  }

  return { deleted: true };
}
