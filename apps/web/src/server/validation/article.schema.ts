import { z } from "zod";

export const articleStatusSchema = z.enum([
  "queued",
  "generating",
  "completed",
  "failed",
  "draft",
  "published",
]);

const articleContentBriefSchema = z.object({
  topic: z.string().trim().min(2).max(240),
  liveWebResearch: z.boolean().optional(),
  targetKeyword: z.string().trim().max(160).optional(),
  customOutline: z.string().trim().max(10000).optional(),
});

const articleConfigurationSchema = z.object({
  aiModel: z.string().trim().max(80).optional(),
  articleType: z.string().trim().max(80).optional(),
  tone: z.string().trim().max(80).optional(),
  language: z.string().trim().max(80).optional(),
  intendedAudience: z.string().trim().max(240).optional(),
  additionalContext: z.string().trim().max(4000).optional(),
  wordCount: z.number().int().min(300).max(5000).optional(),
  brandVoiceKnowledge: z.boolean().optional(),
  competitorAnalysis: z.boolean().optional(),
  geoOptimization: z.boolean().optional(),
  firstPerson: z.boolean().optional(),
  hook: z.boolean().optional(),
  htmlElement: z.boolean().optional(),
  readabilityLevel: z.string().trim().max(80).optional(),
  internalLinks: z.boolean().optional(),
  generateContentImages: z.boolean().optional(),
  generateCoverImage: z.boolean().optional(),
  contentImageCount: z.number().int().min(0).max(20).optional(),
  includeTextInImages: z.boolean().optional(),
  imageStyle: z.string().trim().max(80).optional(),
  imageAspectRatio: z.string().trim().max(20).optional(),
});

export const generateArticleSchema = z.object({
  contentBrief: articleContentBriefSchema,
  configuration: articleConfigurationSchema,
  templateId: z.string().uuid().optional(),
});

export const articleListQuerySchema = z.object({
  status: articleStatusSchema.optional(),
  search: z.string().trim().max(200).optional(),
});

export type GenerateArticleInput = z.infer<typeof generateArticleSchema>;
