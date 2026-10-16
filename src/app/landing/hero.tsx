import Link from "next/link";

export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="titulo-hero" className="bg-neutral-900 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h1 id="titulo-hero" className="text-4xl font-semibold sm:text-5xl">
          Barbería Fercho
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-200">
          Cortes y barba con estilo, en un ambiente cómodo y con atención personalizada.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/reservas"
            className="rounded bg-white px-5 py-2 font-medium text-neutral-900 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:transition-colors"
          >
            Reservar cita
          </Link>
          <Link
            href="/login"
            className="rounded border border-white px-5 py-2 font-medium hover:bg-white hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/clientes"
            className="rounded border border-white px-5 py-2 font-medium hover:bg-white hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:transition-colors"
          >
            Clientes
          </Link>
          <a
            href="#servicios"
            className="px-2 py-2 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver servicios
          </a>
        </div>
      </div>
    </section>
  );
}
