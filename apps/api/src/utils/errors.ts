export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "LIMIT_EXCEEDED"
  | "UPSTREAM_ERROR"
  | "CONFIGURATION_ERROR"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  statusCode: number;
  code: AppErrorCode;
  publicMessage: string;

  constructor(statusCode: number, code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = message;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  console.error("Unhandled API error", {
    message: error instanceof Error ? error.message : "unknown",
    name: error instanceof Error ? error.name : "unknown",
  });

  return new AppError(
    500,
    "INTERNAL_ERROR",
    "Something went wrong. Please try again."
  );
}
