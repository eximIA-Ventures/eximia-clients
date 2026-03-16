import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  if (pathname === "/login") return NextResponse.next();
  if (pathname.startsWith("/_next/")) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/favicon")) return NextResponse.next();
  if (pathname.match(/\.(ico|svg|png|jpg|css|js|woff2?)$/)) return NextResponse.next();

  // Check for gate_token cookie
  const token = request.cookies.get("gate_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decode JWT to get role (no verification — that happens in server components/API)
  let role = "client";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired — clear and redirect
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("gate_token");
      res.cookies.delete("gate_user");
      return res;
    }
    role = payload.role || "client";
  } catch {
    // Invalid token
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("gate_token");
    res.cookies.delete("gate_user");
    return res;
  }

  // Route protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Root redirect
  if (pathname === "/") {
    const dest = role === "admin" ? "/admin" : "/portal";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
