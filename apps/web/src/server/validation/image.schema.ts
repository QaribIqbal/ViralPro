import { z } from "zod";

export const imageStatusSchema = z.enum([
  "queued",
  "generating",
  "completed",
  "failed",
]);

export const generateImageSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  articleId: z.string().uuid().optional(),
  aspectRatio: z.enum(["16:9", "4:3", "1:1"]).optional(),
  style: z.string().trim().max(200).optional(),
  altText: z.string().trim().max(240).optional(),
});

export const imageListQuerySchema = z.object({
  articleId: z.string().uuid().optional(),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;
