import { NextResponse } from "next/server";
import {
  getMissingEnv,
  getServiceRoleKey,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  const missing = getMissingEnv();
  if (missing.length > 0) {
    return NextResponse.json(
      { status: "misconfigured", missing },
      { status: 503, headers },
    );
  }

  try {
    const res = await fetch(`${getSupabaseUrl()}/auth/v1/health`, {
      headers: { apikey: getSupabaseAnonKey() },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("unreachable");

    return NextResponse.json(
      {
        status: "ok",
        supabase: {
          url_configured: true,
          anon_key_configured: true,
          service_role_configured: getServiceRoleKey() !== "",
          reachable: true,
        },
        timestamp: new Date().toISOString(),
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        supabase: { reachable: false },
        message: "No se pudo conectar con Supabase.",
      },
      { status: 503, headers },
    );
  }
}
