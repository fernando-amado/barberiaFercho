"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClase =
  "w-full rounded border border-gray-300 px-2 py-1 disabled:opacity-60";

export default function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });
    if (error) {
      setError(
        error.status === 400
          ? "Correo o contraseña incorrectos"
          : "No se pudo iniciar sesión, intenta de nuevo",
      );
      setEnviando(false);
      return;
    }
    router.replace("/clientes");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
      <div>
        <label htmlFor="login-correo">Correo</label>
        <input
          id="login-correo"
          type="email"
          autoComplete="email"
          required
          disabled={enviando}
          className={inputClase}
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="login-clave">Contraseña</label>
        <input
          id="login-clave"
          type="password"
          autoComplete="current-password"
          required
          disabled={enviando}
          className={inputClase}
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded border px-3 py-1 disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
