import { cookies } from "next/headers";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
}

/**
 * Get current user from gate_token cookie.
 * - Gate JWT: has role/name/email directly in payload
 * - Supabase JWT: has role="authenticated", needs DB lookup
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gate_token")?.value;

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    const userId = payload.sub || payload.id || "";
    const email = payload.email || "";

    // Gate JWT has app-level role (admin/client)
    if (payload.role === "admin" && payload.apps) {
      return {
        id: userId,
        email,
        name: payload.name || "",
        role: "admin",
      };
    }

    // Supabase JWT has role="authenticated" — need DB lookup
    if (payload.role === "authenticated" || !payload.apps) {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (SUPABASE_URL && SUPABASE_SERVICE) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
            auth: { autoRefreshToken: false, persistSession: false },
          });

          const { data: profile } = await admin
            .from("profiles")
            .select("role, full_name")
            .eq("user_id", userId)
            .single();

          return {
            id: userId,
            email,
            name: profile?.full_name || email.split("@")[0],
            role: profile?.role === "admin" ? "admin" : "client",
          };
        } catch {
          // DB lookup failed — default to client
        }
      }
    }

    // Fallback
    return {
      id: userId,
      email,
      name: payload.name || email.split("@")[0],
      role: payload.role === "admin" ? "admin" : "client",
    };
  } catch {
    return null;
  }
}
