# Frontend: formulario público de reservas

## Requerimiento
Crear una página pública `/reservas` con un formulario para reservar cita en la barbería (nombre, teléfono, servicio, fecha, hora, notas) que consuma `POST /api/reservas` mediante `crearReserva` de `src/lib/reservas/servicio.ts`, y enlazarla desde la landing. Backend ya aprobado (ver `planifications/2026-10-16-reservas-backend.md`).

## Criterios de aceptación
- [ ] `/reservas` es accesible sin sesión y tiene metadata (title "Reservar cita").
- [ ] El form tiene campos: nombre (obligatorio, máx 120), teléfono (obligatorio, 7-20, tipo tel), servicio (select con SERVICIOS de la landing), fecha (input date), hora (select de bloques de 30 min 09:00-18:30), notas (opcional, máx 500).
- [ ] La fecha no permite pasado ni más de 60 días (atributos min/max, calculados en America/Bogota) y se rechaza domingo con mensaje claro antes de enviar.
- [ ] Al enviar con éxito (201) se muestra confirmación con servicio, fecha y hora, indicando que la reserva queda pendiente de confirmación, y el form se limpia o se ofrece "Hacer otra reserva".
- [ ] 400 muestra `details` del backend; 409 muestra "Ese horario ya no está disponible, elige otro"; otros errores, mensaje genérico. Los datos escritos no se pierden en error.
- [ ] Botón deshabilitado y sin envíos dobles mientras `enviando`.
- [ ] Accesible: labels asociados, `role="alert"` para errores, foco visible, confirmación con `role="status"`.
- [ ] Enlace visible a `/reservas` desde la landing (hero y encabezado; opcional contacto).
- [ ] `npm run build` y `npm run lint` pasan.

## Contexto técnico
- Framework / librerías: Next.js 16.4.2 (AGENTS.md: leer `node_modules/next/dist/docs/` antes de codificar; hay `src/proxy.ts`, no middleware), React 19.3, Tailwind (clases utilitarias, paleta neutral en landing, gray en clientes). Sin librerías de formularios ni de UI.
- Convenciones detectadas:
  - Patrón de página: `page.tsx` server con `metadata` + componente `"use client"` hermano (`clientes/page.tsx` -> `clientes-crud.tsx`, `cliente-form.tsx`).
  - Form de `cliente-form.tsx`: estado `useState` con objeto de valores, `onSubmit` con `FormEvent`, `enviando`, `errores: string[]`, `inputClase`/`botonClase` constantes, labels con `htmlFor`, errores en `<div role="alert" className="text-red-700">`.
  - `clientes-crud.tsx`: función `mensajesDe(e)` que mapea `ApiError` por status (400 -> details, 409, 404, default); se imita para reservas.
  - Landing: componentes por sección en `src/app/landing/`, datos en `datos.ts`, `Link` de next, botones `rounded bg-neutral-900 ... focus-visible:outline-2 ... motion-safe:transition-colors`, contenedor `mx-auto max-w-5xl px-6`, textos en español.
  - `proxy.ts` solo protege `/clientes`; `/reservas` queda público sin tocar nada.
- Componentes/lógica a reutilizar:
  - `crearReserva`, `ApiError`, tipo `ReservaCreada` de `@/lib/reservas/servicio`.
  - `SERVICIOS` de `@/app/landing/datos` (opciones del select; también `PRECIOS` si se quiere mostrar el precio junto al servicio, opcional).
  - Constantes `HORA_MINIMA`, `HORA_MAXIMA`, `DIAS_MAXIMOS_ADELANTE` de `@/lib/reservas/validacion` (importación segura en cliente: solo importa `landing/datos` y `clientes/validacion`; verificar en build que `clientes/validacion` no arrastre código de servidor).
  - `Encabezado`, `Pie` de landing para mantener identidad visual en la página pública.

