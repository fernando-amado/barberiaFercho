"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { temaMui } from "./tema-mui";

// TemaScript es la fuente de verdad del modo: MUI no debe leer ni escribir su propio almacenamiento.
export default function ProveedorTema({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={temaMui} defaultMode="light" storageManager={null}>
      {children}
    </ThemeProvider>
  );
}
