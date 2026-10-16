import type { Metadata } from "next";
import Container from "@mui/material/Container";
import ClientesCrud from "./clientes-crud";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientesPage() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <ClientesCrud />
    </Container>
  );
}
