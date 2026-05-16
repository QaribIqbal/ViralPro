import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError, toApiError } from "@/server/utils/errors";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.issues[0]?.message ?? "Invalid request payload.",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 }
    );
  }

  const apiError =
    error instanceof ApiError ? error : toApiError(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: apiError.publicMessage,
        code: apiError.code,
      },
    },
    { status: apiError.status }
  );
}
