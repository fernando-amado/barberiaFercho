import Link from "next/link";
import BotonTema from "@/app/tema/boton-tema";
import { NAV } from "./datos";

export default function Encabezado() {
  return (
    <header className="border-b border-borde bg-superficie shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="rounded text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        >
          Barbería Fercho
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-4 text-sm">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded text-suave hover:text-texto hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
            >
              {item.etiqueta}
            </a>
          ))}
          <Link href="/reservas" className="boton">
            Reservar
          </Link>
          <Link href="/login" className="boton-secundario">
            Iniciar sesión
          </Link>
          <BotonTema />
        </nav>
      </div>
    </header>
  );
}
