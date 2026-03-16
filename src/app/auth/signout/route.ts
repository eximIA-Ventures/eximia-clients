import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3020")
  );

  response.cookies.delete("gate_token");
  response.cookies.delete("gate_user");

  return response;
}
