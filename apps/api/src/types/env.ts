import type { User } from "@supabase/supabase-js";

export type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  N8N_ARTICLE_GENERATION_WEBHOOK_URL: string;
  N8N_IMAGE_GENERATION_WEBHOOK_URL: string;
  N8N_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  ALLOWED_ORIGIN?: string;
  ALLOWED_ORIGINS?: string;
  APP_ENV: string;
};

export type AppVariables = {
  user: User;
};

export type AppBindings = {
  Bindings: Env;
  Variables: AppVariables;
};
