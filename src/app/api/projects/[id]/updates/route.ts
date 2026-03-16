import { createAdminClient } from "@/src/lib/supabase/admin";
import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("updates")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updates: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();

  if (!body.title || !body.content) {
    return NextResponse.json({ error: "title e content são obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: update, error } = await admin
    .from("updates")
    .insert({
      project_id: id,
      title: body.title,
      content: body.content,
      type: body.type || "info",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ update }, { status: 201 });
}
