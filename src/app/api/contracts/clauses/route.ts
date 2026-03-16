import { authorize } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { getClauses } from "@/src/lib/contracts/contract-service";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const clauses = await getClauses({
      category: searchParams.get("category") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
    });
    return NextResponse.json({ clauses });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { clause_id, title, category, body: clauseBody, risk_level, applicable_to, is_required } = body;

    if (!clause_id || !title || !category || !clauseBody) {
      return NextResponse.json(
        { error: "clause_id, title, category, and body are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: clause, error } = await admin
      .from("contract_clauses")
      .insert({
        clause_id,
        title,
        category,
        body: clauseBody,
        risk_level: risk_level || "medium",
        applicable_to: applicable_to || [],
        is_required: is_required || false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ clause }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
