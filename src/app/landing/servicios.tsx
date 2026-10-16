import { SERVICIOS } from "./datos";

export default function Servicios() {
  return (
    <section id="servicios" aria-labelledby="titulo-servicios">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 id="titulo-servicios" className="text-3xl font-bold tracking-tight">
          Servicios
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s) => (
            <li key={s.nombre} className="rounded-xl border border-borde bg-superficie p-5 shadow-sm hover:border-acento hover:shadow-md motion-safe:transition">
              <h3 className="text-lg font-semibold">{s.nombre}</h3>
              <p className="mt-2 text-suave">{s.descripcion}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
