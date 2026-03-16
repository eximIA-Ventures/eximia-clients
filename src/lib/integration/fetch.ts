import { createClient } from "@supabase/supabase-js";

export async function integrationFetch(
  connectionId: string,
  method: string,
  path: string,
  body?: unknown
): Promise<Response> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Look up the outbound connection
  const { data: connection, error } = await supabase
    .from("integration_outbound")
    .select("*")
    .eq("id", connectionId)
    .single();

  if (error || !connection) {
    throw new Error(`Connection not found: ${connectionId}`);
  }

  if (connection.status !== "active") {
    throw new Error(`Connection is not active: ${connection.status}`);
  }

  const url = `${connection.remote_url.replace(/\/$/, "")}${path}`;
  const startTime = Date.now();

  let response: Response;
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-eximia-api-key": connection.api_key_encrypted,
      },
      signal: AbortSignal.timeout(30000),
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(body);
    }

    response = await fetch(url, fetchOptions);
  } catch (fetchError) {
    const duration = Date.now() - startTime;

    // Log the failed call
    await supabase.from("integration_logs").insert({
      direction: "outbound",
      method,
      endpoint: path,
      status_code: 0,
      duration_ms: duration,
      remote_app: connection.remote_app,
    });

    // Update connection status to error
    await supabase
      .from("integration_outbound")
      .update({
        status: "error",
        last_error:
          fetchError instanceof Error ? fetchError.message : "Unknown error",
      })
      .eq("id", connectionId);

    throw fetchError;
  }

  const duration = Date.now() - startTime;

  // Extract entity from path if possible (e.g. /api/v1/integration/clients -> clients)
  const pathParts = path.split("/").filter(Boolean);
  const entityIndex = pathParts.indexOf("integration");
  const entity =
    entityIndex >= 0 && entityIndex + 1 < pathParts.length
      ? pathParts[entityIndex + 1]
      : undefined;

  // Log the call
  await supabase.from("integration_logs").insert({
    direction: "outbound",
    method,
    endpoint: path,
    entity: entity || null,
    status_code: response.status,
    duration_ms: duration,
    remote_app: connection.remote_app,
  });

  // Update last_sync on success
  if (response.ok) {
    await supabase
      .from("integration_outbound")
      .update({ last_sync: new Date().toISOString(), status: "active" })
      .eq("id", connectionId);
  }

  return response;
}
