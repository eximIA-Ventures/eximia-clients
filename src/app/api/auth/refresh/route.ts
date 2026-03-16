import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const GATE_URL = process.env.GATE_URL || "";

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json({ error: "refresh_token is required" }, { status: 400 });
  }

  // Gate SSO mode: proxy
  if (GATE_URL) {
    try {
      const gateRes = await fetch(`${GATE_URL}/api/v1/gate/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await gateRes.json();
      if (!gateRes.ok) return NextResponse.json(data, { status: gateRes.status });
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Gate indisponível" }, { status: 503 });
    }
  }

  // Standalone: Supabase
  const admin = createAdminClient();
  const { data, error } = await admin.auth.refreshSession({ refresh_token });

  if (error || !data.session) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  return NextResponse.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
