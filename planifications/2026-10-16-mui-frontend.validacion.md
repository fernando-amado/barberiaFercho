# Validación: Adopción de MUI en Barbería Fercho

**Puntuación:** 9/10
**Veredicto:** APROBADO (probado)

## Criterios de aceptación
| Criterio | Estado | Evidencia (archivo:línea) |
|---|---|---|
| Dependencias MUI/Emotion instaladas; build y lint pasan | Cumple | package.json (@mui/material, material-nextjs, icons-material, @emotion/*); lint y build OK (ver Pruebas) |
| AppRouterCacheProvider + ThemeProvider con tema propio | Cumple | src/app/layout.tsx:19-21; src/app/tema/tema-mui.ts:8-36; src/app/tema/proveedor-tema.tsx:10 |
| Tema claro/oscuro respeta `localStorage["tema"]`, SO y script anti-parpadeo; MUI sigue `.dark` | Cumple (verificado en HTML prerenderizado; falta prueba manual en navegador) | tema-mui.ts:9 (`html.%s`); layout.tsx:15-17; el HTML generado en `.next/server/app/index.html` contiene `html.dark{` con las variables MUI y `<html class="h-full scroll-smooth">` sin clases añadidas por MUI |
| Tailwind y MUI conviven (capas) | Cumple | src/app/globals.css:1 (`@layer theme, base, mui, components, utilities;`); layout.tsx:19 (`enableCssLayer`); el HTML contiene `@layer mui{...}` |
| Formularios, búsqueda, lista, tabla, encabezado, hero, servicios, contacto y pie en MUI | Cumple | login-form.tsx:42-74; cliente-form.tsx:64-121; clientes-crud.tsx:164-233; precios.tsx:26-59; encabezado.tsx:12-35; hero.tsx; servicios.tsx; contacto.tsx; pie.tsx |
| Funcionalidad intacta (required, maxLength, autocomplete, role=alert, confirm, debounce, límites de fecha, estados) | Cumple | login-form.tsx:50,54,67; cliente-form.tsx:75,102-103; clientes-crud.tsx:56,106,180-183; reserva-form.tsx:53-57,73-76,157,192 |
| Accesibilidad (labels, aria-pressed/aria-label, aria-labelledby, reduced-motion) | Cumple en parte | boton-tema.tsx:61-62; secciones con `aria-labelledby` (servicios.tsx:10, precios.tsx:21, contacto.tsx:13, hero.tsx:19); no hay `prefers-reduced-motion` para `scroll-smooth` (layout.tsx:14); el único uso está en hola-typewriter.tsx:12 |
| Clases `.boton`, `.campo`, `.tarjeta`, `.mensaje-error` y regla `label` eliminadas | Cumple | globals.css:61-76 (solo queda `@layer base` con body, selection y placeholder); Grep sin usos en `src` |

## Evaluación de las desviaciones
- **`colorSchemeSelector: "html.%s"` en lugar de `"class"`: razonable.** El requerimiento pide que `TemaScript` y `BotonTema` sean la fuente de verdad. Con `"class"` MUI gestionaría la clase de `<html>` y competiría con ellos. El HTML generado confirma que las variables oscuras salen bajo `html.dark{` y que MUI no añade clases. Se combina con `storageManager={null}` (proveedor-tema.tsx:10), lo que cumple el paso 4. Queda por confirmar en navegador, sin hidratación ni parpadeo.
- **`tema/enlace-next.tsx`: razonable.** Es un re-export cliente de `next/link` (enlace-next.tsx:1-4). Hace falta porque `component={Link}` desde Server Components falla en build, como documenta la planificación. El cambio es mínimo, está bien comentado y respeta las convenciones de nombres.
- Los íconos usan `@mui/icons-material` y no se usa `CssBaseline`. Ambos casos estaban previstos en la planificación.

## Hallazgos
- [Baja] src/app/layout.tsx:14 — `scroll-smooth` sin `prefers-reduced-motion`. La planificación pedía conservar `prefers-reduced-motion`, y no se encontró ninguna regla CSS que lo haga — añadir `@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}` en globals.css o `motion-safe:scroll-smooth`.
- [Baja] src/app/tema/proveedor-tema.tsx:10 — `defaultMode="light"` hace que, con `.dark` en `<html>`, el modo lo determine solo el selector CSS. No aplica a `useColorScheme` de MUI, que no se usa. Es correcto, pero conviene documentarlo.
- [Baja] Los pasos 7 y 14 (revisión manual en navegador de claro/oscuro, hidratación y FOUC) no se ejecutaron. Los casos funcionales de "Pruebas" no se probaron en navegador.
- [Baja] src/app/landing/precios.tsx:28 — `className="sr-only"` mezcla Tailwind con `Box component="caption"`. Funciona gracias al orden de capas.

## Pruebas
| Prueba | Comando / caso | Resultado |
|---|---|---|
| Lint | `npm run lint` | OK, sin errores ni advertencias |
| Build | `npm run build` | OK, TypeScript y 10 páginas estáticas generadas; rutas `/`, `/login`, `/clientes`, `/reservas` prerenderizadas |
| Tests | no hay suite configurada | N/A |
| SSR de estilos y capas | Inspección de `.next/server/app/index.html` | OK: `@layer mui{` presente y `html.dark{` con variables MUI |
| Casos manuales (tema, login, clientes, reservas, teclado) | Requieren navegador | No ejecutados; revisión estática del código OK |
