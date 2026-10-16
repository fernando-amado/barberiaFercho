"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

const CLAVE = "tema";
const EVENTO = "tema-cambiado";

function guardado(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function esOscuro(): boolean {
  const g = guardado();
  if (g === "dark") return true;
  if (g === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

const leerClase = () => document.documentElement.classList.contains("dark");
const leerServidor = () => false;

export default function BotonTema() {
  const oscuro = useSyncExternalStore(suscribir, leerClase, leerServidor);

  // Reaplica el tema si React restablece las clases de <html> (remontaje en desarrollo).
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", esOscuro());
    window.dispatchEvent(new Event(EVENTO));
  }, []);

  function alternar() {
    const siguiente = !leerClase();
    document.documentElement.classList.toggle("dark", siguiente);
    try {
      localStorage.setItem(CLAVE, siguiente ? "dark" : "light");
    } catch {
      // Sin almacenamiento: el cambio solo dura la sesión de la página.
    }
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={oscuro}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="inline-flex size-9 items-center justify-center rounded-md border border-campo text-texto hover:bg-superficie-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento motion-safe:transition-colors"
    >
      {oscuro ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
