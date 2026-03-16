import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import type { GateUser } from "@/src/lib/gate";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role, full_name, client_id, avatar_url")
    .eq("user_id", data.user.id)
    .single();

  const gateUser: GateUser = {
    id: data.user.id,
    email: data.user.email || "",
    name: profile?.full_name || "",
    role: (profile?.role as "user" | "admin") || "user",
    avatar_url: profile?.avatar_url || null,
    apps: ["client-portal"],
    created_at: data.user.created_at,
  };

  return NextResponse.json({
    user: gateUser,
    scopes: ["read", "write"],
    apps_allowed: ["client-portal"],
  });
}
