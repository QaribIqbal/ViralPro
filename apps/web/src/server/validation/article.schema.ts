import { z } from "zod";

export const articleStatusSchema = z.enum([
  "queued",
  "generating",
  "completed",
  "failed",
  "draft",
  "published",
]);

export const generateArticleSchema = z.object({
  topic: z.string().trim().min(2).max(240),
  primaryKeyword: z.string().trim().max(160).optional(),
  articleType: z.string().trim().max(80).optional(),
  tone: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
  wordCount: z.number().int().min(300).max(5000).optional(),
  generateImage: z.boolean().optional(),
  aiSearchOptimized: z.boolean().optional(),
  templateId: z.string().uuid().optional(),
  extraInstructions: z.string().trim().max(4000).optional(),
});

export const articleListQuerySchema = z.object({
  status: articleStatusSchema.optional(),
  search: z.string().trim().max(200).optional(),
});

export type GenerateArticleInput = z.infer<typeof generateArticleSchema>;
