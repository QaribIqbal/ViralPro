import type { Hono } from "hono";
import type { AppBindings } from "../types/env";
import { errorResponse } from "../utils/response";

export function registerErrorHandler(app: Hono<AppBindings>) {
  app.onError((error, c) => errorResponse(c, error));
}
