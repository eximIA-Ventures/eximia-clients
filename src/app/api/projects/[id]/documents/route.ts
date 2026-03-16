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
    .from("documents")
    .select("*")
    .eq("project_id", id)
    .order("uploaded_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();

  if (!body.title || !body.file_url) {
    return NextResponse.json({ error: "title e file_url são obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: document, error } = await admin
    .from("documents")
    .insert({
      project_id: id,
      title: body.title,
      file_url: body.file_url,
      file_type: body.file_type || null,
      file_size: body.file_size || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("document_id");

  if (!documentId) {
    return NextResponse.json({ error: "document_id query param required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
