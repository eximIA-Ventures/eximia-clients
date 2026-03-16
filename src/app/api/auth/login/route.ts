import { NextRequest, NextResponse } from "next/server";
import type { GateUser, AuthResponse } from "@/src/lib/gate";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  const GATE_URL = process.env.GATE_URL || "";
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // 1. Try Gate SSO first (if configured)
  if (GATE_URL) {
    try {
      const gateRes = await fetch(`${GATE_URL}/api/v1/gate/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      });

      if (gateRes.ok) {
        return NextResponse.json(await gateRes.json());
      }
      // Gate returned error — fall through to Supabase
    } catch {
      // Gate unavailable — fall through to Supabase
    }
  }

  // 2. Supabase Auth
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return NextResponse.json({
      error: "Nenhum serviço de autenticação configurado",
      debug: { gate: !!GATE_URL, supabase: !!SUPABASE_URL, anon: !!SUPABASE_ANON },
    }, { status: 503 });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");

    // Sign in with anon key
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Get profile with service role key
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile } = await adminClient
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
  } catch (err) {
    return NextResponse.json({
      error: "Erro interno de autenticação",
      detail: err instanceof Error ? err.message : "unknown",
    }, { status: 500 });
  }
}
