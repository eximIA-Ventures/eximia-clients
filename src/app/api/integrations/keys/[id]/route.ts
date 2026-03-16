import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireIntegrationAdmin } from "@/src/lib/integration/admin-auth";

// DELETE /api/integrations/keys/:id — soft delete (revoke)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from("integration_keys")
    .update({ status: "revoked" })
    .eq("id", id)
    .select("id, app_name, status")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Key not found or already revoked" },
      { status: 404 }
    );
  }

  return NextResponse.json({ key: data, message: "Key revoked successfully" });
}
