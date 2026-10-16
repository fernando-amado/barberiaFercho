import Link from "@/app/tema/enlace-next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const BOTON_HERO = {
  color: "#ffffff",
  borderColor: "rgba(255,255,255,0.7)",
  "&:hover": { backgroundColor: "#ffffff", color: "#1c1917", borderColor: "#ffffff" },
};

export default function Hero() {
  return (
    <Box
      component="section"
      id="inicio"
      aria-labelledby="titulo-hero"
      sx={{ background: "linear-gradient(135deg, #0c0a09, #1c1917 50%, #292524)", color: "#ffffff" }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 8, sm: 12 } }}>
        <Typography id="titulo-hero" variant="h1" sx={{ fontSize: { xs: "2.25rem", sm: "3.75rem" }, fontWeight: 700 }}>
          Barbería <Box component="span" sx={{ color: "#fbbf24" }}>Fercho</Box>
        </Typography>
        <Typography sx={{ mt: 2, maxWidth: 576, fontSize: "1.125rem", color: "#e7e5e4" }}>
          Cortes y barba con estilo, en un ambiente cómodo y con atención personalizada.
        </Typography>
        <Stack direction="row" useFlexGap sx={{ mt: 4, flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
          <Button
            component={Link}
            href="/reservas"
            variant="contained"
            sx={{ backgroundColor: "#fbbf24", color: "#1c1917", "&:hover": { backgroundColor: "#fcd34d" } }}
          >
            Reservar cita
          </Button>
          <Button component={Link} href="/login" variant="outlined" sx={BOTON_HERO}>
            Iniciar sesión
          </Button>
          <Button component={Link} href="/clientes" variant="outlined" sx={BOTON_HERO}>
            Clientes
          </Button>
          <Button href="#servicios" sx={{ color: "#ffffff", textDecoration: "underline" }}>
            Ver servicios
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
