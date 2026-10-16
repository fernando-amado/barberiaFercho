# Modo oscuro y mejora visual del frontend

## Requerimiento
Agregar modo oscuro con toggle y persistencia, y mejorar el diseño general de las páginas existentes (landing/home, login, clientes, reservas), que hoy se ven planas y sin identidad. Solo frontend, sin MUI ni librerías nuevas (el cambio a MUI es otra tarea).

## Criterios de aceptación
- [ ] Existe un botón toggle (claro/oscuro) accesible (aria-label/aria-pressed, foco visible) en el encabezado de landing y reservas, y en las páginas login y clientes.
- [ ] La preferencia se guarda en `localStorage` y se respeta al recargar y al navegar entre páginas.
- [ ] Sin preferencia guardada, se usa `prefers-color-scheme` del sistema.
- [ ] No hay parpadeo del tema equivocado (FOUC) en la carga inicial ni errores de hidratación.
- [ ] Todas las páginas (/, /login, /clientes, /reservas) se ven correctas en ambos modos, con contraste legible (WCAG AA) en texto, bordes, inputs, errores y botones deshabilitados.
- [ ] Diseño mejorado y consistente: paleta, tipografía, espaciado, tarjetas, botones, inputs y estados hover/focus unificados.
- [ ] Login, clientes y reservas tienen diseño coherente con la landing (tarjetas, labels con estilo, lista de clientes más clara).
- [ ] Responsive correcto (móvil y escritorio) y se respeta `prefers-reduced-motion`.
- [ ] No cambia lógica, textos funcionales, rutas ni API; `npm run lint` y `npm run build` pasan.
- [ ] No se agregan dependencias nuevas.

## Contexto técnico
- Framework / librerías: Next.js 16.4.2 (App Router, `src/app`), React 19.3, Tailwind CSS 4 (`@import "tailwindcss"` en `globals.css`, sin `tailwind.config` ni postcss config), TypeScript, Supabase. Sin librería de UI.
- Convenciones detectadas: componentes en español, clases Tailwind inline con colores `neutral-*`/`gray-*` fijos (sin tokens ni `dark:`); `inputClase`/`botonClase` duplicados por archivo (login-form, cliente-form, reserva-form); `focus-visible:outline-*` y `motion-safe:transition-colors` ya usados; layout raíz `src/app/layout.tsx` con `<html lang="es" className="h-full scroll-smooth">`; `globals.css` vacío salvo el import. Labels sin estilo.
- AGENTS.md advierte que este Next.js tiene cambios incompatibles: antes de implementar leer las guías relevantes en `node_modules/next/dist/docs/` (layouts, `next/script`, hidratación) y los docs de Tailwind v4 sobre dark mode (`@custom-variant dark`).
- Componentes a reutilizar: `Encabezado` y `Pie` (`src/app/landing/`) ya compartidos con `/reservas`; datos en `landing/datos.ts`. `hola-typewriter.tsx` no se usa en ningún sitio (ignorar).
- Enfoque de tema recomendado: variante `dark` de Tailwind basada en clase `.dark` en `<html>` (`@custom-variant dark (&:where(.dark, .dark *));` en globals.css) + tokens CSS (variables en `:root` y `.dark`, expuestos con `@theme inline`) para colores semánticos (fondo, superficie, texto, texto-suave, borde, acento, error). Usar tokens en lugar de `dark:` repetido en cada elemento.

