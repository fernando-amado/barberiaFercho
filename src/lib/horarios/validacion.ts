import { esUuid, type ResultadoParse } from "@/lib/clientes/validacion";

export { esUuid };
export type { ResultadoParse };

// 0 = domingo ... 6 = sabado (igual que getUTCDay()).
export const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

export type Horario = {
  id: string;
  dia_semana: number;
  cerrado: boolean;
  hora_apertura: string | null;
  hora_cierre: string | null;
  created_at: string;
  updated_at: string;
};

export type DatosHorario = {
  dia_semana: number;
  cerrado: boolean;
  hora_apertura: string | null;
  hora_cierre: string | null;
};

export type TramoHorario = Pick<
  DatosHorario,
  "cerrado" | "hora_apertura" | "hora_cierre"
>;

export type ParcialHorario = {
  cerrado?: boolean;
  hora_apertura?: string | null;
  hora_cierre?: string | null;
};

export const COLUMNAS_HORARIO =
  "id, dia_semana, cerrado, hora_apertura, hora_cierre, created_at, updated_at";

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const CAMPOS_CREAR = [
  "dia_semana",
  "cerrado",
  "hora_apertura",
  "hora_cierre",
] as const;
const CAMPOS_ACTUALIZAR = ["cerrado", "hora_apertura", "hora_cierre"] as const;

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

// "09:00:00" (Postgres) -> "09:00"; null se conserva.
function normalizarHora(hora: string | null): string | null {
  return hora === null ? null : hora.slice(0, 5);
}

// Normaliza las horas de una fila de la BD a HH:MM.
export function normalizarHorario(fila: Horario): Horario {
  return {
    ...fila,
    hora_apertura: normalizarHora(fila.hora_apertura),
    hora_cierre: normalizarHora(fila.hora_cierre),
  };
}

// undefined = invalida (agrega el error); null = vacia.
function validarHora(
  campo: string,
  valor: unknown,
  errors: string[],
): string | null | undefined {
  if (valor === null || valor === undefined) return null;
  if (typeof valor !== "string") {
    errors.push(`${campo} debe ser texto con formato HH:MM`);
    return undefined;
  }
  const texto = valor.trim();
  if (texto === "") return null;
  if (!HORA_REGEX.test(texto)) {
    errors.push(`${campo} debe tener formato HH:MM`);
    return undefined;
  }
  return texto;
}

function validarCerrado(
  valor: unknown,
  errors: string[],
): boolean | undefined {
  if (typeof valor !== "boolean") {
    errors.push("cerrado debe ser booleano");
    return undefined;
  }
  return valor;
}

// Valida la regla cruzada del estado final y normaliza las horas.
function validarTramo(tramo: TramoHorario): ResultadoParse<TramoHorario> {
  const { cerrado, hora_apertura, hora_cierre } = tramo;
  if (cerrado) {
    if (hora_apertura !== null || hora_cierre !== null) {
      return {
        ok: false,
        errors: ["Un día cerrado no puede tener hora de apertura ni de cierre"],
      };
    }
    return { ok: true, data: { cerrado, hora_apertura: null, hora_cierre: null } };
  }
  const errors: string[] = [];
  if (hora_apertura === null) errors.push("hora_apertura es obligatoria");
  if (hora_cierre === null) errors.push("hora_cierre es obligatoria");
  if (hora_apertura !== null && hora_cierre !== null && hora_apertura >= hora_cierre) {
    errors.push("hora_apertura debe ser anterior a hora_cierre");
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { cerrado, hora_apertura, hora_cierre } };
}

export function parseCrearHorario(body: unknown): ResultadoParse<DatosHorario> {
  if (!esObjeto(body)) {
    return { ok: false, errors: ["El cuerpo debe ser un objeto JSON"] };
  }
  const errors = clavesDesconocidas(body, CAMPOS_CREAR);

  const dia = body.dia_semana;
  let diaSemana: number | undefined;
  if (
    typeof dia !== "number" ||
    !Number.isInteger(dia) ||
    dia < 0 ||
    dia > 6
  ) {
    errors.push("dia_semana debe ser un entero entre 0 (domingo) y 6 (sábado)");
  } else {
    diaSemana = dia;
  }

  const cerrado =
    body.cerrado === undefined ? false : validarCerrado(body.cerrado, errors);
  const apertura = validarHora("hora_apertura", body.hora_apertura, errors);
  const cierre = validarHora("hora_cierre", body.hora_cierre, errors);

  if (
    errors.length > 0 ||
    diaSemana === undefined ||
    cerrado === undefined ||
    apertura === undefined ||
    cierre === undefined
  ) {
    return { ok: false, errors };
  }

  const tramo = validarTramo({
    cerrado,
    hora_apertura: apertura,
    hora_cierre: cierre,
  });
  if (!tramo.ok) return tramo;
  return { ok: true, data: { dia_semana: diaSemana, ...tramo.data } };
}

export function parseActualizarHorario(
  body: unknown,
): ResultadoParse<ParcialHorario> {
  if (!esObjeto(body)) {
    return { ok: false, errors: ["El cuerpo debe ser un objeto JSON"] };
  }
  const errors = clavesDesconocidas(body, CAMPOS_ACTUALIZAR);
  const data: ParcialHorario = {};
  let presentes = 0;

  if ("cerrado" in body) {
    presentes++;
    const cerrado = validarCerrado(body.cerrado, errors);
    if (cerrado !== undefined) data.cerrado = cerrado;
  }
  if ("hora_apertura" in body) {
    presentes++;
    const hora = validarHora("hora_apertura", body.hora_apertura, errors);
    if (hora !== undefined) data.hora_apertura = hora;
  }
  if ("hora_cierre" in body) {
    presentes++;
    const hora = validarHora("hora_cierre", body.hora_cierre, errors);
    if (hora !== undefined) data.hora_cierre = hora;
  }

  if (presentes === 0 && errors.length === 0) {
    errors.push("Debe enviar al menos un campo a actualizar");
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data };
}

// Mezcla la fila actual (ya normalizada) con el parcial y valida el resultado.
// Si el parcial cierra el dia sin enviar horas, estas se limpian.
export function combinarHorario(
  actual: TramoHorario,
  parcial: ParcialHorario,
): ResultadoParse<TramoHorario> {
  const cerrado = parcial.cerrado ?? actual.cerrado;
  if (cerrado) {
    return validarTramo({
      cerrado,
      hora_apertura: parcial.hora_apertura ?? null,
      hora_cierre: parcial.hora_cierre ?? null,
    });
  }
  return validarTramo({
    cerrado,
    hora_apertura:
      parcial.hora_apertura !== undefined
        ? parcial.hora_apertura
        : actual.hora_apertura,
    hora_cierre:
      parcial.hora_cierre !== undefined
        ? parcial.hora_cierre
        : actual.hora_cierre,
  });
}
