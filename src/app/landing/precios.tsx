import { PRECIOS } from "./datos";

const formato = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function Precios() {
  return (
    <section id="precios" aria-labelledby="titulo-precios" className="bg-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 id="titulo-precios" className="text-3xl font-semibold">
          Precios
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full max-w-xl text-left">
            <caption className="sr-only">Lista de precios por servicio</caption>
            <thead>
              <tr className="border-b border-neutral-400">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Servicio
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody>
              {PRECIOS.map((p) => (
                <tr key={p.servicio} className="border-b border-neutral-300">
                  <th scope="row" className="py-2 pr-4 font-normal">
                    {p.servicio}
                    {p.nota ? <span className="block text-sm text-neutral-700">{p.nota}</span> : null}
                  </th>
                  <td className="py-2 text-right font-medium">{formato.format(p.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
