import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getContracts, createContract } from "@/src/lib/contracts/contract-service";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const contracts = await getContracts({
      client_id: searchParams.get("client_id") || undefined,
      project_id: searchParams.get("project_id") || undefined,
      status: searchParams.get("status") || undefined,
    });
    return NextResponse.json({ contracts });
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
    const { client_id, project_id, template_id, title, variables, included_clauses, notes } = body;

    if (!client_id || !title) {
      return NextResponse.json(
        { error: "client_id and title are required" },
        { status: 400 }
      );
    }

    const contract = await createContract({
      client_id,
      project_id,
      template_id,
      title,
      variables,
      included_clauses,
      notes,
      created_by: auth.userId,
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
