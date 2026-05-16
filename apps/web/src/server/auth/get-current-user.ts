import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/server/db/supabase-server";
import { ApiError } from "@/server/utils/errors";

export async function getCurrentUser(): Promise<User> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
  }

  return user;
}
