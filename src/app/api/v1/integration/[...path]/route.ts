import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  validateIntegrationKey,
  logInboundCall,
} from "@/src/lib/integration/auth";
import { getCatalog } from "@/src/lib/integration/catalog";

// Entity name → Supabase table name mapping
const ENTITY_TABLE_MAP: Record<string, string> = {
  clients: "clients",
  projects: "projects",
  milestones: "milestones",
  updates: "updates",
  documents: "documents",
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function jsonError(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

// ─── GET handler ───

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  const { path } = await params;

  // GET /api/v1/integration/catalog — public (still requires key)
  if (path.length === 1 && path[0] === "catalog") {
    const auth = await validateIntegrationKey(request);
    if (!auth.valid) {
      return jsonError("UNAUTHORIZED", auth.error, auth.status_code);
    }

    const duration = Date.now() - startTime;
    await logInboundCall({
      method: "GET",
      endpoint: "/api/v1/integration/catalog",
      status_code: 200,
      duration_ms: duration,
      remote_app: auth.app_name,
    });

    return NextResponse.json(getCatalog());
  }

  // Validate key for all other endpoints
  const auth = await validateIntegrationKey(request);
  if (!auth.valid) {
    return jsonError("UNAUTHORIZED", auth.error, auth.status_code);
  }

  // Check read scope
  if (!auth.scopes.includes("read")) {
    return jsonError("FORBIDDEN", "Key does not have read scope", 403);
  }

  const entity = path[0];
  const recordId = path[1];
  const table = ENTITY_TABLE_MAP[entity];

  if (!table) {
    return jsonError(
      "ENTITY_NOT_FOUND",
      `Entity '${entity}' is not exposed by this integration`,
      404
    );
  }

  const catalog = getCatalog();
  const entityDef = catalog.entities[entity];

  const supabase = getSupabase();

  // GET /api/v1/integration/:entity/:id — get single record
  if (recordId) {
    if (!entityDef.operations.includes("get")) {
      return jsonError(
        "OPERATION_NOT_ALLOWED",
        `Operation 'get' is not allowed on entity '${entity}'`,
        405
      );
    }

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", recordId)
      .single();

    const duration = Date.now() - startTime;

    if (error) {
      await logInboundCall({
        method: "GET",
        endpoint: `/api/v1/integration/${entity}/${recordId}`,
        entity,
        status_code: 404,
        duration_ms: duration,
        remote_app: auth.app_name,
      });
      return jsonError(
        "RECORD_NOT_FOUND",
        `Record '${recordId}' not found in '${entity}'`,
        404
      );
    }

    await logInboundCall({
      method: "GET",
      endpoint: `/api/v1/integration/${entity}/${recordId}`,
      entity,
      status_code: 200,
      duration_ms: duration,
      remote_app: auth.app_name,
    });

    return NextResponse.json({ data });
  }

  // GET /api/v1/integration/:entity — list with pagination
  if (!entityDef.operations.includes("list")) {
    return jsonError(
      "OPERATION_NOT_ALLOWED",
      `Operation 'list' is not allowed on entity '${entity}'`,
      405
    );
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10))
  );
  const offset = (page - 1) * limit;

  // Get total count
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const duration = Date.now() - startTime;

  if (error) {
    await logInboundCall({
      method: "GET",
      endpoint: `/api/v1/integration/${entity}`,
      entity,
      status_code: 500,
      duration_ms: duration,
      remote_app: auth.app_name,
    });
    return jsonError("QUERY_ERROR", error.message, 500);
  }

  await logInboundCall({
    method: "GET",
    endpoint: `/api/v1/integration/${entity}`,
    entity,
    status_code: 200,
    duration_ms: duration,
    remote_app: auth.app_name,
  });

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  });
}

