import { createClient } from "@/lib/supabase/server";
import {
  COLUMNAS_RESERVA,
  parseCrearReserva,
  parseListado,
  type Reserva,
} from "@/lib/reservas/validacion";
import {
  errorDeBd,
  fallo,
  noAutenticado,
  ok,
} from "@/lib/reservas/respuestas";

export async function GET(request: Request) {
  const parsed = parseListado(new URL(request.url).searchParams);
  if (!parsed.ok) return fallo(400, "Parámetros inválidos", parsed.errors);
  const { estado, desde, hasta, limit, offset } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutenticado();

  let consulta = supabase.from("reservas").select(COLUMNAS_RESERVA);
  if (estado) consulta = consulta.eq("estado", estado);
  if (desde) consulta = consulta.gte("fecha", desde);
  if (hasta) consulta = consulta.lte("fecha", hasta);
  const { data, error } = await consulta
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })
    .range(offset, offset + limit - 1)
    .overrideTypes<Reserva[], { merge: false }>();
  if (error) return errorDeBd(error);

  return ok(data);
}

// Publico: el visitante anonimo no tiene permiso de select, asi que el id se
// genera aqui y se inserta sin pedir la fila de vuelta.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fallo(400, "El cuerpo debe ser JSON válido");
  }
  const parsed = parseCrearReserva(body);
  if (!parsed.ok) return fallo(400, "Datos inválidos", parsed.errors);

  const id = crypto.randomUUID();
  const estado = "pendiente" as const;

  const supabase = await createClient();
  const { error } = await supabase
    .from("reservas")
    .insert({ id, ...parsed.data, estado });
  if (error) return errorDeBd(error);

  const { nombre, servicio, fecha, hora } = parsed.data;
  return ok({ id, nombre, servicio, fecha, hora, estado }, 201);
}
