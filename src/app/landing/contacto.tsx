import Link from "@/app/tema/enlace-next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CONTACTO } from "./datos";

export default function Contacto() {
  return (
    <Box component="section" id="contacto" aria-labelledby="titulo-contacto">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography id="titulo-contacto" variant="h2" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Contacto
        </Typography>
        <Card
          component="dl"
          variant="outlined"
          sx={{ mt: 3, mb: 0, mx: 0, p: 3, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}
        >
          <Box>
            <Typography component="dt" sx={{ fontWeight: 600 }}>
              Dirección
            </Typography>
            <Typography component="dd" sx={{ m: 0, color: "text.secondary" }}>
              {CONTACTO.direccion}
            </Typography>
          </Box>
          <Box>
            <Typography component="dt" sx={{ fontWeight: 600 }}>
              Horario
            </Typography>
            <Typography component="dd" sx={{ m: 0, color: "text.secondary" }}>
              {CONTACTO.horario}
            </Typography>
          </Box>
          <Box>
            <Typography component="dt" sx={{ fontWeight: 600 }}>
              Teléfono
            </Typography>
            <Typography component="dd" sx={{ m: 0 }}>
              <MuiLink href={CONTACTO.telefonoHref} color="inherit">
                {CONTACTO.telefono}
              </MuiLink>
            </Typography>
          </Box>
        </Card>
        <Stack direction="row" useFlexGap sx={{ mt: 4, flexWrap: "wrap", gap: 1.5 }}>
          <Button href={CONTACTO.whatsappHref} target="_blank" rel="noopener noreferrer" variant="contained">
            Escribir por WhatsApp
          </Button>
          <Button component={Link} href="/reservas" variant="contained">
            Reservar cita
          </Button>
          <Button component={Link} href="/login" variant="outlined" color="inherit">
            Iniciar sesión
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
