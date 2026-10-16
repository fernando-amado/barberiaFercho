"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/client";

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
    <Stack component="form" onSubmit={enviar} spacing={2}>
      <Typography variant="h1" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
        Iniciar sesión
      </Typography>
      <TextField
        id="login-correo"
        label="Correo"
        type="email"
        required
        disabled={enviando}
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        slotProps={{ htmlInput: { autoComplete: "email" } }}
      />
      <TextField
        id="login-clave"
        label="Contraseña"
        type="password"
        required
        disabled={enviando}
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        slotProps={{ htmlInput: { autoComplete: "current-password" } }}
      />
      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Button type="submit" variant="contained" fullWidth disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
    </Stack>
  );
}
