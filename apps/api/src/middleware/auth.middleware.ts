import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../types/env";
import { createSupabaseAuthClient } from "../db/supabase";
import { AppError } from "../utils/errors";

function getBearerToken(header: string | undefined) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const token = getBearerToken(c.req.header("Authorization"));

  if (!token) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const supabase = createSupabaseAuthClient(c.env);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token.");
  }

  c.set("user", user);
  await next();
});
