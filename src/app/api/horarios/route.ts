import { createClient } from "@/lib/supabase/server";
import {
  COLUMNAS_HORARIO,
  normalizarHorario,
  parseCrearHorario,
  type Horario,
} from "@/lib/horarios/validacion";
import {
  errorDeBd,
  fallo,
  noAutenticado,
  ok,
} from "@/lib/horarios/respuestas";

// Publico: el horario se muestra en la landing sin sesion.
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horarios_atencion")
    .select(COLUMNAS_HORARIO)
    .order("dia_semana", { ascending: true })
    .overrideTypes<Horario[], { merge: false }>();
  if (error) return errorDeBd(error);

  return ok(data.map(normalizarHorario));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fallo(400, "El cuerpo debe ser JSON válido");
  }
  const parsed = parseCrearHorario(body);
  if (!parsed.ok) return fallo(400, "Datos inválidos", parsed.errors);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  const { data, error } = await supabase
    .from("horarios_atencion")
    .insert(parsed.data)
    .select(COLUMNAS_HORARIO)
    .single()
    .overrideTypes<Horario, { merge: false }>();
  if (error) return errorDeBd(error);

  return ok(normalizarHorario(data), 201);
}
