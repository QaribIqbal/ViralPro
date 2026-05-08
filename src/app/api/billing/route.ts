import { NextResponse } from "next/server";
import { appService } from "@/server/services/app-service";

export async function GET() {
  return NextResponse.json(appService.getBilling());
}
