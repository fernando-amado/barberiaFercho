"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
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
      <Alert severity="success" role="status">
        <AlertTitle>Reserva recibida</AlertTitle>
        <Typography>
          {creada.servicio} el {formatearFecha(creada.fecha)} a las {creada.hora}.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Tu reserva queda pendiente de confirmación. Te contactaremos para confirmarla.
        </Typography>
        <Button
          type="button"
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            setCreada(null);
            setErrores([]);
          }}
        >
          Hacer otra reserva
        </Button>
      </Alert>
    );
  }

  return (
    <Stack component="form" onSubmit={enviar} spacing={2}>
      <TextField
        id="reserva-nombre"
        label="Nombre"
        required
        value={valores.nombre}
        onChange={(e) => cambiar("nombre", e.target.value)}
        slotProps={{ htmlInput: { maxLength: 120, autoComplete: "name" } }}
      />
      <TextField
        id="reserva-telefono"
        label="Teléfono"
        type="tel"
        required
        value={valores.telefono}
        onChange={(e) => cambiar("telefono", e.target.value)}
        slotProps={{ htmlInput: { minLength: 7, maxLength: 20, autoComplete: "tel" } }}
      />
      <TextField
        id="reserva-servicio"
        label="Servicio"
        select
        required
        value={valores.servicio}
        onChange={(e) => cambiar("servicio", e.target.value)}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="">Selecciona un servicio</option>
        {SERVICIOS.map((s) => (
          <option key={s.nombre} value={s.nombre}>
            {s.nombre}
          </option>
        ))}
      </TextField>
      <TextField
        id="reserva-fecha"
        label="Fecha"
        type="date"
        required
        value={valores.fecha}
        onChange={(e) => cambiar("fecha", e.target.value)}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: limites.min, max: limites.max } }}
      />
      <TextField
        id="reserva-hora"
        label="Hora"
        select
        required
        value={valores.hora}
        onChange={(e) => cambiar("hora", e.target.value)}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="">Selecciona una hora</option>
        {HORAS_DISPONIBLES.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </TextField>
      <TextField
        id="reserva-notas"
        label="Notas (opcional)"
        multiline
        minRows={3}
        value={valores.notas}
        onChange={(e) => cambiar("notas", e.target.value)}
        slotProps={{ htmlInput: { maxLength: 500 } }}
      />
      {errores.length > 0 && (
        <Alert severity="error" role="alert">
          {errores.map((err) => (
            <p key={err}>{err}</p>
          ))}
        </Alert>
      )}
      <Button type="submit" variant="contained" disabled={enviando}>
        {enviando ? "Enviando..." : "Reservar cita"}
      </Button>
    </Stack>
  );
}
