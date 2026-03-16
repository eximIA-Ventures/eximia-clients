import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { withGateAuth, type GateUser } from "@/src/lib/gate";
import { NextRequest, NextResponse } from "next/server";

interface AuthResult {
  authorized: true;
  role: "admin" | "client";
  userId: string;
  method: "api-key" | "gate" | "supabase";
}

interface AuthError {
  authorized: false;
  response: NextResponse;
}

/**
 * Unified auth for API routes. Tries in order:
 * 1. x-api-key header (J.A.R.V.I.S. / programmatic)
 * 2. Bearer token (Gate SSO or standalone JWT)
 * 3. Supabase session cookie (browser)
 */
export async function authorize(
  request: NextRequest,
  requireAdmin = false
): Promise<AuthResult | AuthError> {
  // 1. API Key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    if (apiKey === process.env.API_SECRET_KEY) {
      return { authorized: true, role: "admin", userId: "api", method: "api-key" };
    }
    return {
      authorized: false,
      response: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  // 2. Gate Bearer token
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const gateAuth = await withGateAuth(request as unknown as Request);
    if (gateAuth.error) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        ),
      };
    }

    const role = gateAuth.user.role === "admin" ? "admin" as const : "client" as const;
    if (requireAdmin && role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Admin required" }, { status: 403 }),
      };
    }

    return {
      authorized: true,
      role,
      userId: gateAuth.user.id,
      method: "gate",
    };
  }

  // 3. Supabase session
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = (profile?.role === "admin" ? "admin" : "client") as "admin" | "client";

    if (requireAdmin && role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return { authorized: true, role, userId: user.id, method: "supabase" };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Auth failed" }, { status: 401 }),
    };
  }
}
