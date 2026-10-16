import Link from "next/link";
import { NAV } from "./datos";

export default function Encabezado() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Barbería Fercho
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-4 text-sm">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-neutral-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              {item.etiqueta}
            </a>
          ))}
          <Link
            href="/reservas"
            className="rounded bg-neutral-900 px-3 py-1 text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors"
          >
            Reservar
          </Link>
          <Link
            href="/login"
            className="rounded border border-neutral-900 px-3 py-1 hover:bg-neutral-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
