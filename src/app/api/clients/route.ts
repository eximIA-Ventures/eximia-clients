import { createAdminClient } from "@/src/lib/supabase/admin";
import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const admin = createAdminClient();
  const { data: clients, error } = await admin
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients });
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { name, company, email, phone, password, brand_color, logo_url } = body;

  if (!name || !company || !email || !password) {
    return NextResponse.json(
      { error: "name, company, email e password são obrigatórios" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({ email, password, email_confirm: true });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const { data: client, error: clientError } = await admin
    .from("clients")
    .insert({ name, company, email, phone, logo_url, brand_color })
    .select()
    .single();

  if (clientError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: authData.user.id,
    role: "client",
    client_id: client.id,
    full_name: name,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("clients").delete().eq("id", client.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ client, user_id: authData.user.id }, { status: 201 });
}
