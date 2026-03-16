import { createAdminClient } from "@/src/lib/supabase/admin";
import { authorize } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { CLAUSES_SEED, TEMPLATE_SEEDS } from "@/src/lib/contracts/clauses-seed";

export async function POST(request: NextRequest) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const admin = createAdminClient();

  // Check if already seeded
  const { count } = await admin
    .from("contract_clauses")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Clause library already seeded", count },
      { status: 409 }
    );
  }

  // Insert clauses
  const { data: clauses, error: clauseError } = await admin
    .from("contract_clauses")
    .insert(CLAUSES_SEED)
    .select();

  if (clauseError) {
    return NextResponse.json({ error: clauseError.message }, { status: 500 });
  }

  // Insert templates
  const { data: templates, error: templateError } = await admin
    .from("contract_templates")
    .insert(
      TEMPLATE_SEEDS.map((t) => ({
        name: t.name,
        slug: t.slug,
        description: t.description,
        type: t.type,
        variables: t.variables,
        clauses: t.clauses,
        status: "active",
      }))
    )
    .select();

  if (templateError) {
    return NextResponse.json({ error: templateError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      message: "Seed completed successfully",
      clauses: clauses?.length || 0,
      templates: templates?.length || 0,
    },
    { status: 201 }
  );
}
