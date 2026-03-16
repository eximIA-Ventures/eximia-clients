import { authorize } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.body !== undefined) updateData.body = body.body;
    if (body.risk_level !== undefined) updateData.risk_level = body.risk_level;
    if (body.applicable_to !== undefined) updateData.applicable_to = body.applicable_to;
    if (body.is_required !== undefined) updateData.is_required = body.is_required;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: clause, error } = await admin
      .from("contract_clauses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ clause });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Archive instead of hard delete
    const { data: clause, error } = await admin
      .from("contract_clauses")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ clause, message: "Clause archived" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Archive failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
