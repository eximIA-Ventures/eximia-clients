import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireIntegrationAdmin } from "@/src/lib/integration/admin-auth";

// GET /api/integrations/logs — return last 100 logs, filterable by direction
export async function GET(request: NextRequest) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  const url = new URL(request.url);
  const direction = url.searchParams.get("direction"); // "inbound" or "outbound"

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let query = supabase
    .from("integration_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (direction === "inbound" || direction === "outbound") {
    query = query.eq("direction", direction);
  }

  const { data: logs, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs });
}
