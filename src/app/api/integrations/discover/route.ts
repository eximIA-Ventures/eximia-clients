import { NextRequest, NextResponse } from "next/server";
import { requireIntegrationAdmin } from "@/src/lib/integration/admin-auth";

// POST /api/integrations/discover — discover a remote app's catalog
export async function POST(request: NextRequest) {
  const auth = await requireIntegrationAdmin(request);
  if (!auth.authorized) return auth.response;

  let body: { url?: string; api_key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, api_key } = body;

  if (!url || !api_key) {
    return NextResponse.json(
      { error: "url and api_key are required" },
      { status: 400 }
    );
  }

  const catalogUrl = `${url.replace(/\/$/, "")}/api/v1/integration/catalog`;

  try {
    const res = await fetch(catalogUrl, {
      method: "GET",
      headers: {
        "x-eximia-api-key": api_key,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Remote returned HTTP ${res.status}`,
          details: await res.text().catch(() => "No details"),
        },
        { status: 502 }
      );
    }

    const catalog = await res.json();

    // Validate contract
    if (catalog.contract !== "eximia-integration/v1") {
      return NextResponse.json(
        {
          error: "Incompatible integration contract",
          expected: "eximia-integration/v1",
          received: catalog.contract || "none",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      catalog,
      compatible: true,
    });
  } catch (fetchError) {
    return NextResponse.json(
      {
        error:
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to connect to remote app",
      },
      { status: 502 }
    );
  }
}
