import type { Metadata } from "next";
import Encabezado from "@/app/landing/encabezado";
import Pie from "@/app/landing/pie";
import { CONTACTO } from "@/app/landing/datos";
import ReservaForm from "./reserva-form";

export const metadata: Metadata = { title: "Reservar cita" };

export default function ReservasPage() {
  return (
    <>
      <Encabezado />
      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Reserva tu cita</h1>
        <p className="mt-2 mb-6 text-neutral-700">{CONTACTO.horario}</p>
        <ReservaForm />
      </main>
      <Pie />
    </>
  );
}
