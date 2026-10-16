import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { SERVICIOS } from "./datos";

export default function Servicios() {
  return (
    <Box component="section" id="servicios" aria-labelledby="titulo-servicios">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography id="titulo-servicios" variant="h2" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Servicios
        </Typography>
        <Box
          component="ul"
          sx={{
            mt: 3,
            mb: 0,
            p: 0,
            listStyle: "none",
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          }}
        >
          {SERVICIOS.map((s) => (
            <Card key={s.nombre} component="li" variant="outlined" sx={{ "&:hover": { borderColor: "primary.main" } }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  {s.nombre}
                </Typography>
                <Typography sx={{ mt: 1, color: "text.secondary" }}>{s.descripcion}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
