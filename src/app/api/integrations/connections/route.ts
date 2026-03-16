import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireIntegrationAdmin } from "@/src/lib/integration/admin-auth";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/integrations/connections — list all outbound connections
export async function GET(request: NextRequest) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabase();

  const { data: connections, error } = await supabase
    .from("integration_outbound")
    .select(
      "id, remote_app, remote_url, status, entities, catalog_cache, last_sync, last_error, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections });
}

// POST /api/integrations/connections — create outbound connection
export async function POST(request: NextRequest) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  let body: {
    remote_app?: string;
    remote_url?: string;
    api_key?: string;
    entities?: string[];
    catalog_cache?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { remote_app, remote_url, api_key, entities, catalog_cache } = body;

  if (!remote_app || !remote_url || !api_key) {
    return NextResponse.json(
      { error: "remote_app, remote_url, and api_key are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { data: connection, error } = await supabase
    .from("integration_outbound")
    .insert({
      remote_app,
      remote_url: remote_url.replace(/\/$/, ""),
      api_key_encrypted: api_key,
      entities: entities || [],
      catalog_cache: catalog_cache || null,
      status: "active",
    })
    .select(
      "id, remote_app, remote_url, status, entities, catalog_cache, created_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connection }, { status: 201 });
}
