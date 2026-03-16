import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * J.A.R.V.I.S. Onboarding Endpoint
 *
 * Single API call to create: client + auth user + project + milestones + welcome doc
 * Usage: "Jarvis, onboarda o cliente X"
 *
 * POST /api/onboard
 * Headers: x-api-key: {API_SECRET_KEY}
 * Body: {
 *   client: { name, company, email, phone?, brand_color?, logo_url? },
 *   password: string,
 *   project: { title, description?, start_date?, end_date? },
 *   milestones?: [{ title, description?, due_date? }],
 *   welcome_doc?: {
 *     hero_title?, hero_subtitle?, overview?,
 *     what_happens_next?: [{ title, description }],
 *     communication?: [{ type, value, label }],
 *     team_members?: [{ name, role }]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const { client: clientData, password, project: projectData, milestones, welcome_doc } = body;

  if (!clientData?.name || !clientData?.company || !clientData?.email || !password || !projectData?.title) {
    return NextResponse.json(
      {
        error: "Required: client.name, client.company, client.email, password, project.title",
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const results: Record<string, unknown> = {};

  try {
    // 1. Create auth user
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: clientData.email,
        password,
        email_confirm: true,
      });

    if (authError) throw new Error(`Auth: ${authError.message}`);
    results.user_id = authData.user.id;

    // 2. Create client
    const { data: client, error: clientError } = await admin
      .from("clients")
      .insert({
        name: clientData.name,
        company: clientData.company,
        email: clientData.email,
        phone: clientData.phone || null,
        logo_url: clientData.logo_url || null,
        brand_color: clientData.brand_color || "#C4A882",
      })
      .select()
      .single();

    if (clientError) throw new Error(`Client: ${clientError.message}`);
    results.client = client;

    // 3. Create profile
    const { error: profileError } = await admin.from("profiles").insert({
      user_id: authData.user.id,
      role: "client",
      client_id: client.id,
      full_name: clientData.name,
    });

    if (profileError) throw new Error(`Profile: ${profileError.message}`);

    // 4. Create project
    const { data: project, error: projectError } = await admin
      .from("projects")
      .insert({
        client_id: client.id,
        title: projectData.title,
        description: projectData.description || "",
        status: "planning",
        start_date: projectData.start_date || null,
        end_date: projectData.end_date || null,
      })
      .select()
      .single();

    if (projectError) throw new Error(`Project: ${projectError.message}`);
    results.project = project;

    // 5. Create milestones
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
      const { data: ms, error: msError } = await admin
        .from("milestones")
        .insert(toInsert)
        .select();
      if (msError) throw new Error(`Milestones: ${msError.message}`);
      results.milestones = ms;
    }

    // 6. Create welcome doc
    if (welcome_doc) {
      const { data: wd, error: wdError } = await admin
        .from("welcome_docs")
        .insert({
          project_id: project.id,
          hero_title: welcome_doc.hero_title || `Bem-vindo, ${clientData.company}`,
          hero_subtitle: welcome_doc.hero_subtitle || "Estamos prontos para transformar sua visão em realidade.",
          overview: welcome_doc.overview || "",
          what_happens_next: welcome_doc.what_happens_next || [],
          communication: welcome_doc.communication || [],
          team_members: welcome_doc.team_members || [{ name: "Hugo Capitelli", role: "Project Lead" }],
          custom_sections: welcome_doc.custom_sections || [],
          portal_access: {
            url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3020",
            email: clientData.email,
            password,
          },
        })
        .select()
        .single();
      if (wdError) throw new Error(`Welcome Doc: ${wdError.message}`);
      results.welcome_doc = wd;
    }

    // 7. Create initial update
    await admin.from("updates").insert({
      project_id: project.id,
      title: "Projeto criado",
      content: `O projeto "${projectData.title}" foi criado para ${clientData.company}. Bem-vindos ao portal!`,
      type: "info",
    });

    return NextResponse.json(
      {
        success: true,
        message: `Cliente ${clientData.company} onboardado com sucesso`,
        ...results,
        portal_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3020"}/portal`,
        credentials: { email: clientData.email, password },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    // Attempt cleanup on failure
    if (results.user_id) {
      await admin.auth.admin.deleteUser(results.user_id as string).catch(() => {});
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding failed" },
      { status: 500 }
    );
  }
}
