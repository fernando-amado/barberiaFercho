"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/lib/clientes/validacion";
import {
  ApiError,
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes,
  type DatosEntrada,
} from "@/lib/clientes/servicio";
import BotonTema from "@/app/tema/boton-tema";
import ClienteForm from "./cliente-form";

const DEBOUNCE_MS = 300;

type Resultado = { clave: string; clientes: Cliente[]; error: string };

function mensajesDe(e: unknown): string[] {
  if (e instanceof ApiError) {
    if (e.status === 401) return ["Debes iniciar sesión para gestionar clientes"];
    if (e.status === 400) return e.details?.length ? e.details : [e.message];
    if (e.status === 409) return ["Ya existe un cliente con ese correo"];
    if (e.status === 404) return ["El cliente ya no existe"];
  }
  return ["Ocurrió un error, intenta de nuevo"];
}

export default function ClientesCrud() {
  const router = useRouter();
  const [q, setQ] = useState("");
  // Cambia tras cada creación para que el formulario "nuevo" se remonte vacío.
  const [formVersion, setFormVersion] = useState(0);
  const [qAplicada, setQAplicada] = useState("");
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroresForm, setErroresForm] = useState<string[]>([]);
  const [errorLista, setErrorLista] = useState("");

  const clave = `${qAplicada}|${version}`;
  const cargando = resultado?.clave !== clave;

  useEffect(() => {
    const timer = setTimeout(() => setQAplicada(q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    let cancelado = false;
    listarClientes({ q: qAplicada.trim() })
      .then((clientes) => {
        if (!cancelado) setResultado({ clave, clientes, error: "" });
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setResultado({ clave, clientes: [], error: mensajesDe(e)[0] });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [qAplicada, clave]);

  function recargar() {
    setVersion((v) => v + 1);
  }

  async function guardar(datos: Partial<DatosEntrada>) {
    if (enviando) return;
    setEnviando(true);
    setErroresForm([]);
    try {
      if (editando) {
        await actualizarCliente(editando.id, datos);
      } else {
        await crearCliente(datos as DatosEntrada);
      }
      setEditando(null);
      setFormVersion((v) => v + 1);
      recargar();
    } catch (e) {
      setErroresForm(mensajesDe(e));
      if (e instanceof ApiError && e.status === 404) {
        setEditando(null);
        recargar();
      }
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(cliente: Cliente) {
    if (enviando) return;
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}?`)) return;
    setEnviando(true);
    setErrorLista("");
    try {
      await eliminarCliente(cliente.id);
      if (editando?.id === cliente.id) setEditando(null);
      setResultado((prev) =>
        prev
          ? { ...prev, clientes: prev.clientes.filter((c) => c.id !== cliente.id) }
          : prev,
      );
    } catch (e) {
      setErrorLista(mensajesDe(e)[0]);
      if (e instanceof ApiError && e.status === 404) recargar();
    } finally {
      setEnviando(false);
    }
  }

  async function cerrarSesion() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const clientes = resultado?.clientes ?? [];
  const errorVisible = errorLista || (cargando ? "" : (resultado?.error ?? ""));

  return (
    <div>
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Typography variant="h1" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Clientes
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <BotonTema />
          <Button type="button" variant="outlined" color="inherit" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </Stack>
      </Box>

      <ClienteForm
        key={editando?.id ?? `nuevo-${formVersion}`}
        inicial={editando ?? undefined}
        enviando={enviando}
        errores={erroresForm}
        onSubmit={guardar}
        onCancelar={
          editando
            ? () => {
                setEditando(null);
                setErroresForm([]);
              }
            : undefined
        }
      />

      <TextField
        id="clientes-buscar"
        label="Buscar"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 100 } }}
        sx={{ mb: 1.5 }}
      />

      {errorVisible && (
        <Alert severity="error" role="alert" sx={{ mb: 1.5 }}>
          {errorVisible}
        </Alert>
      )}

      {cargando ? (
        <Typography sx={{ color: "text.secondary" }}>Cargando...</Typography>
      ) : clientes.length === 0 ? (
        !errorVisible && <Typography sx={{ color: "text.secondary" }}>No hay clientes</Typography>
      ) : (
        <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: "none" }}>
          {clientes.map((c) => (
            <Paper
              key={c.id}
              component="li"
              variant="outlined"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                p: 2,
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <div>
                <Typography sx={{ fontWeight: 500 }}>{c.nombre}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {c.correo ?? "—"} · {c.telefono ?? "—"}
                </Typography>
              </div>
              <Stack direction="row" spacing={1}>
                <Button
                  type="button"
                  variant="outlined"
                  color="inherit"
                  disabled={enviando}
                  onClick={() => {
                    setErroresForm([]);
                    setEditando(c);
                  }}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  disabled={enviando}
                  onClick={() => eliminar(c)}
                >
                  Eliminar
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </div>
  );
}
