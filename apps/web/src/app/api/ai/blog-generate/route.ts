import { NextResponse } from "next/server";
import { getN8nConfig } from "@/config/n8n";
import { N8nRequestError, postToN8n } from "@/lib/n8nClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = getN8nConfig();

    const upstream = await postToN8n({
      webhookUrl: config.blogGenerateWebhookUrl,
      webhookSecret: config.webhookSecret,
      payload: body,
    });

    if (upstream.kind === "binary-image") {
      return NextResponse.json(
        { error: "Invalid blog workflow response." },
        { status: 502 }
      );
    }

    return NextResponse.json(upstream.data);
  } catch (error) {
    if (error instanceof N8nRequestError) {
      return NextResponse.json(
        { error: "Blog generation failed. Please try again." },
        { status: error.status }
      );
    }

    console.error("blog-generate route error", error);
    return NextResponse.json(
      { error: "Blog generation failed. Please try again." },
      { status: 500 }
    );
  }
}
