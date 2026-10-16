import type { Metadata } from "next";
import Link from "@/app/tema/enlace-next";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import BotonTema from "@/app/tema/boton-tema";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display: "flex", minHeight: "100vh", flexDirection: "column", justifyContent: "center", gap: 2, p: 3 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <MuiLink component={Link} href="/" variant="body2" color="text.secondary">
          Volver al inicio
        </MuiLink>
        <BotonTema />
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <LoginForm />
      </Paper>
    </Container>
  );
}
