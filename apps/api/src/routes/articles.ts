import { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  deleteArticle,
  generateArticle,
  getArticleById,
  listArticles,
  saveGeneratedArticleCallback,
  updateArticle,
} from "../services/articles.service";
import { callBulkGenerationWorkflow } from "../services/n8n.service";
import {
  generateArticleSchema,
  listArticlesQuerySchema,
  updateArticleSchema,
} from "../validation/article.schema";
import { bulkGenerateSchema } from "../validation/bulk.schema";
import { AppError } from "../utils/errors";
import { successResponse } from "../utils/response";
import { z } from "zod";

export const articleRoutes = new Hono<AppBindings>();

const saveGeneratedSchema = z.object({
  requestId: z.string().optional(),
  userId: z.string().min(1),
  topic: z.string().min(1),
  targetKeyword: z.string().optional(),
  contentHtml: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
  wordCount: z.coerce.number().int().positive().optional(),
  model: z.string().optional(),
  batchId: z.string().optional(),
  batchName: z.string().optional(),
  articleIndex: z.coerce.number().int().positive().optional(),
  status: z.enum(["completed", "failed"]).optional(),
});

articleRoutes.post("/save-generated", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch (err) {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  }
  const input = saveGeneratedSchema.parse(body);
  const article = await saveGeneratedArticleCallback(c.env, input);

  return successResponse(c, { saved: true, articleId: article.id });
});

articleRoutes.use("*", authMiddleware);

articleRoutes.post("/generate", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  });
  const input = generateArticleSchema.parse(body);
  const article = await generateArticle(c.env, c.get("user").id, input);

  return successResponse(c, article);
});

articleRoutes.post("/bulk-generate", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  });
  const input = bulkGenerateSchema.parse(body);

  const result = await callBulkGenerationWorkflow(c.env, {
    userId: c.get("user").id,
    batchName: input.batchName,
    source: input.source,
    globalSettings: input.globalSettings,
    topics: input.topics,
    meta: input.meta,
  });

  return successResponse(c, {
    accepted: true,
    upstream: result,
    topicCount: input.topics.length,
  });
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
