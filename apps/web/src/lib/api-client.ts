import { createClient } from "@/lib/supabase/client";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    message: string;
    code: string;
  };
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

export function isUnauthorizedApiError(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.code === "UNAUTHORIZED" || error.status === 401;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { code?: unknown; status?: unknown };
    return candidate.code === "UNAUTHORIZED" || candidate.status === 401;
  }

  return false;
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:8787"
  );
}

async function getAccessToken() {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiClientError(
      "Authentication required. Please sign in.",
      "UNAUTHORIZED",
      401
    );
  }

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });
  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null;

  if (!response.ok || !json?.success) {
    throw new ApiClientError(
      json?.success === false
        ? json.error.message
        : "Backend request failed.",
      json?.success === false ? json.error.code : "REQUEST_FAILED",
      response.status
    );
  }

  return json.data;
}
