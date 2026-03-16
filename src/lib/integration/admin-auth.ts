import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify that the requesting user is authenticated via gate_token cookie
 * and has admin role. Returns NextResponse error if not authorized.
 */
export async function requireIntegrationAdmin(
  request: NextRequest
): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
  const token = request.cookies.get("gate_token")?.value;

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Token expired" },
          { status: 401 }
        ),
      };
    }

    const userId = payload.sub || payload.id || "";

    // Gate JWT with admin role + apps
    if (payload.role === "admin" && payload.apps) {
      return { authorized: true };
    }

    // Supabase JWT — check profiles table for admin role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (profile?.role === "admin") {
      return { authorized: true };
    }

    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      ),
    };
  }
}
