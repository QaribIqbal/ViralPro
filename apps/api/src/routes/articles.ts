import { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  deleteArticle,
  generateArticle,
  getArticleById,
  listArticles,
  updateArticle,
} from "../services/articles.service";
import {
  generateArticleSchema,
  listArticlesQuerySchema,
  updateArticleSchema,
} from "../validation/article.schema";
import { AppError } from "../utils/errors";
import { successResponse } from "../utils/response";

export const articleRoutes = new Hono<AppBindings>();

articleRoutes.use("*", authMiddleware);

articleRoutes.post("/generate", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  });
  const input = generateArticleSchema.parse(body);
  const article = await generateArticle(c.env, c.get("user").id, input);

  return successResponse(c, article);
});

articleRoutes.get("/", async (c) => {
  listArticlesQuerySchema.parse(c.req.query());
  const articles = await listArticles(c.env, c.get("user").id, c.req.url);

  return successResponse(c, articles);
});

articleRoutes.get("/:id", async (c) => {
  const article = await getArticleById(
    c.env,
    c.get("user").id,
    c.req.param("id")
  );

  return successResponse(c, article);
});

articleRoutes.patch("/:id", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  });
  const input = updateArticleSchema.parse(body);
  const article = await updateArticle(
    c.env,
    c.get("user").id,
    c.req.param("id"),
    input
  );

  return successResponse(c, article);
});

articleRoutes.delete("/:id", async (c) => {
  const result = await deleteArticle(c.env, c.get("user").id, c.req.param("id"));

  return successResponse(c, result);
});
