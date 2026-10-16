import { createClient } from "@/lib/supabase/server";
import {
  COLUMNAS_CLIENTE,
  parseCrearCliente,
  parseListado,
  type Cliente,
} from "@/lib/clientes/validacion";
import { errorDeBd, fallo, noAutenticado, ok } from "@/lib/clientes/respuestas";

export async function GET(request: Request) {
  const parsed = parseListado(new URL(request.url).searchParams);
  if (!parsed.ok) return fallo(400, "Parámetros inválidos", parsed.errors);
  const { q, limit, offset } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  let consulta = supabase.from("clientes").select(COLUMNAS_CLIENTE);
  if (q) {
    consulta = consulta.or(
      `nombre.ilike.%${q}%,correo.ilike.%${q}%,telefono.ilike.%${q}%`,
    );
  }
  const { data, error } = await consulta
    .order("nombre", { ascending: true })
    .range(offset, offset + limit - 1)
    .overrideTypes<Cliente[], { merge: false }>();
  if (error) return errorDeBd(error);

  return ok(data);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fallo(400, "El cuerpo debe ser JSON válido");
  }
  const parsed = parseCrearCliente(body);
  if (!parsed.ok) return fallo(400, "Datos inválidos", parsed.errors);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data, error } = await supabase
    .from("clientes")
    .insert(parsed.data)
    .select(COLUMNAS_CLIENTE)
    .single()
    .overrideTypes<Cliente, { merge: false }>();
  if (error) return errorDeBd(error);

  return ok(data, 201);
}
