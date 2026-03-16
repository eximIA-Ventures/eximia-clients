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

// POST /api/integrations/connections/:id — test connection by calling remote /catalog
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: connection, error } = await supabase
    .from("integration_outbound")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !connection) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  const catalogUrl = `${connection.remote_url.replace(/\/$/, "")}/api/v1/integration/catalog`;

  try {
    const res = await fetch(catalogUrl, {
      method: "GET",
      headers: {
        "x-eximia-api-key": connection.api_key_encrypted,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");

      await supabase
        .from("integration_outbound")
        .update({
          status: "error",
          last_error: `HTTP ${res.status}: ${errorText.slice(0, 500)}`,
        })
        .eq("id", id);

      return NextResponse.json(
        {
          success: false,
          status: res.status,
          error: `Remote returned HTTP ${res.status}`,
        },
        { status: 502 }
      );
    }

    const catalog = await res.json();

    // Update connection with successful test
    await supabase
      .from("integration_outbound")
      .update({
        status: "active",
        catalog_cache: catalog,
        last_sync: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      catalog,
    });
  } catch (fetchError) {
    const errorMessage =
      fetchError instanceof Error ? fetchError.message : "Connection failed";

    await supabase
      .from("integration_outbound")
      .update({
        status: "error",
        last_error: errorMessage,
      })
      .eq("id", id);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 502 }
    );
  }
}

// DELETE /api/integrations/connections/:id — remove connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from("integration_outbound")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Connection removed successfully" });
}
