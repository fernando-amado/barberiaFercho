"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Clientes</h1>
        <button
          type="button"
          className="rounded border px-3 py-1"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>

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

      <div className="mb-3">
        <label htmlFor="clientes-buscar">Buscar</label>
        <input
          id="clientes-buscar"
          type="search"
          maxLength={100}
          className="w-full rounded border border-gray-300 px-2 py-1"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {errorVisible && (
        <p role="alert" className="mb-3 text-red-700">
          {errorVisible}
        </p>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : clientes.length === 0 ? (
        !errorVisible && <p>No hay clientes</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {clientes.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">{c.nombre}</p>
                <p className="text-sm">
                  {c.correo ?? "—"} · {c.telefono ?? "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={enviando}
                  className="rounded border px-3 py-1 disabled:opacity-60"
                  onClick={() => {
                    setErroresForm([]);
                    setEditando(c);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={enviando}
                  className="rounded border px-3 py-1 disabled:opacity-60"
                  onClick={() => eliminar(c)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
