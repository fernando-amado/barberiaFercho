import { SERVICIOS } from "@/app/landing/datos";
import { esUuid, type ResultadoParse } from "@/lib/clientes/validacion";

export { esUuid };
export type { ResultadoParse };

export const ESTADOS = [
  "pendiente",
  "confirmada",
  "cancelada",
  "completada",
] as const;
export type EstadoReserva = (typeof ESTADOS)[number];

export const SERVICIOS_VALIDOS: readonly string[] = SERVICIOS.map(
  (s) => s.nombre,
);

// Horario placeholder: lun-sab, bloques de 30 min, ultimo inicio 18:30.
export const HORA_MINIMA = "09:00";
export const HORA_MAXIMA = "18:30";
export const DIAS_MAXIMOS_ADELANTE = 60;
const ZONA_HORARIA = "America/Bogota";

export type Reserva = {
  id: string;
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoReserva;
  notas: string | null;
  cliente_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DatosReserva = {
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoReserva;
  notas: string | null;
};

// Datos del form publico: sin estado (siempre pendiente).
export type DatosReservaPublica = Omit<DatosReserva, "estado">;

export type ParametrosListado = {
  estado: EstadoReserva | null;
  desde: string | null;
  hasta: string | null;
  limit: number;
  offset: number;
};

export const COLUMNAS_RESERVA =
  "id, nombre, telefono, servicio, fecha, hora, estado, notas, cliente_id, created_at, updated_at";

const TELEFONO_REGEX = /^[0-9\s+\-()]+$/;
const FECHA_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const CAMPOS_PUBLICOS = [
  "nombre",
  "telefono",
  "servicio",
  "fecha",
  "hora",
  "notas",
] as const;
const CAMPOS_STAFF = [...CAMPOS_PUBLICOS, "estado"] as const;
type Campo = (typeof CAMPOS_STAFF)[number];

function esObjeto(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

function clavesDesconocidas(
  body: Record<string, unknown>,
  permitidas: readonly string[],
): string[] {
  return Object.keys(body)
    .filter((k) => !permitidas.includes(k))
    .map((k) => `Campo no permitido: ${k}`);
}

// Milisegundos UTC de una fecha ISO real, o null si no existe en el calendario.
function fechaAMs(fecha: string): number | null {
  const m = FECHA_REGEX.exec(fecha);
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(anio, mes - 1, dia);
  const d = new Date(ms);
  if (
    d.getUTCFullYear() !== anio ||
    d.getUTCMonth() !== mes - 1 ||
    d.getUTCDate() !== dia
  ) {
    return null;
  }
  return ms;
}

// Fecha de hoy (YYYY-MM-DD) en la zona horaria del negocio.
function hoyEnNegocio(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function validarFecha(texto: string, errors: string[]): string | undefined {
  const ms = fechaAMs(texto);
  if (ms === null) {
    errors.push("fecha debe tener formato YYYY-MM-DD y ser una fecha real");
    return undefined;
  }
  const hoyMs = fechaAMs(hoyEnNegocio());
  if (hoyMs !== null) {
    const dias = (ms - hoyMs) / 86_400_000;
    if (dias < 0) {
      errors.push("fecha no puede ser anterior a hoy");
      return undefined;
    }
    if (dias > DIAS_MAXIMOS_ADELANTE) {
      errors.push(
        `fecha no puede superar ${DIAS_MAXIMOS_ADELANTE} días hacia adelante`,
      );
      return undefined;
    }
  }
  if (new Date(ms).getUTCDay() === 0) {
    errors.push("La barbería está cerrada los domingos");
    return undefined;
  }
  return texto;
}

function validarHora(texto: string, errors: string[]): string | undefined {
  const m = HORA_REGEX.exec(texto);
  if (!m) {
    errors.push("hora debe tener formato HH:MM");
    return undefined;
  }
  const minutos = Number(m[1]) * 60 + Number(m[2]);
  const min = 9 * 60;
  const max = 18 * 60 + 30;
  if (minutos < min || minutos > max || minutos % 30 !== 0) {
    errors.push(
      `hora debe estar entre ${HORA_MINIMA} y ${HORA_MAXIMA} en bloques de 30 minutos`,
    );
    return undefined;
  }
  return texto;
}

// Devuelve el valor normalizado (null solo para notas vacias) o undefined si es
// invalido (agrega el error a la lista).
function validarCampo(
  campo: Campo,
  valor: unknown,
  errors: string[],
): string | null | undefined {
  if (valor === null || valor === undefined) {
    if (campo === "notas") return null;
    errors.push(`${campo} es obligatorio`);
    return undefined;
  }
  if (typeof valor !== "string") {
    errors.push(`${campo} debe ser texto`);
    return undefined;
  }
  const texto = valor.trim();
  switch (campo) {
    case "nombre":
      if (texto.length < 1 || texto.length > 120) {
        errors.push("nombre debe tener entre 1 y 120 caracteres");
        return undefined;
      }
      return texto;
    case "telefono":
      if (
        texto.length < 7 ||
        texto.length > 20 ||
        !TELEFONO_REGEX.test(texto)
      ) {
        errors.push(
          "telefono debe tener 7-20 caracteres (dígitos, espacios, +, -, paréntesis)",
        );
        return undefined;
      }
      return texto;
    case "servicio":
      if (!SERVICIOS_VALIDOS.includes(texto)) {
        errors.push(`servicio debe ser uno de: ${SERVICIOS_VALIDOS.join(", ")}`);
        return undefined;
      }
      return texto;
    case "fecha":
      return validarFecha(texto, errors);
    case "hora":
      return validarHora(texto, errors);
    case "estado":
      if (!(ESTADOS as readonly string[]).includes(texto)) {
        errors.push(`estado debe ser uno de: ${ESTADOS.join(", ")}`);
        return undefined;
      }
      return texto;
    case "notas":
      if (texto === "") return null;
      if (texto.length > 500) {
        errors.push("notas no puede superar 500 caracteres");
        return undefined;
      }
      return texto;
  }
}

// Reserva del form publico: el estado no se acepta (el handler fija 'pendiente').
export function parseCrearReserva(
  body: unknown,
): ResultadoParse<DatosReservaPublica> {
  if (!esObjeto(body)) {
    return { ok: false, errors: ["El cuerpo debe ser un objeto JSON"] };
  }
  const errors = clavesDesconocidas(body, CAMPOS_PUBLICOS);
  const nombre = validarCampo("nombre", body.nombre, errors);
  const telefono = validarCampo("telefono", body.telefono, errors);
  const servicio = validarCampo("servicio", body.servicio, errors);
  const fecha = validarCampo("fecha", body.fecha, errors);
  const hora = validarCampo("hora", body.hora, errors);
  const notas = validarCampo("notas", body.notas, errors);
  if (
    errors.length > 0 ||
    !nombre ||
    !telefono ||
    !servicio ||
    !fecha ||
    !hora ||
    notas === undefined
  ) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: { nombre, telefono, servicio, fecha, hora, notas },
  };
}

export function parseActualizarReserva(
  body: unknown,
): ResultadoParse<Partial<DatosReserva>> {
  if (!esObjeto(body)) {
    return { ok: false, errors: ["El cuerpo debe ser un objeto JSON"] };
  }
  const errors = clavesDesconocidas(body, CAMPOS_STAFF);
  const data: Record<string, string | null> = {};
  let presentes = 0;
  for (const campo of CAMPOS_STAFF) {
    if (!(campo in body)) continue;
    presentes++;
    const valor = validarCampo(campo, body[campo], errors);
    if (valor !== undefined) data[campo] = valor;
  }
  if (presentes === 0 && errors.length === 0) {
    errors.push("Debe enviar al menos un campo a actualizar");
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: data as Partial<DatosReserva> };
}

function parseEntero(
  raw: string | null,
  nombre: string,
  min: number,
  max: number,
  errors: string[],
): number | null {
  if (raw === null) return null;
  const n = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(n) || n < min || n > max) {
    errors.push(
      max === Number.MAX_SAFE_INTEGER
        ? `${nombre} debe ser un entero mayor o igual a ${min}`
        : `${nombre} debe ser un entero entre ${min} y ${max}`,
    );
    return null;
  }
  return n;
}

export function parseListado(
  params: URLSearchParams,
): ResultadoParse<ParametrosListado> {
  const errors: string[] = [];
  const limit = parseEntero(params.get("limit"), "limit", 1, 100, errors) ?? 50;
  const offset =
    parseEntero(params.get("offset"), "offset", 0, Number.MAX_SAFE_INTEGER, errors) ?? 0;

  let estado: EstadoReserva | null = null;
  const estadoRaw = params.get("estado");
  if (estadoRaw !== null) {
    if ((ESTADOS as readonly string[]).includes(estadoRaw)) {
      estado = estadoRaw as EstadoReserva;
    } else {
      errors.push(`estado debe ser uno de: ${ESTADOS.join(", ")}`);
    }
  }

  const fechaFiltro = (nombre: "desde" | "hasta"): string | null => {
    const raw = params.get(nombre);
    if (raw === null) return null;
    if (fechaAMs(raw) === null) {
      errors.push(`${nombre} debe tener formato YYYY-MM-DD y ser una fecha real`);
      return null;
    }
    return raw;
  };
  const desde = fechaFiltro("desde");
  const hasta = fechaFiltro("hasta");
  if (desde && hasta && desde > hasta) {
    errors.push("desde no puede ser posterior a hasta");
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { estado, desde, hasta, limit, offset } };
}
