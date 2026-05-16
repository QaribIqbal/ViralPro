import { NextResponse } from "next/server";

type GenerateImageRequest = {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  negativePrompt?: string;
};

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateImageRequest;
    if (!body.prompt || !body.prompt.trim()) {
      return errorResponse(400, "PROMPT_REQUIRED", "Prompt is required");
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      return errorResponse(
        500,
        "N8N_WEBHOOK_URL_MISSING",
        "Image automation is not configured."
      );
    }

    console.info(`image-generate webhook target=${webhookUrl}`);

    const upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: body.prompt,
        style: body.style ?? "product",
        aspectRatio: body.aspectRatio ?? "1:1",
        negativePrompt: body.negativePrompt ?? "",
      }),
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      const upstreamText = await upstreamResponse.text();
      console.error(
        `image-generate upstream error status=${upstreamResponse.status} body=${upstreamText}`
      );
      return errorResponse(
        502,
        "N8N_UPSTREAM_ERROR",
        "Image generation failed in automation workflow."
      );
    }

    const imageBuffer = await upstreamResponse.arrayBuffer();
    const contentType =
      upstreamResponse.headers.get("content-type") ?? "image/png";

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("image-generate route error", error);
    return errorResponse(
      502,
      "N8N_REQUEST_FAILED",
      "Automation request failed."
    );
  }
}
