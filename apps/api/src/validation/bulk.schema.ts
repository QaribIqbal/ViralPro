import { z } from "zod";

const globalSettingsSchema = z.object({
  batchName: z.string().trim().min(2).max(180),
  wordCount: z.number().int().min(300).max(5000),
  tone: z.string().trim().max(80),
  articleType: z.string().trim().max(80),
  language: z.string().trim().max(80),
  aiModel: z.string().trim().max(80),
  liveWebResearch: z.boolean(),
  intendedAudience: z.string().trim().max(240),
  additionalContext: z.string().trim().max(4000),
  geoOptimization: z.boolean(),
  firstPerson: z.boolean(),
  hook: z.boolean(),
  readabilityLevel: z.string().trim().max(80),
  brandVoiceKnowledge: z.boolean(),
  competitorAnalysis: z.boolean(),
  internalLinks: z.boolean(),
  generateContentImages: z.boolean(),
  includeTextInImages: z.boolean(),
  contentImageCount: z.number().int().min(0).max(20),
});

const topicItemSchema = z.object({
  id: z.string().trim().min(1).max(120),
  topic: z.string().trim().min(2).max(240),
  customSettings: globalSettingsSchema.partial().optional(),
});

export const bulkGenerateSchema = z.object({
  batchName: z.string().trim().min(2).max(180),
  source: z.string().trim().max(80).optional(),
  globalSettings: globalSettingsSchema,
  topics: z.array(topicItemSchema).min(1).max(50),
  meta: z
    .object({
      topicCount: z.number().int().positive().max(50).optional(),
      createdAt: z.string().datetime().optional(),
    })
    .optional(),
});

export type BulkGenerateInput = z.infer<typeof bulkGenerateSchema>;
