"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

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
    <IconButton
      onClick={alternar}
      aria-pressed={oscuro}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}
    >
      {oscuro ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
