import { NextResponse } from "next/server";
import { getN8nConfig } from "@/config/n8n";
import { N8nRequestError, postToN8n } from "@/lib/n8nClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = getN8nConfig();

    const upstream = await postToN8n({
      webhookUrl: config.keywordResearchWebhookUrl,
      webhookSecret: config.webhookSecret,
      payload: body,
    });

    if (upstream.kind === "binary-image") {
      return NextResponse.json(
        { error: "Invalid keyword workflow response." },
        { status: 502 }
      );
    }

    return NextResponse.json(upstream.data);
  } catch (error) {
    if (error instanceof N8nRequestError) {
      return NextResponse.json(
        { error: "Keyword research failed. Please try again." },
        { status: error.status }
      );
    }

    console.error("keyword-research route error", error);
    return NextResponse.json(
      { error: "Keyword research failed. Please try again." },
      { status: 500 }
    );
  }
}
