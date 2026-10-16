import type { Metadata } from "next";
import ClientesCrud from "./clientes-crud";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientesPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <ClientesCrud />
    </main>
  );
}
