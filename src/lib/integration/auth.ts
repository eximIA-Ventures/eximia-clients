import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashKey } from "./helpers";

interface AuthSuccess {
  valid: true;
  app_name: string;
  scopes: string[];
}

interface AuthFailure {
  valid: false;
  error: string;
  status_code: number;
}

export type IntegrationAuthResult = AuthSuccess | AuthFailure;

export async function validateIntegrationKey(
  request: NextRequest
): Promise<IntegrationAuthResult> {
  const startTime = Date.now();
  const apiKey = request.headers.get("x-eximia-api-key");

  if (!apiKey) {
    return {
      valid: false,
      error: "Missing x-eximia-api-key header",
      status_code: 401,
    };
  }

  const keyHash = hashKey(apiKey);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: keyRecord, error } = await supabase
    .from("integration_keys")
    .select("id, app_name, scopes, status, expires_at")
    .eq("key_hash", keyHash)
    .eq("status", "active")
    .single();

  if (error || !keyRecord) {
    const duration = Date.now() - startTime;
    await supabase.from("integration_logs").insert({
      direction: "inbound",
      method: request.method,
      endpoint: new URL(request.url).pathname,
      status_code: 401,
      duration_ms: duration,
      remote_app: null,
    });

    return {
      valid: false,
      error: "Invalid or revoked API key",
      status_code: 401,
    };
  }

  // Check expiry
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    const duration = Date.now() - startTime;
    await supabase.from("integration_logs").insert({
      direction: "inbound",
      method: request.method,
      endpoint: new URL(request.url).pathname,
      status_code: 401,
      duration_ms: duration,
      remote_app: keyRecord.app_name,
    });

    return {
      valid: false,
      error: "API key has expired",
      status_code: 401,
    };
  }

  // Update last_used
  await supabase
    .from("integration_keys")
    .update({ last_used: new Date().toISOString() })
    .eq("id", keyRecord.id);

  return {
    valid: true,
    app_name: keyRecord.app_name,
    scopes: keyRecord.scopes,
  };
}

/**
 * Log an inbound integration call after it has been processed.
 */
export async function logInboundCall(params: {
  method: string;
  endpoint: string;
  entity?: string;
  status_code: number;
  duration_ms: number;
  remote_app?: string;
}): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  await supabase.from("integration_logs").insert({
    direction: "inbound",
    method: params.method,
    endpoint: params.endpoint,
    entity: params.entity || null,
    status_code: params.status_code,
    duration_ms: params.duration_ms,
    remote_app: params.remote_app || null,
  });
}
