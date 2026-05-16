import { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { authMiddleware } from "../middleware/auth.middleware";
import { getUsage } from "../services/usage.service";
import { successResponse } from "../utils/response";

export const usageRoutes = new Hono<AppBindings>();

usageRoutes.use("*", authMiddleware);

usageRoutes.get("/", async (c) => {
  const usage = await getUsage(c.env, c.get("user"));

  return successResponse(c, usage);
});