// ─── POST handler ───

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  const { path } = await params;
  const entity = path[0];

  const auth = await validateIntegrationKey(request);
  if (!auth.valid) {
    return jsonError("UNAUTHORIZED", auth.error, auth.status_code);
  }

  if (!auth.scopes.includes("write")) {
    return jsonError("FORBIDDEN", "Key does not have write scope", 403);
  }

  const table = ENTITY_TABLE_MAP[entity];
  if (!table) {
    return jsonError(
      "ENTITY_NOT_FOUND",
      `Entity '${entity}' is not exposed by this integration`,
      404
    );
  }

  const catalog = getCatalog();
  const entityDef = catalog.entities[entity];

  if (!entityDef.operations.includes("create")) {
    return jsonError(
      "OPERATION_NOT_ALLOWED",
      `Operation 'create' is not allowed on entity '${entity}'`,
      405
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  // Strip id and timestamps — let DB handle those
  const { id: _id, created_at: _ca, updated_at: _ua, uploaded_at: _up, ...insertData } = body;

  if (Object.keys(insertData).length === 0) {
    return jsonError("VALIDATION_ERROR", "Request body is empty", 400);
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(table)
    .insert(insertData)
    .select()
    .single();

  const duration = Date.now() - startTime;

  if (error) {
    await logInboundCall({
      method: "POST",
      endpoint: `/api/v1/integration/${entity}`,
      entity,
      status_code: 400,
      duration_ms: duration,
      remote_app: auth.app_name,
    });
    return jsonError("VALIDATION_ERROR", error.message, 400);
  }

  await logInboundCall({
    method: "POST",
    endpoint: `/api/v1/integration/${entity}`,
    entity,
    status_code: 201,
    duration_ms: duration,
    remote_app: auth.app_name,
  });

  return NextResponse.json({ data }, { status: 201 });
}

// ─── PUT handler ───

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  const { path } = await params;

  if (path.length < 2) {
    return jsonError(
      "VALIDATION_ERROR",
      "Record ID is required for update: /api/v1/integration/:entity/:id",
      400
    );
  }

  const entity = path[0];
  const recordId = path[1];

  const auth = await validateIntegrationKey(request);
  if (!auth.valid) {
    return jsonError("UNAUTHORIZED", auth.error, auth.status_code);
  }

  if (!auth.scopes.includes("write")) {
    return jsonError("FORBIDDEN", "Key does not have write scope", 403);
  }

  const table = ENTITY_TABLE_MAP[entity];
  if (!table) {
    return jsonError(
      "ENTITY_NOT_FOUND",
      `Entity '${entity}' is not exposed by this integration`,
      404
    );
  }

  const catalog = getCatalog();
  const entityDef = catalog.entities[entity];

  if (!entityDef.operations.includes("update")) {
    return jsonError(
      "OPERATION_NOT_ALLOWED",
      `Operation 'update' is not allowed on entity '${entity}'`,
      405
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  // Strip id and timestamps
  const { id: _id, created_at: _ca, updated_at: _ua, uploaded_at: _up, ...updateData } = body;

  if (Object.keys(updateData).length === 0) {
    return jsonError("VALIDATION_ERROR", "Request body is empty", 400);
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq("id", recordId)
    .select()
    .single();

  const duration = Date.now() - startTime;

  if (error) {
    await logInboundCall({
      method: "PUT",
      endpoint: `/api/v1/integration/${entity}/${recordId}`,
      entity,
      status_code: error.code === "PGRST116" ? 404 : 400,
      duration_ms: duration,
      remote_app: auth.app_name,
    });

    if (error.code === "PGRST116") {
      return jsonError(
        "RECORD_NOT_FOUND",
        `Record '${recordId}' not found in '${entity}'`,
        404
      );
    }
    return jsonError("VALIDATION_ERROR", error.message, 400);
  }

  await logInboundCall({
    method: "PUT",
    endpoint: `/api/v1/integration/${entity}/${recordId}`,
    entity,
    status_code: 200,
    duration_ms: duration,
    remote_app: auth.app_name,
  });

  return NextResponse.json({ data });
}
