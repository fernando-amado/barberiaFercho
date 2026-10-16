import Link from "next/link";

const BOTON_HERO =
  "inline-flex items-center justify-center rounded-md border border-white/70 px-5 py-2 font-medium text-white hover:bg-white hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 motion-safe:transition-colors";

export default function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="titulo-hero"
      className="bg-linear-to-br from-stone-950 via-stone-900 to-stone-800 text-white"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h1 id="titulo-hero" className="text-4xl font-bold tracking-tight sm:text-6xl">
          Barbería <span className="text-amber-400">Fercho</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone-200">
          Cortes y barba con estilo, en un ambiente cómodo y con atención personalizada.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/reservas"
            className="inline-flex items-center justify-center rounded-md bg-amber-400 px-5 py-2 font-medium text-stone-900 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:transition-colors"
          >
            Reservar cita
          </Link>
          <Link href="/login" className={BOTON_HERO}>
            Iniciar sesión
          </Link>
          <Link href="/clientes" className={BOTON_HERO}>
            Clientes
          </Link>
          <a
            href="#servicios"
            className="rounded px-2 py-2 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver servicios
          </a>
        </div>
      </div>
    </section>
  );
}
