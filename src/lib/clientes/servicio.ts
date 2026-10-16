import type { Cliente } from "@/lib/clientes/validacion";

export type DatosEntrada = {
  nombre: string;
  correo?: string;
  telefono?: string;
  detalle?: string;
};

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const BASE = "/api/clientes";

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

export function listarClientes(params?: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<Cliente[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.limit !== undefined) search.set("limit", String(params.limit));
  if (params?.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  return pedir<Cliente[]>(qs ? `${BASE}?${qs}` : BASE);
}

export function obtenerCliente(id: string): Promise<Cliente> {
  return pedir<Cliente>(`${BASE}/${encodeURIComponent(id)}`);
}

export function crearCliente(datos: DatosEntrada): Promise<Cliente> {
  return pedir<Cliente>(BASE, { method: "POST", body: JSON.stringify(datos) });
}

export function actualizarCliente(
  id: string,
  parcial: Partial<DatosEntrada>,
): Promise<Cliente> {
  return pedir<Cliente>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(parcial),
  });
}

export function eliminarCliente(id: string): Promise<{ id: string }> {
  return pedir<{ id: string }>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
