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

  // Get all deliverables for all milestones in this project
  const { data: milestones } = await admin
    .from("milestones")
    .select("id")
    .eq("project_id", id);

  if (!milestones || milestones.length === 0) {
    return NextResponse.json({ deliverables: [] });
  }

  const milestoneIds = milestones.map((m) => m.id);
  const { data, error } = await admin
    .from("deliverables")
    .select("*, milestone:milestones(id, title)")
    .in("milestone_id", milestoneIds)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverables: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { milestone_id, title, description, status, file_url } = body;

  if (!milestone_id || !title) {
    return NextResponse.json(
      { error: "milestone_id and title are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify milestone belongs to this project
  const { id } = await params;
  const { data: milestone } = await admin
    .from("milestones")
    .select("id")
    .eq("id", milestone_id)
    .eq("project_id", id)
    .single();

  if (!milestone) {
    return NextResponse.json(
      { error: "Milestone not found in this project" },
      { status: 404 }
    );
  }

  const { data: deliverable, error } = await admin
    .from("deliverables")
    .insert({
      milestone_id,
      title,
      description: description || null,
      status: status || "pending",
      file_url: file_url || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverable }, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { deliverable_id, ...updates } = body;

  if (!deliverable_id) {
    return NextResponse.json(
      { error: "deliverable_id required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: deliverable, error } = await admin
    .from("deliverables")
    .update(updates)
    .eq("id", deliverable_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deliverable });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const deliverableId = searchParams.get("deliverable_id");

  if (!deliverableId) {
    return NextResponse.json(
      { error: "deliverable_id query param required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("deliverables")
    .delete()
    .eq("id", deliverableId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
