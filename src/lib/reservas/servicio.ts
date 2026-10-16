import { ApiError } from "@/lib/clientes/servicio";
import type {
  DatosReserva,
  DatosReservaPublica,
  EstadoReserva,
  Reserva,
} from "@/lib/reservas/validacion";

export { ApiError };

export type ReservaCreada = Pick<
  Reserva,
  "id" | "nombre" | "servicio" | "fecha" | "hora" | "estado"
>;

const BASE = "/api/reservas";

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit | undefined = init?.body
    ? { "Content-Type": "application/json" }
    : undefined;
  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  let json: { data?: T; error?: string; details?: string[] } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (res.ok && json) return json.data as T;
  throw new ApiError(
    res.status,
    json?.error ?? "Respuesta inválida del servidor",
    json?.details,
  );
}

export function crearReserva(
  datos: Omit<DatosReservaPublica, "notas"> & { notas?: string },
): Promise<ReservaCreada> {
  return pedir<ReservaCreada>(BASE, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function listarReservas(params?: {
  estado?: EstadoReserva;
  desde?: string;
  hasta?: string;
  limit?: number;
  offset?: number;
}): Promise<Reserva[]> {
  const search = new URLSearchParams();
  if (params?.estado) search.set("estado", params.estado);
  if (params?.desde) search.set("desde", params.desde);
  if (params?.hasta) search.set("hasta", params.hasta);
  if (params?.limit !== undefined) search.set("limit", String(params.limit));
  if (params?.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  return pedir<Reserva[]>(qs ? `${BASE}?${qs}` : BASE);
}

export function obtenerReserva(id: string): Promise<Reserva> {
  return pedir<Reserva>(`${BASE}/${encodeURIComponent(id)}`);
}

export function actualizarReserva(
  id: string,
  parcial: Partial<Omit<DatosReserva, "notas">> & { notas?: string | null },
): Promise<Reserva> {
  return pedir<Reserva>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(parcial),
  });
}

export function eliminarReserva(id: string): Promise<{ id: string }> {
  return pedir<{ id: string }>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
