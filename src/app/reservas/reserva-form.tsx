"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { SERVICIOS } from "@/app/landing/datos";
import {
  ApiError,
  crearReserva,
  type ReservaCreada,
} from "@/lib/reservas/servicio";
import {
  HORAS_DISPONIBLES,
  esDomingo,
  fechaHoyBogota,
  fechaMaxima,
} from "@/lib/reservas/horario";

const VALORES_INICIALES = {
  nombre: "",
  telefono: "",
  servicio: "",
  fecha: "",
  hora: "",
  notas: "",
};

type Campo = keyof typeof VALORES_INICIALES;

function mensajesDe(e: unknown): string[] {
  if (e instanceof ApiError) {
    if (e.status === 400) return e.details?.length ? e.details : [e.message];
    if (e.status === 409) return ["Ese horario ya no está disponible, elige otro"];
  }
  return ["Ocurrió un error, intenta de nuevo"];
}

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(anio, mes - 1, dia)));
}

const sinSuscripcion = () => () => {};

// Limites de fecha calculados solo en cliente (evita mismatch de hidratacion).
function useLimitesFecha() {
  const min = useSyncExternalStore(sinSuscripcion, fechaHoyBogota, () => "");
  const max = useSyncExternalStore(sinSuscripcion, fechaMaxima, () => "");
  return { min: min || undefined, max: max || undefined };
}

export default function ReservaForm() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [creada, setCreada] = useState<ReservaCreada | null>(null);
  const limites = useLimitesFecha();

  function cambiar(campo: Campo, valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    if (esDomingo(valores.fecha)) {
      setErrores(["La barbería está cerrada los domingos"]);
      return;
    }
    setEnviando(true);
    setErrores([]);
    try {
      const resultado = await crearReserva({ ...valores });
      setCreada(resultado);
      setValores(VALORES_INICIALES);
    } catch (err) {
      setErrores(mensajesDe(err));
    } finally {
      setEnviando(false);
    }
  }

  if (creada) {
    return (
      <div role="status" className="space-y-3">
        <h2 className="text-xl font-semibold">Reserva recibida</h2>
        <p>
          {creada.servicio} el {formatearFecha(creada.fecha)} a las {creada.hora}.
        </p>
        <p className="text-suave">
          Tu reserva queda pendiente de confirmación. Te contactaremos para confirmarla.
        </p>
        <button
          type="button"
          className="boton"
          onClick={() => {
            setCreada(null);
            setErrores([]);
          }}
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="reserva-nombre">Nombre</label>
        <input
          id="reserva-nombre"
          className="campo"
          required
          maxLength={120}
          autoComplete="name"
          value={valores.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="reserva-telefono">Teléfono</label>
        <input
          id="reserva-telefono"
          type="tel"
          className="campo"
          required
          minLength={7}
          maxLength={20}
          autoComplete="tel"
          value={valores.telefono}
          onChange={(e) => cambiar("telefono", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="reserva-servicio">Servicio</label>
        <select
          id="reserva-servicio"
          className="campo"
          required
          value={valores.servicio}
          onChange={(e) => cambiar("servicio", e.target.value)}
        >
          <option value="">Selecciona un servicio</option>
          {SERVICIOS.map((s) => (
            <option key={s.nombre} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="reserva-fecha">Fecha</label>
        <input
          id="reserva-fecha"
          type="date"
          className="campo"
          required
          min={limites.min}
          max={limites.max}
          value={valores.fecha}
          onChange={(e) => cambiar("fecha", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="reserva-hora">Hora</label>
        <select
          id="reserva-hora"
          className="campo"
          required
          value={valores.hora}
          onChange={(e) => cambiar("hora", e.target.value)}
        >
          <option value="">Selecciona una hora</option>
          {HORAS_DISPONIBLES.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="reserva-notas">Notas (opcional)</label>
        <textarea
          id="reserva-notas"
          className="campo"
          maxLength={500}
          rows={3}
          value={valores.notas}
          onChange={(e) => cambiar("notas", e.target.value)}
        />
      </div>
      {errores.length > 0 && (
        <div role="alert" className="mensaje-error">
          {errores.map((err) => (
            <p key={err}>{err}</p>
          ))}
        </div>
      )}
      <button type="submit" disabled={enviando} className="boton">
        {enviando ? "Enviando..." : "Reservar cita"}
      </button>
    </form>
  );
}
