// Acceso literal a NEXT_PUBLIC_* para que Next las inline en el navegador.
export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

export function getSupabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

export function getServiceRoleKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
}

/** Nombres (nunca valores) de las variables obligatorias que faltan. */
export function getMissingEnv(): string[] {
  const missing: string[] = [];
  if (!getSupabaseUrl()) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!getSupabaseAnonKey()) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}
