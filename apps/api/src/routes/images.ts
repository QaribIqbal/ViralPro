import { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  deleteImage,
  generateImage,
  listImages,
} from "../services/images.service";
import {
  generateImageSchema,
  listImagesQuerySchema,
} from "../validation/image.schema";
import { AppError } from "../utils/errors";
import { successResponse } from "../utils/response";

export const imageRoutes = new Hono<AppBindings>();

imageRoutes.use("*", authMiddleware);

imageRoutes.post("/generate", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new AppError(400, "BAD_REQUEST", "Invalid JSON request body.");
  });
  const input = generateImageSchema.parse(body);
  const image = await generateImage(c.env, c.get("user").id, input);

  return successResponse(c, image);
});

imageRoutes.get("/", async (c) => {
  listImagesQuerySchema.parse(c.req.query());
  const images = await listImages(c.env, c.get("user").id, c.req.url);

  return successResponse(c, images);
});

imageRoutes.delete("/:id", async (c) => {
  const result = await deleteImage(c.env, c.get("user").id, c.req.param("id"));

  return successResponse(c, result);
});
