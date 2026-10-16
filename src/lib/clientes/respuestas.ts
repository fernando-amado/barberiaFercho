import { NextResponse } from "next/server";

const headers = { "Cache-Control": "no-store" };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status, headers });
}

export function fallo(status: number, error: string, details?: string[]) {
  return NextResponse.json(details ? { error, details } : { error }, {
    status,
    headers,
  });
}

export const noAutenticado = () => fallo(401, "No autenticado");
export const noEncontrado = () => fallo(404, "Cliente no encontrado");

type ErrorPg = { code?: string } | null;

// Mapea un error de Supabase a una respuesta generica (sin detalles internos).
export function errorDeBd(error: ErrorPg) {
  if (error?.code === "23505") {
    return fallo(409, "Ya existe un cliente con ese correo");
  }
  if (error?.code === "23514") {
    return fallo(400, "Los datos no cumplen las restricciones");
  }
  return fallo(500, "Error interno del servidor");
}
