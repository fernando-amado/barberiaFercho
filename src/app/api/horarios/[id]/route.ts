import { createClient } from "@/lib/supabase/server";
import {
  COLUMNAS_HORARIO,
  combinarHorario,
  esUuid,
  normalizarHorario,
  parseActualizarHorario,
  type Horario,
} from "@/lib/horarios/validacion";
import {
  errorDeBd,
  fallo,
  noAutenticado,
  noEncontrado,
  ok,
} from "@/lib/horarios/respuestas";

type Contexto = { params: Promise<{ id: string }> };

// Publico: el horario se muestra en la landing sin sesion.
export async function GET(_request: Request, { params }: Contexto) {
  const { id } = await params;
  if (!esUuid(id)) return fallo(400, "id debe ser un UUID válido");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horarios_atencion")
    .select(COLUMNAS_HORARIO)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Horario, { merge: false }>();
  if (error) return errorDeBd(error);
  if (!data) return noEncontrado();

  return ok(normalizarHorario(data));
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
  const parsed = parseActualizarHorario(body);
  if (!parsed.ok) return fallo(400, "Datos inválidos", parsed.errors);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data: actual, error: errorLectura } = await supabase
    .from("horarios_atencion")
    .select(COLUMNAS_HORARIO)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Horario, { merge: false }>();
  if (errorLectura) return errorDeBd(errorLectura);
  if (!actual) return noEncontrado();

  const combinado = combinarHorario(normalizarHorario(actual), parsed.data);
  if (!combinado.ok) return fallo(400, "Datos inválidos", combinado.errors);

  const { data, error } = await supabase
    .from("horarios_atencion")
    .update(combinado.data)
    .eq("id", id)
    .select(COLUMNAS_HORARIO)
    .maybeSingle()
    .overrideTypes<Horario, { merge: false }>();
  if (error) return errorDeBd(error);
  if (!data) return noEncontrado();

  return ok(normalizarHorario(data));
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { id } = await params;
  if (!esUuid(id)) return fallo(400, "id debe ser un UUID válido");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data, error } = await supabase
    .from("horarios_atencion")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle()
    .overrideTypes<{ id: string }, { merge: false }>();
  if (error) return errorDeBd(error);
  if (!data) return noEncontrado();

  return ok({ id: data.id });
}
