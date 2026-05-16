export class N8nRequestError extends Error {
  status: number;
  code: string;
  upstreamStatus?: number;

  constructor(params: {
    message: string;
    status?: number;
    code?: string;
    upstreamStatus?: number;
  }) {
    super(params.message);
    this.name = "N8nRequestError";
    this.status = params.status ?? 500;
    this.code = params.code ?? "N8N_REQUEST_ERROR";
    this.upstreamStatus = params.upstreamStatus;
  }
}

export async function postToN8n<TPayload extends object>(params: {
  webhookUrl: string;
  payload: TPayload;
  webhookSecret: string;
  timeoutMs?: number;
}) {
  const { payload, webhookSecret, timeoutMs = 45000 } = params;
  const webhookUrl = params.webhookUrl.trim();
  const maxAttempts = 3;

  try {
    const parsedUrl = new URL(webhookUrl);
    console.info(
      `n8n request start host=${parsedUrl.host} path=${parsedUrl.pathname}`
    );
    let response: Response | null = null;
    let lastNetworkError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-viralpro-webhook-secret": webhookSecret,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        break;
      } catch (error) {
        clearTimeout(timer);
        lastNetworkError = error;
        const err = error as
          | (Error & { cause?: { code?: string; errno?: number; syscall?: string } })
          | undefined;
        const code = err?.cause?.code ?? err?.name ?? "UNKNOWN";
        const retryable = code === "EHOSTUNREACH" || code === "ECONNRESET" || code === "ETIMEDOUT" || code === "AbortError";

        if (!retryable || attempt === maxAttempts) {
          throw error;
        }

        console.warn(`n8n request retry attempt=${attempt + 1} reason=${code}`);
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }

    if (!response) {
      throw lastNetworkError ?? new Error("No response from n8n");
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `n8n request failed host=${parsedUrl.host} path=${parsedUrl.pathname} status=${response.status} body=${text}`
      );

      if (response.status === 400) {
        throw new N8nRequestError({
          message: "Invalid request payload for workflow.",
          status: 400,
          code: "N8N_BAD_REQUEST",
          upstreamStatus: response.status,
        });
      }

      if (response.status === 401 || response.status === 403) {
        throw new N8nRequestError({
          message: "Webhook authentication failed.",
          status: 401,
          code: "N8N_UNAUTHORIZED",
          upstreamStatus: response.status,
        });
      }

      if (response.status === 404) {
        throw new N8nRequestError({
          message: "Workflow webhook not found or not active.",
          status: 404,
          code: "N8N_WEBHOOK_NOT_REGISTERED",
          upstreamStatus: response.status,
        });
      }

      if (response.status === 408) {
        throw new N8nRequestError({
          message: "Workflow request timed out upstream.",
          status: 504,
          code: "N8N_UPSTREAM_TIMEOUT",
          upstreamStatus: response.status,
        });
      }

      if (response.status === 429) {
        throw new N8nRequestError({
          message: "Workflow rate-limited by upstream provider.",
          status: 429,
          code: "N8N_RATE_LIMITED",
          upstreamStatus: response.status,
        });
      }

      throw new N8nRequestError({
        message: "Upstream automation failed.",
        status: 502,
        code: "N8N_UPSTREAM_ERROR",
        upstreamStatus: response.status,
      });
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.startsWith("image/")) {
      const imageBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(imageBuffer);
      let imageBase64 = "";

      if (typeof Buffer !== "undefined") {
        imageBase64 = Buffer.from(imageBuffer).toString("base64");
      } else {
        // Edge-safe fallback if Buffer is unavailable.
        let binary = "";
        for (let index = 0; index < bytes.length; index += 1) {
          binary += String.fromCharCode(bytes[index]);
        }
        imageBase64 = btoa(binary);
      }

      return {
        kind: "binary-image" as const,
        mimeType: contentType,
        imageBase64,
      };
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return {
        kind: "json" as const,
        data: {},
      };
    }

    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      const parseMessage =
        error instanceof Error ? error.message : "unknown parse error";
      console.error(
        `n8n non-json response parseError=${parseMessage} body=${responseText.slice(
          0,
          500
        )}`
      );
      throw new N8nRequestError({
        message: "Invalid automation response format.",
        status: 502,
        code: "N8N_INVALID_RESPONSE_FORMAT",
      });
    }

    return {
      kind: "json" as const,
      data,
    };
  } catch (error) {
    if (error instanceof N8nRequestError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      console.error("n8n request timeout");
      throw new N8nRequestError({
        message: "Automation timed out.",
        status: 504,
        code: "N8N_TIMEOUT",
      });
    }

    const err = error as
      | (Error & { cause?: { code?: string; errno?: number; syscall?: string } })
      | undefined;
    console.error(
      `n8n request exception message=${err?.message ?? "unknown"} name=${err?.name ?? "unknown"} causeCode=${err?.cause?.code ?? "none"} causeErrno=${err?.cause?.errno ?? "none"} causeSyscall=${err?.cause?.syscall ?? "none"} webhookUrl=${webhookUrl}`
    );
    throw new N8nRequestError({
      message: "Automation request failed.",
      status: 502,
      code: "N8N_REQUEST_FAILED",
    });
  }
}
