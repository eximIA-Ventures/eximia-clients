import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      GATE_URL: !!process.env.GATE_URL,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || "not set",
      API_KEY: !!process.env.API_SECRET_KEY,
    },
    timestamp: new Date().toISOString(),
  });
}
