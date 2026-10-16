import Link from "@/app/tema/enlace-next";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import BotonTema from "@/app/tema/boton-tema";
import { NAV } from "./datos";

export default function Encabezado() {
  return (
    <AppBar position="static" color="inherit" enableColorOnDark elevation={1}>
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ flexWrap: "wrap", justifyContent: "space-between", gap: 1.5, py: 1 }}>
          <Button component={Link} href="/" color="inherit" sx={{ fontSize: "1.125rem", fontWeight: 700 }}>
            Barbería Fercho
          </Button>
          <Box component="nav" aria-label="Principal" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            {NAV.map((item) => (
              <Button key={item.href} href={item.href} color="inherit" sx={{ color: "text.secondary" }}>
                {item.etiqueta}
              </Button>
            ))}
            <Button component={Link} href="/reservas" variant="contained">
              Reservar
            </Button>
            <Button component={Link} href="/login" variant="outlined" color="inherit">
              Iniciar sesión
            </Button>
            <BotonTema />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
