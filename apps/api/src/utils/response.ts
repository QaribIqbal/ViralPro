import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import type { AppBindings } from "../types/env";
import { AppError, toAppError } from "./errors";

export function successResponse<T>(
  c: Context<AppBindings>,
  data: T,
  status: ContentfulStatusCode = 200
) {
  return c.json({ success: true, data }, status);
}

export function errorResponse(c: Context<AppBindings>, error: unknown) {
  if (error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          message: error.issues[0]?.message ?? "Invalid request payload.",
          code: "VALIDATION_ERROR",
        },
      },
      400
    );
  }

  const appError = error instanceof AppError ? error : toAppError(error);

  return c.json(
    {
      success: false,
      error: {
        message: appError.publicMessage,
        code: appError.code,
      },
    },
    appError.statusCode as ContentfulStatusCode
  );
}
