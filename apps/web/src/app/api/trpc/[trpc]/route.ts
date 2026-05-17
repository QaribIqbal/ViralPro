import { NextRequest, NextResponse } from "next/server";

function unsupportedBody(path: string) {
  return {
    error: {
      code: "TRPC_NOT_CONFIGURED",
      message:
        "This application does not expose a tRPC API at /api/trpc. Use the REST routes under /api/* configured by ViralPro.",
      path,
    },
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ trpc: string }> }
) {
  const { trpc } = await context.params;
  return NextResponse.json(unsupportedBody(trpc), { status: 200 });
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ trpc: string }> }
) {
  const { trpc } = await context.params;
  return NextResponse.json(unsupportedBody(trpc), { status: 200 });
}
