import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { PRECIOS } from "./datos";

const formato = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function Precios() {
  return (
    <Box component="section" id="precios" aria-labelledby="titulo-precios" sx={{ bgcolor: "action.hover" }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography id="titulo-precios" variant="h2" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Precios
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3, maxWidth: 576 }}>
          <Table>
            <Box component="caption" className="sr-only">
              Lista de precios por servicio
            </Box>
            <TableHead>
              <TableRow>
                <TableCell scope="col" sx={{ fontWeight: 600 }}>
                  Servicio
                </TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 600 }}>
                  Precio
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PRECIOS.map((p) => (
                <TableRow key={p.servicio} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {p.servicio}
                    {p.nota ? (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {p.nota}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formato.format(p.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
