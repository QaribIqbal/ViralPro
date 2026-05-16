import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/server/db/supabase-server";
import type { Plan, Profile, UserUsage } from "@/server/db/types";
import { ApiError } from "@/server/utils/errors";

export const PLAN_LIMITS: Record<
  Plan,
  { articlesPerMonth: number; imagesPerMonth: number; wordpressSites: number }
> = {
  free: {
    articlesPerMonth: 5,
    imagesPerMonth: 20,
    wordpressSites: 1,
  },
  pro: {
    articlesPerMonth: 100,
    imagesPerMonth: 300,
    wordpressSites: 5,
  },
};

export function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function normalizePlan(plan: unknown): Plan {
  return plan === "pro" ? "pro" : "free";
}

export async function getUserProfile(
  userId: string,
  fallback?: Pick<User, "email" | "user_metadata">
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to load profile.");
  }

  if (data) {
    return { ...data, plan: normalizePlan(data.plan) } as Profile;
  }

  const fullName =
    typeof fallback?.user_metadata?.full_name === "string"
      ? fallback.user_metadata.full_name
      : null;

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: fallback?.email ?? null,
      full_name: fullName,
      plan: "free",
    })
    .select("*")
    .single();

  if (createError || !created) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to create profile.");
  }

  return { ...created, plan: normalizePlan(created.plan) } as Profile;
}

export async function getOrCreateUsage(userId: string) {
  const supabase = await createServerSupabaseClient();
  const monthKey = getCurrentMonthKey();

  const { data, error } = await supabase
    .from("user_usage")
    .upsert(
      {
        user_id: userId,
        month_key: monthKey,
      },
      { onConflict: "user_id,month_key", ignoreDuplicates: true }
    )
    .select("*")
    .single();

  if (error || !data) {
    const { data: existing, error: selectError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month_key", monthKey)
      .single();

    if (selectError || !existing) {
      throw new ApiError(500, "INTERNAL_ERROR", "Unable to load usage.");
    }

    return existing as UserUsage;
  }

  return data as UserUsage;
}

export async function assertArticleLimit(userId: string) {
  const [profile, usage] = await Promise.all([
    getUserProfile(userId),
    getOrCreateUsage(userId),
  ]);
  const limit = PLAN_LIMITS[profile.plan].articlesPerMonth;

  if (usage.articles_generated >= limit) {
    throw new ApiError(
      403,
      "LIMIT_EXCEEDED",
      "Monthly article generation limit reached."
    );
  }
}

export async function assertImageLimit(userId: string) {
  const [profile, usage] = await Promise.all([
    getUserProfile(userId),
    getOrCreateUsage(userId),
  ]);
  const limit = PLAN_LIMITS[profile.plan].imagesPerMonth;

  if (usage.images_generated >= limit) {
    throw new ApiError(
      403,
      "LIMIT_EXCEEDED",
      "Monthly image generation limit reached."
    );
  }
}

export async function incrementArticleUsage(userId: string) {
  const supabase = await createServerSupabaseClient();
  const usage = await getOrCreateUsage(userId);

  const { error } = await supabase
    .from("user_usage")
    .update({
      articles_generated: usage.articles_generated + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usage.id)
    .eq("user_id", userId);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to update usage.");
  }
}

export async function incrementImageUsage(userId: string) {
  const supabase = await createServerSupabaseClient();
  const usage = await getOrCreateUsage(userId);

  const { error } = await supabase
    .from("user_usage")
    .update({
      images_generated: usage.images_generated + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usage.id)
    .eq("user_id", userId);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to update usage.");
  }
}

export async function getUsageSummary(user: User) {
  const supabase = await createServerSupabaseClient();
  const [profile, usage, sitesResult] = await Promise.all([
    getUserProfile(user.id, user),
    getOrCreateUsage(user.id),
    supabase
      .from("wordpress_sites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  const limits = PLAN_LIMITS[profile.plan];
  const wordpressSites = sitesResult.count ?? 0;

  return {
    plan: profile.plan,
    limits,
    usage: {
      monthKey: usage.month_key,
      articlesGenerated: usage.articles_generated,
      imagesGenerated: usage.images_generated,
      wordpressSites,
    },
    remaining: {
      articles: Math.max(limits.articlesPerMonth - usage.articles_generated, 0),
      images: Math.max(limits.imagesPerMonth - usage.images_generated, 0),
      wordpressSites: Math.max(limits.wordpressSites - wordpressSites, 0),
    },
  };
}
