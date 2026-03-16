import { cookies } from "next/headers";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
}

/**
 * Get current user from gate_token cookie. Fast — just decodes JWT, no network.
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

    return {
      id: payload.sub || payload.id || "",
      email: payload.email || "",
      name: payload.name || "",
      role: payload.role === "admin" ? "admin" : "client",
    };
  } catch {
    return null;
  }
}
