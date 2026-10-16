import Link from "next/link";
import { CONTACTO } from "./datos";

export default function Contacto() {
  return (
    <section id="contacto" aria-labelledby="titulo-contacto">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 id="titulo-contacto" className="text-3xl font-semibold">
          Contacto
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="font-semibold">Dirección</dt>
            <dd className="text-neutral-700">{CONTACTO.direccion}</dd>
          </div>
          <div>
            <dt className="font-semibold">Horario</dt>
            <dd className="text-neutral-700">{CONTACTO.horario}</dd>
          </div>
          <div>
            <dt className="font-semibold">Teléfono</dt>
            <dd>
              <a
                href={CONTACTO.telefonoHref}
                className="text-neutral-900 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                {CONTACTO.telefono}
              </a>
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={CONTACTO.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-neutral-900 px-5 py-2 font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors"
          >
            Escribir por WhatsApp
          </a>
          <Link
            href="/reservas"
            className="rounded bg-neutral-900 px-5 py-2 font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors"
          >
            Reservar cita
          </Link>
          <Link
            href="/login"
            className="rounded border border-neutral-900 px-5 py-2 font-medium hover:bg-neutral-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
