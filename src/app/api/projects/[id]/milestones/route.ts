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
    .from("milestones")
    .select("*, deliverables:deliverables(*)")
    .eq("project_id", id)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ milestones: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  let order = body.sort_order;
  if (!order) {
    const { data: existing } = await admin
      .from("milestones")
      .select("sort_order")
      .eq("project_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);
    order = (existing?.[0]?.sort_order || 0) + 1;
  }

  const { data: milestone, error } = await admin
    .from("milestones")
    .insert({
      project_id: id,
      title: body.title,
      description: body.description || null,
      due_date: body.due_date || null,
      status: "pending",
      sort_order: order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ milestone }, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { milestone_id, ...updates } = body;

  if (!milestone_id) {
    return NextResponse.json({ error: "milestone_id required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: milestone, error } = await admin
    .from("milestones")
    .update(updates)
    .eq("id", milestone_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ milestone });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const milestoneId = searchParams.get("milestone_id");

  if (!milestoneId) {
    return NextResponse.json({ error: "milestone_id query param required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
