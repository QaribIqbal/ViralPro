import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types/env";

function requireBinding(env: Env, key: keyof Env) {
  const value = env[key];
  if (!value || !value.trim()) {
    throw new Error(`${key} is not configured.`);
  }
  return value.trim();
}

export function createSupabaseAdmin(env: Env) {
  return createClient(
    requireBinding(env, "SUPABASE_URL"),
    requireBinding(env, "SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export function createSupabaseAuthClient(env: Env) {
  return createClient(
    requireBinding(env, "SUPABASE_URL"),
    requireBinding(env, "SUPABASE_ANON_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
