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
  intendedAudience: z.string().trim().max(240).optional(),
  customOutline: z.string().trim().max(10000).optional(),
  wordCount: z.number().int().min(300).max(5000).optional(),
  generateImage: z.boolean().optional(),
  aiSearchOptimized: z.boolean().optional(),
  templateId: z.string().uuid().optional(),
  extraInstructions: z.string().trim().max(4000).optional(),
});

export const listArticlesQuerySchema = z.object({
  status: articleStatusSchema.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const updateArticleSchema = z
  .object({
    title: z.string().trim().max(240).nullable().optional(),
    contentHtml: z.string().max(500000).nullable().optional(),
    contentMarkdown: z.string().max(500000).nullable().optional(),
    excerpt: z.string().trim().max(2000).nullable().optional(),
    metaTitle: z.string().trim().max(240).nullable().optional(),
    metaDescription: z.string().trim().max(500).nullable().optional(),
    slug: z.string().trim().max(240).nullable().optional(),
    status: articleStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one article field is required.",
  });

export type GenerateArticleInput = z.infer<typeof generateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
