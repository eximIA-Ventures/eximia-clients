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
  const { data: welcome_doc, error } = await admin
    .from("welcome_docs")
    .select("*")
    .eq("project_id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ welcome_doc });
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

  const { data: welcome_doc, error } = await admin
    .from("welcome_docs")
    .insert({
      project_id: id,
      hero_title: body.hero_title || "Bem-vindo ao seu projeto",
      hero_subtitle: body.hero_subtitle || "",
      overview: body.overview || "",
      what_happens_next: body.what_happens_next || [],
      communication: body.communication || [],
      team_members: body.team_members || [],
      custom_sections: body.custom_sections || [],
      portal_access: body.portal_access || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ welcome_doc }, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const { data: welcome_doc, error } = await admin
    .from("welcome_docs")
    .update({
      hero_title: body.hero_title,
      hero_subtitle: body.hero_subtitle,
      overview: body.overview,
      what_happens_next: body.what_happens_next,
      communication: body.communication,
      team_members: body.team_members,
      custom_sections: body.custom_sections,
      portal_access: body.portal_access !== undefined ? body.portal_access : undefined,
    })
    .eq("project_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ welcome_doc });
}
