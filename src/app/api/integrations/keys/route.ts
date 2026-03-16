import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireIntegrationAdmin } from "@/src/lib/integration/admin-auth";
import { generateKey } from "@/src/lib/integration/helpers";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/integrations/keys — list all keys (prefix only, never hash)
export async function GET(request: NextRequest) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabase();

  const { data: keys, error } = await supabase
    .from("integration_keys")
    .select("id, app_name, key_prefix, scopes, status, last_used, expires_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keys });
}

// POST /api/integrations/keys — create a new key, return full key ONCE
export async function POST(request: NextRequest) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  let body: { app_name?: string; scopes?: string[]; expires_at?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { app_name, scopes, expires_at } = body;

  if (!app_name) {
    return NextResponse.json(
      { error: "app_name is required" },
      { status: 400 }
    );
  }

  // Generate slug from app_name
  const appSlug = app_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { full, prefix, hash } = generateKey(appSlug);

  const supabase = getSupabase();

  const { data: keyRecord, error } = await supabase
    .from("integration_keys")
    .insert({
      app_name,
      key_prefix: prefix,
      key_hash: hash,
      scopes: scopes || ["read"],
      expires_at: expires_at || null,
    })
    .select("id, app_name, key_prefix, scopes, status, expires_at, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the full key ONCE — it cannot be retrieved again
  return NextResponse.json(
    {
      key: keyRecord,
      api_key: full,
      warning: "Store this API key securely. It cannot be retrieved again.",
    },
    { status: 201 }
  );
}
