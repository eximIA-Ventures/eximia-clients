import { createAdminClient } from "@/src/lib/supabase/admin";
import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const admin = createAdminClient();
  const { data: projects, error } = await admin
    .from("projects")
    .select("*, client:clients(name, company)")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { client_id, title, description, start_date, end_date, milestones } = body;

  if (!client_id || !title) {
    return NextResponse.json(
      { error: "client_id e title são obrigatórios" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: project, error } = await admin
    .from("projects")
    .insert({
      client_id,
      title,
      description: description || "",
      status: "planning",
      start_date: start_date || null,
      end_date: end_date || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (milestones?.length > 0) {
    const toInsert = milestones.map(
      (m: { title: string; description?: string; due_date?: string }, i: number) => ({
        project_id: project.id,
        title: m.title,
        description: m.description || null,
        due_date: m.due_date || null,
        status: "pending",
        sort_order: i + 1,
      })
    );
    await admin.from("milestones").insert(toInsert);
  }

  return NextResponse.json({ project }, { status: 201 });
}
