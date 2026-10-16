import { ApiError } from "@/lib/clientes/servicio";
import type {
  DatosHorario,
  Horario,
  ParcialHorario,
} from "@/lib/horarios/validacion";

export { ApiError };

const BASE = "/api/horarios";

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

export function listarHorarios(): Promise<Horario[]> {
  return pedir<Horario[]>(BASE);
}

export function obtenerHorario(id: string): Promise<Horario> {
  return pedir<Horario>(`${BASE}/${encodeURIComponent(id)}`);
}

export function crearHorario(
  datos: Pick<DatosHorario, "dia_semana"> & Partial<DatosHorario>,
): Promise<Horario> {
  return pedir<Horario>(BASE, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarHorario(
  id: string,
  parcial: ParcialHorario,
): Promise<Horario> {
  return pedir<Horario>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(parcial),
  });
}

export function eliminarHorario(id: string): Promise<{ id: string }> {
  return pedir<{ id: string }>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
