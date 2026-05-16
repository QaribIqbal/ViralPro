export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "LIMIT_EXCEEDED"
  | "UPSTREAM_ERROR"
  | "CONFIGURATION_ERROR"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  publicMessage: string;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.publicMessage = message;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Error) {
    console.error("Unhandled API error", {
      name: error.name,
      message: error.message,
    });
  } else {
    console.error("Unhandled API error", { error });
  }

  return new ApiError(
    500,
    "INTERNAL_ERROR",
    "Something went wrong. Please try again."
  );
}
