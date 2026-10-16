# Validación: Modo oscuro y mejora visual del frontend

**Puntuación:** 8/10
**Veredicto:** APROBADO (probado: lint y build; verificación en navegador no realizada)

## Criterios de aceptación
| Criterio | Estado | Evidencia (archivo:línea) |
|---|---|---|
| Toggle accesible en landing, reservas, login y clientes | Cumple | boton-tema.tsx:55-61 (aria-pressed, aria-label, focus-visible); encabezado.tsx:31 (landing y /reservas); login/page.tsx:18; clientes-crud.tsx:132 |
| Persistencia en localStorage entre recargas y páginas | Cumple (por código) | boton-tema.tsx:48-53; tema-script.tsx:1 |
| Sin preferencia usa prefers-color-scheme | Cumple | tema-script.tsx:1; boton-tema.tsx:17-19 |
| Sin FOUC ni errores de hidratación | Cumple (por código, sin prueba en navegador) | layout.tsx:13-16 (script en head, suppressHydrationWarning); boton-tema.tsx:32-36 (useSyncExternalStore) |
| Todas las páginas en ambos modos con contraste AA | Cumple (por revisión de paleta, no medido en navegador) | globals.css:3-37 (acento #b45309 sobre blanco, texto-suave, error y peligro claros en modo oscuro) |
| Diseño consistente con tokens y clases comunes | Cumple | globals.css:41-118 (.boton, .campo, .tarjeta, .mensaje-error) |
| Login, clientes y reservas coherentes con landing | Cumple | login/page.tsx:21-23; reservas/page.tsx:17-19; clientes-crud.tsx:178-182 |
| Responsive y prefers-reduced-motion | Cumple | motion-safe:transition-colors en globals.css y boton-tema.tsx:61; flex-wrap en encabezado.tsx:9 y clientes-crud.tsx:129 |
| Sin cambios de lógica; lint y build pasan | Cumple | `npm run lint` y `npm run build` sin errores |
| Sin dependencias nuevas | Cumple | package.json:11-18 |

## Hallazgos
- [Baja] boton-tema.tsx:33 — `leerServidor` devuelve siempre false, por lo que en modo oscuro el icono puede mostrar la luna un instante antes de la hidratación. Corrección: dibujar ambos iconos y ocultarlos con `dark:hidden` / `hidden dark:block`.
- [Baja] hero.tsx:4,11 — colores stone/amber/white fijos. Es intencional (hero siempre oscuro) y está documentado en la planificación. Sin acción.
- [Baja] Planificación paso 13 — la revisión manual en navegador (4 rutas, 2 modos, 3 anchos) sigue pendiente según la propia nota de implementación. Esta validación tampoco la ejecutó.
- [Baja] globals.css — no se midió el contraste con una herramienta. La revisión de los valores sugiere que cumple AA.

## Pruebas
| Prueba | Comando / caso | Resultado |
|---|---|---|
| Lint | `npm run lint` | OK, sin errores |
| Build | `npm run build` | OK, 10 páginas estáticas generadas (/, /login, /clientes, /reservas) |
| Tests | No hay tests configurados | N/A |
| Restos de colores fijos | grep `neutral-\|gray-\|red-700\|bg-white\|text-white\|dark:` en src/app | Solo en hero.tsx (intencional) |
| Casos manuales en navegador (FOUC, persistencia, localStorage bloqueado, teclado, flujos CRUD) | No ejecutados | Pendiente. localStorage bloqueado y valor inválido están cubiertos por try/catch (tema-script.tsx:1, boton-tema.tsx:9-13) |
