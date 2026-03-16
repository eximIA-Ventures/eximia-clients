import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getContract, deleteContract, updateContractStatus } from "@/src/lib/contracts/contract-service";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const result = await getContract(id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

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
    if (body.variables !== undefined) updateData.variables = body.variables;
    if (body.included_clauses !== undefined) updateData.included_clauses = body.included_clauses;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.generated_pdf_url !== undefined) updateData.generated_pdf_url = body.generated_pdf_url;
    if (body.status !== undefined) {
      return NextResponse.json(
        await updateContractStatus(id, body.status, auth.userId)
      );
    }

    const { data: contract, error } = await admin
      .from("contracts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Audit
    await admin.from("contract_audit").insert({
      contract_id: id,
      action: "updated",
      actor: auth.userId,
      details: { fields_updated: Object.keys(updateData).filter((k) => k !== "updated_at") },
    });

    return NextResponse.json({ contract });
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
    await deleteContract(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