## Archivos
| Acción | Ruta | Qué cambia |
|---|---|---|
| crear | `src/lib/reservas/horario.ts` | Helpers puros de UI: `HORAS_DISPONIBLES` (generadas de 09:00 a 18:30 cada 30 min), `fechaHoyBogota()`, `fechaMaxima()` (hoy + 60 días), `esDomingo(fecha)`. Sin dependencias de servidor. |
| crear | `src/app/reservas/page.tsx` | Server component: `metadata = { title: "Reservar cita" }`, renderiza `Encabezado`, `<main>` con título y `ReservaForm`, `Pie`. |
| crear | `src/app/reservas/reserva-form.tsx` | Client component con el form, validación previa ligera, envío, estados de éxito/error. |
| modificar | `src/app/landing/hero.tsx` | Añadir botón/enlace "Reservar cita" (`Link href="/reservas"`) como CTA principal junto a los existentes. |
| modificar | `src/app/landing/encabezado.tsx` | Añadir `Link` "Reservar" a `/reservas` en la nav (estilo de "Iniciar sesión" o enlace simple). |
| modificar (opcional) | `src/app/landing/contacto.tsx` | Añadir tercer botón "Reservar cita" a `/reservas`. |

## Pasos de implementación
- [x] 1. Leer la guía de Next 16 en `node_modules/next/dist/docs/` sobre pages/metadata y Client Components; confirmar que el patrón `page.tsx` + componente cliente sigue vigente.
- [x] 2. Crear `src/lib/reservas/horario.ts`: exportar `HORAS_DISPONIBLES: string[]` generada con bucle desde `HORA_MINIMA` hasta `HORA_MAXIMA` (paso 30 min); `fechaHoyBogota()` usando `Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" })` (misma técnica que `hoyEnNegocio` del backend); `fechaMaxima()` sumando `DIAS_MAXIMOS_ADELANTE` días; `esDomingo(fecha: string)` vía `Date.UTC(...).getUTCDay() === 0`.
- [x] 3. Crear `src/app/reservas/reserva-form.tsx` (`"use client"`): estado `valores` {nombre, telefono, servicio, fecha, hora, notas}, `enviando`, `errores: string[]`, `creada: ReservaCreada | null`. Reutilizar `inputClase`/`botonClase` del estilo de clientes (copiar constantes, no importarlas: no están exportadas).
- [x] 4. En el form: `<select>` servicio con opción inicial vacía "Selecciona un servicio" y `SERVICIOS.map`; `<input type="date" min max>` con `fechaHoyBogota()`/`fechaMaxima()` calculados una vez al montar (evitar mismatch de hidratación: calcular dentro de `useState`/`useEffect` o marcar el input con valores calculados solo en cliente); `<select>` hora con `HORAS_DISPONIBLES`; `<textarea maxLength={500}>` notas; todos con `required` salvo notas; `maxLength` en nombre (120) y teléfono (20).
- [x] 5. Validación previa en `enviar`: si `esDomingo(valores.fecha)` poner error "La barbería está cerrada los domingos" y no llamar a la API; el resto lo valida el backend (fuente de verdad). `e.preventDefault()`, `if (enviando) return`.
- [x] 6. Envío: `setEnviando(true)`, llamar `crearReserva({ ...valores })` (omitir `notas` si vacío o enviar string vacío; el backend lo normaliza a null), en éxito `setCreada(resultado)` y limpiar valores; en `finally` `setEnviando(false)`.
- [x] 7. Función `mensajesDe(e)` local: `ApiError` 400 -> `e.details?.length ? e.details : [e.message]`; 409 -> "Ese horario ya no está disponible, elige otro"; resto -> "Ocurrió un error, intenta de nuevo". Mostrar en `<div role="alert" className="text-red-700">` igual que `cliente-form.tsx`.
- [x] 8. Vista de éxito: si `creada`, mostrar bloque `role="status"` con "Reserva recibida", servicio, fecha y hora (formatear fecha legible en es-CO), aviso "Te contactaremos para confirmarla" y botón "Hacer otra reserva" que resetea `creada`. Usar `datos.ts` `CONTACTO.telefono` como alternativa opcional.
- [x] 9. Crear `src/app/reservas/page.tsx` con metadata, `Encabezado`, `<main className="mx-auto max-w-xl px-6 py-12">` con `<h1>` "Reserva tu cita", párrafo con horario (`CONTACTO.horario`) y `ReservaForm`, y `Pie`. Nota: los anchors del `Encabezado` (`#servicios`, etc.) apuntan a la landing; ver riesgo 3.
- [x] 10. Modificar `src/app/landing/hero.tsx`: añadir `Link href="/reservas"` "Reservar cita" con el estilo del botón primario blanco (`bg-white text-neutral-900`) como primera acción; el resto sin cambios.
- [x] 11. Modificar `src/app/landing/encabezado.tsx`: añadir `Link href="/reservas"` "Reservar" en la nav, con estilo de enlace/botón consistente.
- [x] 12. (Opcional) Añadir botón en `src/app/landing/contacto.tsx` hacia `/reservas`.
- [x] 13. Ejecutar `npm run lint` y `npm run build`; probar manualmente (ver Pruebas).

