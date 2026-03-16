// lib/gate.ts
// eximIA Gate integration — dual-mode (Gate SSO + standalone fallback)
// If GATE_URL is set → uses Gate for auth (SSO across ecosystem)
// If GATE_URL is not set → falls back to standalone auth functions below

const GATE_URL = process.env.GATE_URL || process.env.NEXT_PUBLIC_GATE_URL || "";
const APP_SLUG = "client-portal";

// ─── Mode Detection ───

export function isGateEnabled(): boolean {
  return GATE_URL.length > 0;
}

// ─── Types ───

export interface GateUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  apps: string[];
  created_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: GateUser;
}

export interface VerifyResponse {
  user: GateUser;
  scopes: string[];
  apps_allowed: string[];
}

// ─── Client-side: Auth actions ───

// Client-side: all auth calls go through our own /api/auth/* routes
// which proxy to Gate server-side (avoids CORS issues)

export async function gateLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  let data;
  try { data = await res.json(); } catch { throw new Error("Serviço indisponível"); }
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function gateRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  let data;
  try { data = await res.json(); } catch { throw new Error("Serviço indisponível"); }
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function gateRefresh(refresh_token: string): Promise<{ token: string; refresh_token: string }> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  let data;
  try { data = await res.json(); } catch { throw new Error("Serviço indisponível"); }
  if (!res.ok) throw new Error(data.error || "Refresh failed");
  return data;
}

// ─── Client-side: Token management (localStorage) ───

export function saveAuth(data: AuthResponse): void {
  localStorage.setItem("gate_token", data.token);
  localStorage.setItem("gate_refresh", data.refresh_token);
  localStorage.setItem("gate_user", JSON.stringify(data.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gate_token");
}

export function getUser(): GateUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("gate_user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem("gate_token");
  localStorage.removeItem("gate_refresh");
  localStorage.removeItem("gate_user");
}

// ─── Client-side: Auto-refresh on token expiry ───

export async function getValidToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresIn = payload.exp * 1000 - Date.now();

    if (expiresIn < 5 * 60 * 1000) {
      const refresh = localStorage.getItem("gate_refresh");
      if (!refresh) return null;
      try {
        const data = await gateRefresh(refresh);
        localStorage.setItem("gate_token", data.token);
        localStorage.setItem("gate_refresh", data.refresh_token);
        return data.token;
      } catch {
        logout();
        return null;
      }
    }
    return token;
  } catch {
    return token;
  }
}

// ─── Server-side: Protect API routes (DUAL-MODE) ───

export async function withGateAuth(req: Request): Promise<
  { user: GateUser; scopes: string[]; error?: never } |
  { user?: never; scopes?: never; error: Response }
> {
  if (!isGateEnabled()) {
    return standaloneVerify(req);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: Response.json(
        { error: "Missing authorization header", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7);

  try {
    const res = await fetch(`${GATE_URL}/api/v1/gate/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        error: Response.json(
          { error: "Invalid or expired token", code: "INVALID_TOKEN" },
          { status: 401 }
        ),
      };
    }

    const data: VerifyResponse = await res.json();

    // Admin users bypass app check; for clients, verify app access
    if (data.user.role !== "admin" && !data.apps_allowed.includes(APP_SLUG)) {
      return {
        error: Response.json(
          { error: "You do not have access to this app", code: "APP_ACCESS_DENIED" },
          { status: 403 }
        ),
      };
    }

    return { user: data.user, scopes: data.scopes };
  } catch {
    return {
      error: Response.json(
        { error: "Gate service unavailable", code: "GATE_UNAVAILABLE" },
        { status: 503 }
      ),
    };
  }
}

// ─── Server-side: Require admin role ───

export async function withGateAdmin(req: Request): Promise<
  { user: GateUser; error?: never } |
  { user?: never; error: Response }
> {
  const auth = await withGateAuth(req);
  if (auth.error) return auth;

  if (auth.user.role !== "admin") {
    return {
      error: Response.json(
        { error: "Admin access required", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { user: auth.user };
}

// =============================================================================
// STANDALONE FALLBACK FUNCTIONS (Supabase-backed)
// =============================================================================

async function standaloneLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Serviço de autenticação indisponível");
  }
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

async function standaloneRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

async function standaloneRefresh(refresh_token: string): Promise<{ token: string; refresh_token: string }> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Refresh failed");
  return data;
}

async function standaloneVerify(req: Request): Promise<
  { user: GateUser; scopes: string[]; error?: never } |
  { user?: never; scopes?: never; error: Response }
> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  try {
    const baseUrl = new URL(req.url).origin;
    const res = await fetch(`${baseUrl}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: authHeader.slice(7) }),
    });
    if (!res.ok) {
      return { error: Response.json({ error: "Invalid token", code: "INVALID_TOKEN" }, { status: 401 }) };
    }
    const data = await res.json();
    return { user: data.user, scopes: data.scopes || ["read", "write"] };
  } catch {
    return { error: Response.json({ error: "Auth error", code: "AUTH_ERROR" }, { status: 500 }) };
  }
}
