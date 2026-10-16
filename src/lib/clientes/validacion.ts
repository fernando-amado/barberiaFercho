export type Cliente = {
  id: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  detalle: string | null;
  created_at: string;
  updated_at: string;
};

export type DatosCliente = {
  nombre: string;
  correo: string | null;
  telefono: string | null;
  detalle: string | null;
};

export type ResultadoParse<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

export type ParametrosListado = {
  q: string | null;
  limit: number;
  offset: number;
};

export const COLUMNAS_CLIENTE =
  "id, nombre, correo, telefono, detalle, created_at, updated_at";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CORREO_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TELEFONO_REGEX = /^[0-9\s+\-()]+$/;
const CAMPOS = ["nombre", "correo", "telefono", "detalle"] as const;
type Campo = (typeof CAMPOS)[number];

export function esUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

function esObjeto(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

function clavesDesconocidas(body: Record<string, unknown>): string[] {
  return Object.keys(body)
    .filter((k) => !(CAMPOS as readonly string[]).includes(k))
    .map((k) => `Campo no permitido: ${k}`);
}

// Devuelve el valor normalizado (null si queda vacio) o undefined si es invalido
// (en cuyo caso agrega el error a la lista).
function validarCampo(
  campo: Campo,
  valor: unknown,
  errors: string[],
): string | null | undefined {
  if (valor === null || valor === undefined) {
    if (campo === "nombre") {
      errors.push("nombre es obligatorio");
      return undefined;
    }
    return null;
  }
  if (typeof valor !== "string") {
    errors.push(`${campo} debe ser texto`);
    return undefined;
  }
  const texto = valor.trim();
  if (campo === "nombre") {
    if (texto.length < 1 || texto.length > 120) {
      errors.push("nombre debe tener entre 1 y 120 caracteres");
      return undefined;
    }
    return texto;
  }
  if (texto === "") return null;
  if (campo === "correo") {
    const correo = texto.toLowerCase();
    if (correo.length > 254 || !CORREO_REGEX.test(correo)) {
      errors.push("correo no tiene un formato válido");
      return undefined;
    }
    return correo;
  }
  if (campo === "telefono") {
    if (texto.length < 7 || texto.length > 20 || !TELEFONO_REGEX.test(texto)) {
      errors.push(
        "telefono debe tener 7-20 caracteres (dígitos, espacios, +, -, paréntesis)",
      );
      return undefined;
    }
    return texto;
  }
  if (texto.length > 2000) {
    errors.push("detalle no puede superar 2000 caracteres");
    return undefined;
  }
  return texto;
}

export function parseCrearCliente(body: unknown): ResultadoParse<DatosCliente> {
  if (!esObjeto(body)) {
    return { ok: false, errors: ["El cuerpo debe ser un objeto JSON"] };
  }
  const errors = clavesDesconocidas(body);
  const nombre = validarCampo("nombre", body.nombre, errors);
  const correo = validarCampo("correo", body.correo, errors);
  const telefono = validarCampo("telefono", body.telefono, errors);
  const detalle = validarCampo("detalle", body.detalle, errors);
  if (
    errors.length > 0 ||
    !nombre ||
    correo === undefined ||
    telefono === undefined ||
    detalle === undefined
  ) {
    return { ok: false, errors };
  }
  return { ok: true, data: { nombre, correo, telefono, detalle } };
}

export function parseActualizarCliente(
  body: unknown,
): ResultadoParse<Partial<DatosCliente>> {
  if (!esObjeto(body)) {
    return { ok: false, errors: ["El cuerpo debe ser un objeto JSON"] };
  }
  const errors = clavesDesconocidas(body);
  const data: Partial<DatosCliente> = {};
  let presentes = 0;
  for (const campo of CAMPOS) {
    if (!(campo in body)) continue;
    presentes++;
    const valor = validarCampo(campo, body[campo], errors);
    if (valor === undefined) continue;
    if (campo === "nombre") {
      if (valor !== null) data.nombre = valor;
    } else {
      data[campo] = valor;
    }
  }
  if (presentes === 0 && errors.length === 0) {
    errors.push("Debe enviar al menos un campo a actualizar");
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data };
}

export function parseListado(
  params: URLSearchParams,
): ResultadoParse<ParametrosListado> {
  const errors: string[] = [];
  let limit = 50;
  let offset = 0;

  const limitRaw = params.get("limit");
  if (limitRaw !== null) {
    const n = Number(limitRaw);
    if (!/^\d+$/.test(limitRaw) || n < 1 || n > 100) {
      errors.push("limit debe ser un entero entre 1 y 100");
    } else {
      limit = n;
    }
  }
  const offsetRaw = params.get("offset");
  if (offsetRaw !== null) {
    const n = Number(offsetRaw);
    if (!/^\d+$/.test(offsetRaw) || !Number.isSafeInteger(n)) {
      errors.push("offset debe ser un entero mayor o igual a 0");
    } else {
      offset = n;
    }
  }
  // Se eliminan caracteres con significado en filtros PostgREST y patrones ilike.
  const q = (params.get("q") ?? "").replace(/[,()%*_\\"]/g, " ").trim();
  if (q.length > 100) errors.push("q no puede superar 100 caracteres");

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { q: q === "" ? null : q, limit, offset } };
}
