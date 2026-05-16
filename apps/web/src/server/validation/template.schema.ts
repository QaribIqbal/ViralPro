import { z } from "zod";

export const templateTypeSchema = z.enum(["article", "image"]);

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: templateTypeSchema,
  settings: z.record(z.string(), z.unknown()).default({}),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
