"use client";

import { useState, type FormEvent } from "react";
import type { Cliente } from "@/lib/clientes/validacion";
import type { DatosEntrada } from "@/lib/clientes/servicio";

type Props = {
  inicial?: Cliente;
  enviando: boolean;
  errores: string[];
  onSubmit: (datos: Partial<DatosEntrada>) => void;
  onCancelar?: () => void;
};

const CAMPOS = ["nombre", "correo", "telefono", "detalle"] as const;

export default function ClienteForm({
  inicial,
  enviando,
  errores,
  onSubmit,
  onCancelar,
}: Props) {
  const [valores, setValores] = useState({
    nombre: inicial?.nombre ?? "",
    correo: inicial?.correo ?? "",
    telefono: inicial?.telefono ?? "",
    detalle: inicial?.detalle ?? "",
  });
  const [aviso, setAviso] = useState("");

  function cambiar(campo: (typeof CAMPOS)[number], valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    setAviso("");
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    if (!inicial) {
      onSubmit(valores);
      return;
    }
    const cambios: Partial<DatosEntrada> = {};
    for (const campo of CAMPOS) {
      if (valores[campo] !== (inicial[campo] ?? "")) {
        cambios[campo] = valores[campo];
      }
    }
    if (Object.keys(cambios).length === 0) {
      setAviso("No hay cambios para guardar");
      return;
    }
    onSubmit(cambios);
  }

  return (
    <form onSubmit={enviar} className="tarjeta mb-6 space-y-4">
      <h2 className="text-xl font-semibold">
        {inicial ? "Editar cliente" : "Nuevo cliente"}
      </h2>
      <div>
        <label htmlFor="cliente-nombre">Nombre (obligatorio)</label>
        <input
          id="cliente-nombre"
          className="campo"
          required
          maxLength={120}
          value={valores.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cliente-correo">Correo</label>
        <input
          id="cliente-correo"
          type="email"
          className="campo"
          maxLength={254}
          value={valores.correo}
          onChange={(e) => cambiar("correo", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cliente-telefono">
          Teléfono (7 a 20 caracteres: dígitos, espacios, +, -, paréntesis)
        </label>
        <input
          id="cliente-telefono"
          type="tel"
          className="campo"
          maxLength={20}
          value={valores.telefono}
          onChange={(e) => cambiar("telefono", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cliente-detalle">Detalle</label>
        <textarea
          id="cliente-detalle"
          className="campo"
          maxLength={2000}
          rows={3}
          value={valores.detalle}
          onChange={(e) => cambiar("detalle", e.target.value)}
        />
      </div>
      {(errores.length > 0 || aviso) && (
        <div role="alert" className="mensaje-error">
          {aviso && <p>{aviso}</p>}
          {errores.map((err) => (
            <p key={err}>{err}</p>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={enviando} className="boton">
          {inicial ? "Guardar cambios" : "Crear cliente"}
        </button>
        {onCancelar && (
          <button
            type="button"
            disabled={enviando}
            onClick={onCancelar}
            className="boton-secundario"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
