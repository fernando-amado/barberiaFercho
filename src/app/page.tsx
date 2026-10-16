import type { Metadata } from "next";
import Encabezado from "./landing/encabezado";
import Hero from "./landing/hero";
import Servicios from "./landing/servicios";
import Precios from "./landing/precios";
import Contacto from "./landing/contacto";
import Pie from "./landing/pie";

export const metadata: Metadata = {
  title: { absolute: "Barbería Fercho" },
  description: "Cortes y barba con estilo. Conoce nuestros servicios, precios y cómo contactarnos.",
};

export default function Home() {
  return (
    <>
      <Encabezado />
      <main>
        <Hero />
        <Servicios />
        <Precios />
        <Contacto />
      </main>
      <Pie />
    </>
  );
}
