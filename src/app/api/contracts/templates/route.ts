import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getTemplates } from "@/src/lib/contracts/contract-service";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const templates = await getTemplates();
    return NextResponse.json({ templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
