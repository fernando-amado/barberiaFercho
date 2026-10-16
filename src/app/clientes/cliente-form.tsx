"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
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
    <Paper component="form" variant="outlined" onSubmit={enviar} sx={{ mb: 3, p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h2" sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
          {inicial ? "Editar cliente" : "Nuevo cliente"}
        </Typography>
        <TextField
          id="cliente-nombre"
          label="Nombre (obligatorio)"
          required
          value={valores.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />
        <TextField
          id="cliente-correo"
          label="Correo"
          type="email"
          value={valores.correo}
          onChange={(e) => cambiar("correo", e.target.value)}
          slotProps={{ htmlInput: { maxLength: 254 } }}
        />
        <TextField
          id="cliente-telefono"
          label="Teléfono (7 a 20 caracteres: dígitos, espacios, +, -, paréntesis)"
          type="tel"
          value={valores.telefono}
          onChange={(e) => cambiar("telefono", e.target.value)}
          slotProps={{ htmlInput: { maxLength: 20 } }}
        />
        <TextField
          id="cliente-detalle"
          label="Detalle"
          multiline
          minRows={3}
          value={valores.detalle}
          onChange={(e) => cambiar("detalle", e.target.value)}
          slotProps={{ htmlInput: { maxLength: 2000 } }}
        />
        {(errores.length > 0 || aviso) && (
          <Alert severity="error" role="alert">
            {aviso && <p>{aviso}</p>}
            {errores.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </Alert>
        )}
        <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button type="submit" variant="contained" disabled={enviando}>
            {inicial ? "Guardar cambios" : "Crear cliente"}
          </Button>
          {onCancelar && (
            <Button type="button" variant="outlined" color="inherit" disabled={enviando} onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