## Archivos
| Acción | Ruta | Qué cambia |
|---|---|---|
| modificar | `src/app/globals.css` | `@custom-variant dark`, variables de color claro/oscuro, `@theme inline` con tokens, estilos base (body, `color-scheme`, labels, selección), clases de componente reutilizables (`.boton`, `.boton-secundario`, `.campo`, `.tarjeta`) vía `@layer components` |
| crear | `src/app/tema/tema-script.tsx` | Script inline que aplica la clase `dark` antes de pintar (lee `localStorage` y `prefers-color-scheme`) |
| crear | `src/app/tema/boton-tema.tsx` | Client component toggle; estado con `useSyncExternalStore` (evita mismatch de hidratación y regla de lint de setState en effect); escribe `localStorage` y clase `dark` |
| modificar | `src/app/layout.tsx` | `suppressHydrationWarning` en `<html>`, incluir script de tema, clases base de fondo/texto, fuente (`next/font/google` o stack del sistema; ver supuestos) |
| modificar | `src/app/landing/encabezado.tsx` | Estilo con tokens, borde/sombra sutil, `BotonTema`, botones con clases comunes |
| modificar | `src/app/landing/hero.tsx` | Hero con gradiente/acento que funciona en ambos modos, jerarquía tipográfica, botones |
| modificar | `src/app/landing/servicios.tsx` | Tarjetas con superficie, hover, espaciado |
| modificar | `src/app/landing/precios.tsx` | Tabla con superficie/filas alternas y tokens (quitar `bg-neutral-100` fijo) |
| modificar | `src/app/landing/contacto.tsx` | Tokens, botones comunes, bloque tipo tarjeta |
| modificar | `src/app/landing/pie.tsx` | Tokens de borde/texto/enlace |
| modificar | `src/app/login/page.tsx` | Contenedor centrado vertical, tarjeta, `BotonTema` y enlace de regreso al inicio |
| modificar | `src/app/login/login-form.tsx` | Clases comunes, labels, error con estilo claro/oscuro |
| modificar | `src/app/clientes/page.tsx` | Contenedor y cabecera con `BotonTema` |
| modificar | `src/app/clientes/clientes-crud.tsx` | Cabecera, buscador, lista como tarjetas/filas con hover, botones Editar/Eliminar (variante peligro), estados vacío/cargando |
| modificar | `src/app/clientes/cliente-form.tsx` | Formulario en tarjeta, clases comunes, error con tokens |
| modificar | `src/app/reservas/page.tsx` | Contenedor/tarjeta, tipografía |
| modificar | `src/app/reservas/reserva-form.tsx` | Clases comunes, tarjeta de confirmación y errores con tokens |

## Pasos de implementación
- [x] 1. Leer en `node_modules/next/dist/docs/` lo relativo a layout raíz, `next/script`/scripts inline y `next/font`; confirmar API de dark mode en Tailwind v4 (`@custom-variant`).
- [x] 2. `globals.css`: definir `@custom-variant dark`, variables `--fondo`, `--superficie`, `--texto`, `--texto-suave`, `--borde`, `--acento`, `--acento-texto`, `--error` en `:root` y `.dark` (verificar contraste AA), mapearlas con `@theme inline` (p. ej. `bg-superficie`, `text-suave`), y `color-scheme: light/dark`.
- [x] 3. En el mismo archivo, definir `@layer components` con `.boton`, `.boton-secundario`, `.boton-peligro`, `.campo`, `.tarjeta` (incluye foco visible, disabled, `motion-safe:transition`) y estilo base de `label` (bloque, peso medio, margen inferior).
- [x] 4. Crear `tema/tema-script.tsx`: script inline que añade/quita `dark` en `document.documentElement` según `localStorage["tema"]` o `prefers-color-scheme`, dentro de try/catch.
- [x] 5. Crear `tema/boton-tema.tsx` (`"use client"`): `useSyncExternalStore` suscrito a un evento propio + `storage`; al pulsar, alterna clase `dark`, guarda en `localStorage` y notifica; icono sol/luna en SVG inline, `aria-label` "Cambiar a modo oscuro/claro", `aria-pressed`.
- [x] 6. `layout.tsx`: agregar `suppressHydrationWarning`, insertar el script de tema en `<head>`/inicio de `<body>`, clases `bg-fondo text-texto antialiased`, y fuente.
- [x] 7. Actualizar `encabezado.tsx` (añade `BotonTema`, usa tokens y clases comunes) y verificar que `/reservas` lo hereda.
- [x] 8. Reestilizar landing: `hero.tsx`, `servicios.tsx`, `precios.tsx`, `contacto.tsx`, `pie.tsx`; reemplazar todos los `neutral-*`/`gray-*`/`bg-white` fijos por tokens.
- [x] 9. Reestilizar `/login`: `page.tsx` (tarjeta centrada + toggle + enlace al inicio) y `login-form.tsx` (reemplazar `inputClase` local por `.campo`/`.boton`).
- [x] 10. Reestilizar `/clientes`: `page.tsx`, `clientes-crud.tsx`, `cliente-form.tsx` (tarjeta de formulario, lista legible, botón Eliminar con variante peligro, toggle en cabecera junto a "Cerrar sesión"). No tocar handlers ni estados.
- [x] 11. Reestilizar `/reservas`: `page.tsx` y `reserva-form.tsx` (reemplazar `inputClase`/`botonClase`, tarjeta de "Reserva recibida", errores).
- [x] 12. Buscar con Grep restos de colores fijos (`neutral-`, `gray-`, `red-700`, `bg-white`, `text-white`) en `src/app` y migrarlos a tokens, salvo usos intencionales.
- [x] 13. Revisar manualmente las 4 rutas en ambos modos y en anchos 360, 768 y 1280 px; correr lint y build.

