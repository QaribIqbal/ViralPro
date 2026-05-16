import { NextResponse } from "next/server";
import { appService } from "@/server/services/app-service";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };
  const result = appService.generateArticle(body.prompt ?? "");
  return NextResponse.json(result);
}
