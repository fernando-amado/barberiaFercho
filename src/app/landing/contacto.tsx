import Link from "next/link";
import { CONTACTO } from "./datos";

export default function Contacto() {
  return (
    <section id="contacto" aria-labelledby="titulo-contacto">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 id="titulo-contacto" className="text-3xl font-bold tracking-tight">
          Contacto
        </h2>
        <dl className="tarjeta mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="font-semibold">Dirección</dt>
            <dd className="text-suave">{CONTACTO.direccion}</dd>
          </div>
          <div>
            <dt className="font-semibold">Horario</dt>
            <dd className="text-suave">{CONTACTO.horario}</dd>
          </div>
          <div>
            <dt className="font-semibold">Teléfono</dt>
            <dd>
              <a
                href={CONTACTO.telefonoHref}
                className="rounded underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
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
            className="boton"
          >
            Escribir por WhatsApp
          </a>
          <Link
            href="/reservas"
            className="boton"
          >
            Reservar cita
          </Link>
          <Link
            href="/login"
            className="boton-secundario"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