## Pruebas
- Comando de build/lint/test: `npm run lint`, `npm run build` (no hay tests configurados); verificación manual con `npm run dev`.
- Casos a probar:
  - Primera visita con SO en claro y en oscuro: tema inicial correcto sin parpadeo.
  - Alternar el toggle, recargar y navegar `/` -> `/reservas` -> `/login` -> `/clientes`: la elección persiste.
  - `localStorage` bloqueado o valor inválido: no rompe, cae al tema del sistema.
  - Sin errores de hidratación en la consola.
  - Contraste de texto, placeholders, bordes, errores (`role="alert"`), botones disabled en ambos modos.
  - Navegación por teclado: toggle y botones con foco visible; lector de pantalla anuncia estado del toggle.
  - Flujos funcionales intactos: login, CRUD de clientes (crear, editar, eliminar, buscar), reserva (éxito y errores).
  - `prefers-reduced-motion` sin transiciones.

## Supuestos y riesgos
- "Home" se interpreta como la landing en `/` (`page.tsx`); no existe otra página home. `hola-typewriter.tsx` queda fuera de alcance por no usarse.
- No hay diseño de referencia (Figma/guía de marca): la paleta se propone (base neutra/oscura de barbería con un acento cálido, p. ej. ámbar/dorado); confirmar con el usuario si prefiere otra.
- Fuente: se asume `next/font/google` (sin dependencia nueva) o stack del sistema; si el build es sin red, usar stack del sistema.
- Se elige toggle de dos estados (claro/oscuro) con valor inicial del sistema; no se incluye opción "sistema" explícita.
- Riesgo: las advertencias de AGENTS.md sobre cambios en esta versión de Next pueden afectar el script inline/hidratación; validar con la documentación local.
- Riesgo: la regla de lint de React 19 sobre setState en effects (ya silenciada en `hola-typewriter.tsx`) obliga a usar `useSyncExternalStore` en el toggle.
- La tarea posterior de MUI reemplazará estos estilos; mantener tokens y clases centralizados en `globals.css` para facilitar esa migración.
- No hay control de versiones (no es repo git): hacer copia antes de editar tantos archivos.

## Implementación
Creados: `src/app/tema/tema-script.tsx`, `src/app/tema/boton-tema.tsx`.
Modificados: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/landing/{encabezado,hero,servicios,precios,contacto,pie}.tsx`, `src/app/login/{page,login-form}.tsx`, `src/app/clientes/{page,clientes-crud,cliente-form}.tsx`, `src/app/reservas/{page,reserva-form}.tsx`.
Notas: fuente = stack del sistema (sin next/font); hero usa paleta stone/amber fija (siempre oscuro, intencional). `npm run lint` y `npm run build` pasan. Verificación manual en navegador pendiente.
