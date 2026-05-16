import type { Env } from "../types/env";
import { createSupabaseAdmin } from "../db/supabase";
import type { GenerationTemplate } from "../db/types";
import type { CreateTemplateInput } from "../validation/template.schema";
import { AppError } from "../utils/errors";

export async function createTemplate(
  env: Env,
  userId: string,
  input: CreateTemplateInput
) {
  const supabase = createSupabaseAdmin(env);
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
    throw new AppError(500, "INTERNAL_ERROR", "Unable to create template.");
  }

  return data as GenerationTemplate;
}

export async function listTemplates(env: Env, userId: string) {
  const supabase = createSupabaseAdmin(env);
  const { data, error } = await supabase
    .from("generation_templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load templates.");
  }

  return { items: (data ?? []) as GenerationTemplate[] };
}

export async function deleteTemplate(
  env: Env,
  userId: string,
  templateId: string
) {
  const supabase = createSupabaseAdmin(env);
  const { data, error: fetchError } = await supabase
    .from("generation_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to load template.");
  }

  if (!data) {
    throw new AppError(404, "NOT_FOUND", "Template not found.");
  }

  const { error } = await supabase
    .from("generation_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", userId);

  if (error) {
    throw new AppError(500, "INTERNAL_ERROR", "Unable to delete template.");
  }

  return { deleted: true };
}
