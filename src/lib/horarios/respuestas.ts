import { fallo } from "@/lib/clientes/respuestas";

export { fallo, noAutenticado, ok } from "@/lib/clientes/respuestas";

export const noEncontrado = () => fallo(404, "Horario no encontrado");

type ErrorPg = { code?: string } | null;

// Mapea un error de Supabase a una respuesta generica (sin detalles internos).
export function errorDeBd(error: ErrorPg) {
  if (error?.code === "23505") {
    return fallo(409, "Ya existe un horario para ese día");
  }
  if (error?.code === "23514") {
    return fallo(400, "Los datos no cumplen las restricciones");
  }
  if (error?.code === "23503") {
    return fallo(400, "Referencia inválida");
  }
  return fallo(500, "Error interno del servidor");
}
