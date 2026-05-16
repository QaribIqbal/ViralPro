import { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { successResponse } from "../utils/response";

export const healthRoutes = new Hono<AppBindings>();

healthRoutes.get("/", (c) =>
  successResponse(c, {
    status: "ok",
    service: "viralpro-api",
    environment: c.env.APP_ENV ?? "development",
  })
);
