import Link from "next/link";

const ENLACE =
  "rounded underline hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento";

export default function Pie() {
  return (
    <footer className="border-t border-borde bg-superficie">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-suave">
        <p>© Barbería Fercho. Todos los derechos reservados.</p>
        <nav aria-label="Pie" className="flex gap-4">
          <Link href="/login" className={ENLACE}>
            Iniciar sesión
          </Link>
          <Link href="/clientes" className={ENLACE}>
            Clientes
          </Link>
        </nav>
      </div>
    </footer>
  );
}
