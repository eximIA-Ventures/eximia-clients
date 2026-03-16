import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
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

  // Check expiry only (role routing happens in server components via getServerUser)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("gate_token");
      res.cookies.delete("gate_user");
      return res;
    }
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("gate_token");
    res.cookies.delete("gate_user");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
