import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import type { GateUser, AuthResponse } from "@/src/lib/gate";

const GATE_URL = process.env.GATE_URL || "";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  // 1. Try Gate SSO first
  if (GATE_URL) {
    try {
      const gateRes = await fetch(`${GATE_URL}/api/v1/gate/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      });

      if (gateRes.ok) {
        const data = await gateRes.json();
        return NextResponse.json(data);
      }
      // Gate returned error — fall through to Supabase
    } catch {
      // Gate unavailable — fall through to Supabase
    }
  }

  // 2. Fallback to Supabase Auth
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Use admin client to verify password via signInWithPassword workaround
    // Create a temporary client to sign in
    const { createClient } = await import("@supabase/supabase-js");
    const tempClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await tempClient.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await admin
      .from("profiles")
      .select("role, full_name, client_id, avatar_url")
      .eq("user_id", data.user.id)
      .single();

    const gateUser: GateUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: profile?.full_name || "",
      role: (profile?.role as "user" | "admin") || "user",
      avatar_url: profile?.avatar_url || null,
      apps: ["client-portal"],
      created_at: data.user.created_at,
    };

    const response: AuthResponse = {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: gateUser,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }
}
