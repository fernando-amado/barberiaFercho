import { createClient } from "@/lib/supabase/server";
import {
  COLUMNAS_CLIENTE,
  esUuid,
  parseActualizarCliente,
  type Cliente,
} from "@/lib/clientes/validacion";
import {
  errorDeBd,
  fallo,
  noAutenticado,
  noEncontrado,
  ok,
} from "@/lib/clientes/respuestas";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Contexto) {
  const { id } = await params;
  if (!esUuid(id)) return fallo(400, "id debe ser un UUID válido");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data, error } = await supabase
    .from("clientes")
    .select(COLUMNAS_CLIENTE)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Cliente, { merge: false }>();
  if (error) return errorDeBd(error);
  if (!data) return noEncontrado();

  return ok(data);
}

export async function PATCH(request: Request, { params }: Contexto) {
  const { id } = await params;
  if (!esUuid(id)) return fallo(400, "id debe ser un UUID válido");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fallo(400, "El cuerpo debe ser JSON válido");
  }
  const parsed = parseActualizarCliente(body);
  if (!parsed.ok) return fallo(400, "Datos inválidos", parsed.errors);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data, error } = await supabase
    .from("clientes")
    .update(parsed.data)
    .eq("id", id)
    .select(COLUMNAS_CLIENTE)
    .maybeSingle()
    .overrideTypes<Cliente, { merge: false }>();
  if (error) return errorDeBd(error);
  if (!data) return noEncontrado();

  return ok(data);
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { id } = await params;
  if (!esUuid(id)) return fallo(400, "id debe ser un UUID válido");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data, error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle()
    .overrideTypes<{ id: string }, { merge: false }>();
  if (error) return errorDeBd(error);
  if (!data) return noEncontrado();

  return ok({ id: data.id });
}
