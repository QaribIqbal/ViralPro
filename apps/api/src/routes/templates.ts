import { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
} from "../services/templates.service";
import { createTemplateSchema } from "../validation/template.schema";
import { AppError } from "../utils/errors";
import { successResponse } from "../utils/response";

export const templateRoutes = new Hono<AppBindings>();

templateRoutes.use("*", authMiddleware);

templateRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  });
  const input = createTemplateSchema.parse(body);
  const template = await createTemplate(c.env, c.get("user").id, input);

  return successResponse(c, template, 201);
});

templateRoutes.get("/", async (c) => {
  const templates = await listTemplates(c.env, c.get("user").id);

  return successResponse(c, templates);
});

templateRoutes.delete("/:id", async (c) => {
  const result = await deleteTemplate(
    c.env,
    c.get("user").id,
    c.req.param("id")
  );

  return successResponse(c, result);
});
