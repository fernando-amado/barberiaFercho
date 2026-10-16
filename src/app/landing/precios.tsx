import { PRECIOS } from "./datos";

const formato = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function Precios() {
  return (
    <section id="precios" aria-labelledby="titulo-precios" className="bg-superficie-alt">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 id="titulo-precios" className="text-3xl font-bold tracking-tight">
          Precios
        </h2>
        <div className="mt-6 max-w-xl overflow-x-auto rounded-xl border border-borde bg-superficie">
          <table className="w-full text-left">
            <caption className="sr-only">Lista de precios por servicio</caption>
            <thead>
              <tr className="border-b border-campo bg-superficie-alt">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Servicio
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody>
              {PRECIOS.map((p) => (
                <tr key={p.servicio} className="border-b border-borde last:border-b-0 even:bg-superficie-alt/50">
                  <th scope="row" className="px-4 py-3 font-normal">
                    {p.servicio}
                    {p.nota ? <span className="block text-sm text-suave">{p.nota}</span> : null}
                  </th>
                  <td className="px-4 py-3 text-right font-medium">{formato.format(p.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
