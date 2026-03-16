import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { updateContractStatus } from "@/src/lib/contracts/contract-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const contract = await updateContractStatus(id, "approved", auth.userId, {
      approved_by: auth.userId,
      approved_at: new Date().toISOString(),
    });
    return NextResponse.json({ contract });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
