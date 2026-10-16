// TODO: confirmar con el negocio. Todos los datos son placeholders.

export type Servicio = { nombre: string; descripcion: string };
export type Precio = { servicio: string; valor: number; nota?: string };
export type Contacto = {
  direccion: string;
  telefono: string;
  telefonoHref: string;
  horario: string;
  whatsappHref: string;
};

export const NAV = [
  { href: "/#servicios", etiqueta: "Servicios" },
  { href: "/#precios", etiqueta: "Precios" },
  { href: "/#contacto", etiqueta: "Contacto" },
] as const;

export const SERVICIOS: Servicio[] = [
  { nombre: "Corte clásico", descripcion: "Corte a tijera o máquina, acabado limpio y a tu medida." },
  { nombre: "Barba", descripcion: "Perfilado y arreglo de barba con toalla caliente." },
  { nombre: "Corte + barba", descripcion: "El combo completo para salir impecable." },
  { nombre: "Cejas", descripcion: "Perfilado de cejas con navaja." },
  { nombre: "Corte infantil", descripcion: "Cortes para los más pequeños, con paciencia y estilo." },
];

export const PRECIOS: Precio[] = [
  { servicio: "Corte clásico", valor: 25000 },
  { servicio: "Barba", valor: 18000 },
  { servicio: "Corte + barba", valor: 38000, nota: "Ahorras en el combo" },
  { servicio: "Cejas", valor: 8000 },
  { servicio: "Corte infantil", valor: 20000 },
];

export const CONTACTO: Contacto = {
  direccion: "Calle 00 # 00-00, Ciudad (dirección de ejemplo)",
  telefono: "+57 300 000 0000 (ejemplo)",
  telefonoHref: "tel:+573000000000",
  horario: "Lunes a sábado, 9:00 a.m. a 7:00 p.m. (ejemplo)",
  whatsappHref: "https://wa.me/573000000000",
};