## Pruebas
- Comandos: `npm run lint`, `npm run build`, `npm run dev` para prueba manual (requiere Supabase local con la migración aplicada).
- Casos a probar:
  - Envío válido sin sesión -> confirmación; reserva aparece `pendiente` en BD.
  - Mismo fecha+hora otra vez -> mensaje 409 y datos conservados.
  - Elegir domingo -> error local, sin petición de red.
  - Teléfono inválido (letras) o corto -> se muestran `details` del 400.
  - Fecha pasada / >60 días: el input lo impide por min/max; forzar vía devtools -> el backend responde 400 y se muestra.
  - Notas >500 impedido por maxLength.
  - Doble clic en enviar -> una sola petición.
  - Navegación por teclado, labels leídos, foco visible; sin warnings de hidratación en consola.
  - Enlaces de hero/encabezado llevan a `/reservas`; la página funciona sin sesión y en móvil (layout de una columna).

## Supuestos y riesgos
1. Se asume que no hay endpoint de disponibilidad (paso 6 del backend no implementado): las horas no se deshabilitan; el conflicto se resuelve con el 409. Si se implementa después, filtrar `HORAS_DISPONIBLES` por fecha.
2. Horario lun-sáb 9:00-18:30 (placeholder); `datos.ts` dice "9:00 a 7:00 p.m." coherente con último inicio 18:30. Cambios de horario requieren tocar backend y `horario.ts`.
3. Los anchors del `Encabezado` (`#servicios`, `#precios`, `#contacto`, `#inicio`) no funcionan desde `/reservas` al ser relativos; decisión: aceptar el riesgo, o cambiar a `/#servicios` (afecta `datos.ts` NAV y el logo `href="#inicio"`) o usar en `/reservas` un encabezado simple con enlace a `/`. Se recomienda cambiar a `/#...` en `NAV` y logo `/`.
4. Zona horaria: `min`/`max` de fecha usan America/Bogota; el navegador del usuario puede estar en otra zona, por eso el backend sigue siendo la validación definitiva.
5. Hidratación: calcular fecha mínima/máxima en servidor y cliente puede diferir en el borde de medianoche; calcularla solo en cliente.
6. No se pide correo; no hay confirmación por email (consistente con backend).
7. Spam: el backend no expone honeypot (rechaza claves desconocidas con 400), por lo que no se añade campo honeypot en el form; si se agrega, debe coordinarse con el backend.
8. Estilo: la landing usa `neutral-*` y clientes `gray-*`; se usa `neutral-*` y bordes redondeados de la landing por ser página pública.
9. AGENTS.md indica diferencias de Next 16; verificar docs antes de codificar.

## Implementación
- Creados: `src/lib/reservas/horario.ts`, `src/app/reservas/page.tsx`, `src/app/reservas/reserva-form.tsx`.
- Modificados: `src/app/landing/hero.tsx` (CTA "Reservar cita"; "Iniciar sesión" pasa a estilo outline), `src/app/landing/encabezado.tsx` (enlace "Reservar", logo a `/` con `Link`), `src/app/landing/contacto.tsx` (botón opcional), `src/app/landing/datos.ts` (NAV a `/#...`, riesgo 3).
- Límites min/max de fecha calculados solo en cliente con `useSyncExternalStore` (snapshot de servidor vacío).
- `npm run lint` y `npm run build` pasan. Prueba manual no ejecutada.
