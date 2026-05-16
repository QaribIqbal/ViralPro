import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ authenticated: false, user: null, error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: Boolean(user),
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown session error";
    return NextResponse.json({ authenticated: false, user: null, error: message }, { status: 500 });
  }
}
