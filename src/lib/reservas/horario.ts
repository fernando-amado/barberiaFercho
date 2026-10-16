import {
  DIAS_MAXIMOS_ADELANTE,
  HORA_MAXIMA,
  HORA_MINIMA,
} from "@/lib/reservas/validacion";

const ZONA_HORARIA = "America/Bogota";
const PASO_MINUTOS = 30;

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aTexto(minutos: number): string {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function generarHoras(): string[] {
  const horas: string[] = [];
  for (let t = aMinutos(HORA_MINIMA); t <= aMinutos(HORA_MAXIMA); t += PASO_MINUTOS) {
    horas.push(aTexto(t));
  }
  return horas;
}

export const HORAS_DISPONIBLES: string[] = generarHoras();

// Fecha de hoy (YYYY-MM-DD) en la zona horaria del negocio.
export function fechaHoyBogota(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Hoy (Bogota) mas DIAS_MAXIMOS_ADELANTE dias, en formato YYYY-MM-DD.
export function fechaMaxima(): string {
  const [anio, mes, dia] = fechaHoyBogota().split("-").map(Number);
  const ms = Date.UTC(anio, mes - 1, dia + DIAS_MAXIMOS_ADELANTE);
  return new Date(ms).toISOString().slice(0, 10);
}

export function esDomingo(fecha: string): boolean {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return false;
  return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay() === 0;
}
