import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Encabezado from "@/app/landing/encabezado";
import Pie from "@/app/landing/pie";
import { CONTACTO } from "@/app/landing/datos";
import ReservaForm from "./reserva-form";

export const metadata: Metadata = { title: "Reservar cita" };

export default function ReservasPage() {
  return (
    <>
      <Encabezado />
      <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h1" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Reserva tu cita
        </Typography>
        <Typography sx={{ mt: 1, mb: 3, color: "text.secondary" }}>{CONTACTO.horario}</Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <ReservaForm />
        </Paper>
      </Container>
      <Pie />
    </>
  );
}
