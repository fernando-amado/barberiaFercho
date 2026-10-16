import Link from "@/app/tema/enlace-next";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Pie() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Container
        maxWidth="md"
        sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, py: 3 }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          © Barbería Fercho. Todos los derechos reservados.
        </Typography>
        <Stack component="nav" aria-label="Pie" direction="row" spacing={2}>
          <MuiLink component={Link} href="/login" variant="body2" color="text.secondary">
            Iniciar sesión
          </MuiLink>
          <MuiLink component={Link} href="/clientes" variant="body2" color="text.secondary">
            Clientes
          </MuiLink>
        </Stack>
      </Container>
    </Box>
  );
}
