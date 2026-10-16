# Adopción de MUI (Material UI) en Barbería Fercho

## Requerimiento
Instalar y configurar MUI en la app (Next.js App Router) de forma compatible con el tema claro/oscuro existente (clase `.dark` en `<html>`) y con Tailwind v4, y migrar de forma razonable las pantallas/componentes actuales (landing, login, clientes, reservas, botón de tema) a componentes MUI sin romper funcionalidad ni accesibilidad.

## Criterios de aceptación
- [ ] `@mui/material`, `@emotion/react`, `@emotion/styled` y `@mui/material-nextjs` instalados y `npm run build` y `npm run lint` pasan.
- [ ] Layout raíz con `AppRouterCacheProvider` + `ThemeProvider` (tema MUI propio con paleta equivalente a las variables CSS actuales); sin errores de hidratación ni FOUC de estilos.
- [ ] El tema claro/oscuro sigue funcionando: se respeta `localStorage["tema"]`, `prefers-color-scheme` y el script anti-parpadeo; MUI cambia de esquema al alternar la clase `.dark`.
- [ ] Tailwind y MUI conviven: las utilidades de Tailwind pueden sobreescribir estilos de MUI (orden de capas CSS correcto).
- [ ] Formularios (login, cliente, reserva), búsqueda, lista de clientes, tabla de precios, encabezado, hero, servicios, contacto y pie usan componentes MUI.
- [ ] Funcionalidad intacta: validaciones `required`/`maxLength`, autocomplete, `role="alert"` en errores, `window.confirm` al eliminar, debounce de búsqueda, límites de fecha, estados "Enviando...", "Cargando...", "No hay clientes".
- [ ] Accesibilidad conservada: labels asociados, foco visible, `aria-pressed` y `aria-label` del botón de tema, `aria-labelledby` en secciones, `prefers-reduced-motion`.
- [ ] Clases utilitarias propias (`.boton`, `.campo`, `.tarjeta`, `.mensaje-error`) eliminadas de `globals.css` cuando ya no tengan uso.

## Contexto técnico
- Framework / librerías: Next.js 16.4.2 (App Router, `cacheComponents: true`, `partialPrefetching: true`, Turbopack con `@tailwindcss/turbopack`), React 19.3, Tailwind 4, TypeScript, Supabase. Sin `postcss.config`. Sin MUI instalado.
- AGENTS.md: esta versión de Next tiene cambios incompatibles; antes de escribir código leer `node_modules/next/dist/docs/01-app/02-guides/css-in-js.md` (sección "Configuring CSS-in-JS in `app`": registro de estilos, componente cliente) y `01-app/01-getting-started/05-server-and-client-components.md`. La doc indica que Emotion/CSS-in-JS exige soporte de la librería para RSC/streaming; seguir la guía oficial de MUI (`@mui/material-nextjs` para App Router) y verificar con la doc vigente de MUI (context7) las APIs de la versión instalada.
- Convenciones detectadas: textos y nombres de archivo/variables en español, archivos en kebab-case, alias `@/`, componentes de UI en `src/app/<ruta>/`; formularios con estado local y `FormEvent`; tema con variables CSS (`--fondo`, `--superficie`, `--superficie-alt`, `--texto`, `--texto-suave`, `--borde`, `--borde-campo`, `--acento`, `--acento-hover`, `--acento-texto`, `--error`, `--error-fondo`, `--peligro`) en `:root` y `.dark`, con `@custom-variant dark`; `TemaScript` (script inline en `<head>`) y `BotonTema` (`useSyncExternalStore` sobre la clase `dark`, evento `tema-cambiado`).
- Componentes a reutilizar: `BotonTema` (mantener su lógica, cambiar solo la presentación), `datos.ts` (NAV, SERVICIOS, PRECIOS, CONTACTO), `Encabezado` y `Pie` (compartidos por `/` y `/reservas`), `@/lib/*` sin cambios.

## Archivos
| Acción | Ruta | Qué cambia |
|---|---|---|
| modificar | `package.json` | Dependencias MUI/Emotion (vía `npm install`). |
| crear | `src/app/tema/tema-mui.ts` | `createTheme({ cssVariables: { colorSchemeSelector: "class" }, colorSchemes: { light, dark } })` con paleta mapeada a los colores actuales (acento ámbar, fondo, superficie, texto, error), `typography.fontFamily` igual a la fuente del sistema, `shape.borderRadius`, overrides de `MuiButton` (`textTransform: "none"`), etc. |
| crear | `src/app/tema/proveedor-tema.tsx` | Componente cliente (`"use client"`) con `ThemeProvider` (`defaultColorScheme` sin `disableTransitionOnChange` problemático; ver pasos) y `CssBaseline` opcional. |
| modificar | `src/app/layout.tsx` | Envolver `children` con `AppRouterCacheProvider options={{ enableCssLayer: true }}` y `ProveedorTema`; mantener `TemaScript`, `suppressHydrationWarning`, clases de `body`. |
| modificar | `src/app/globals.css` | Declarar orden de capas (`@layer theme, base, mui, components, utilities;`) antes de `@import "tailwindcss"` según la guía MUI+Tailwind v4; retirar regla global `label` y las clases `.boton*`, `.campo`, `.tarjeta`, `.mensaje-error` al terminar la migración; conservar variables y `@theme inline` mientras queden usos de Tailwind. |
| modificar | `src/app/tema/boton-tema.tsx` | Reemplazar `<button>` por `IconButton` MUI (mismos `aria-*`, `onClick`) con íconos `@mui/icons-material` (`LightMode`/`DarkMode`) o los SVG actuales dentro de `SvgIcon`; lógica de clase/localStorage intacta. |
| modificar | `src/app/landing/encabezado.tsx` | `AppBar`/`Toolbar` (posición static, `color="inherit"`), `Container maxWidth="md"`, enlaces con `Button`/`Link` MUI con `component={NextLink}` (o `href` en Button), botón "Reservar" `variant="contained"`, "Iniciar sesión" `variant="outlined"`. |
| modificar | `src/app/landing/hero.tsx` | `Box` con degradado, `Typography variant="h1"`, `Button` contained/outlined con colores fijos del hero (independientes del modo). |
| modificar | `src/app/landing/servicios.tsx` | `Card`/`CardContent` en `Grid` (o `Box` con grid), `Typography`; mantener `<ul>/<li>` vía `component`. |
| modificar | `src/app/landing/precios.tsx` | `TableContainer` + `Table`/`TableHead`/`TableBody`/`TableRow`/`TableCell` con `caption` accesible (visualmente oculto) y `scope`. |
| modificar | `src/app/landing/contacto.tsx` | `Card` con lista de definiciones (`Typography component="dt"/"dd"`) y `Button` (WhatsApp con `target="_blank" rel="noopener noreferrer"`). |
| modificar | `src/app/landing/pie.tsx` | `Box component="footer"`, `Link` MUI con `component={NextLink}`. |
| modificar | `src/app/login/page.tsx` | `Container maxWidth="xs"`, `Paper`, enlace "Volver al inicio" MUI. |
| modificar | `src/app/login/login-form.tsx` | `TextField` (correo/contraseña, `required`, `autoComplete`, `disabled`), `Alert severity="error"` con `role="alert"`, `Button fullWidth type="submit"` (considerar `loading` si la versión lo soporta). |
| modificar | `src/app/clientes/page.tsx` | `Container maxWidth="md"` en lugar de clases Tailwind del `main`. |
| modificar | `src/app/clientes/cliente-form.tsx` | `Paper` + `Stack`, `TextField` (multiline `minRows={3}` para detalle, `slotProps.htmlInput` para `maxLength`), `Alert` para errores/aviso, `Button`s. |
| modificar | `src/app/clientes/clientes-crud.tsx` | `Typography`, `TextField type="search"` para buscar, `Alert`, `CircularProgress`/texto "Cargando...", lista con `Paper`/`List` y botones Editar (outlined) / Eliminar (`color="error"`). Mantener `window.confirm` (decisión: no cambiar a `Dialog` en este alcance). |
| modificar | `src/app/reservas/page.tsx` | `Container maxWidth="sm"`, `Typography`, `Paper`. |
| modificar | `src/app/reservas/reserva-form.tsx` | `TextField` con `select` (servicio, hora; usar `slotProps.select.native` para conservar comportamiento nativo y `required`), `TextField type="date"` con `slotProps.inputLabel.shrink` y `htmlInput min/max`, `Alert`, pantalla de éxito con `Alert severity="success"`/`role="status"`. |
| no tocar | `src/app/hola-typewriter.tsx`, `src/lib/**`, `src/proxy.ts`, `src/app/api/**` | Sin cambios (el typewriter no se usa en las pantallas; no es parte del alcance). |

## Pasos de implementación
1. Leer la guía `node_modules/next/dist/docs/01-app/02-guides/css-in-js.md` y confirmar en la doc vigente de MUI (context7) la configuración para Next App Router y Tailwind v4 (capas CSS, `colorSchemeSelector`).
2. Ejecutar `npm install @mui/material @emotion/react @emotion/styled @mui/material-nextjs @mui/icons-material` (verificar compatibilidad de peer deps con React 19.3; si hay conflicto, registrarlo en el resultado y no usar `--force` sin avisar).
3. Crear `src/app/tema/tema-mui.ts`: tema con `cssVariables: { colorSchemeSelector: "class" }` para que MUI lea la clase `.dark` ya gestionada por `TemaScript`/`BotonTema`; definir `colorSchemes.light` y `colorSchemes.dark` con los mismos valores hex de `globals.css` (primary = `--acento`, background.default = `--fondo`, background.paper = `--superficie`, text.primary/secondary, divider = `--borde`, error); tipografía con la pila de fuentes del sistema; `components` con `MuiButton` sin mayúsculas y `MuiTextField` `variant="outlined"` por defecto.
4. Crear `src/app/tema/proveedor-tema.tsx` (client): `ThemeProvider theme={temaMui}` con `defaultMode="system"`; no añadir `InitColorSchemeScript` (el `TemaScript` existente es la fuente de verdad); evitar que MUI escriba su propio `localStorage` (`modeStorageKey`/`colorSchemeStorageKey` distintos o `storageManager={null}`) para que no compita con la clave `tema`.
5. Editar `src/app/layout.tsx`: importar `AppRouterCacheProvider` de `@mui/material-nextjs/v16-appRouter` (confirmar el nombre exacto del subpath instalado según versión) con `enableCssLayer`, y envolver `children`; mantener `<head><TemaScript /></head>`.
6. Editar `src/app/globals.css`: añadir como primera línea `@layer theme, base, mui, components, utilities;`; luego `@import "tailwindcss"` y el resto. Si `CssBaseline` choca con el preflight de Tailwind, no usarlo y dejar que `body` conserve sus estilos actuales.
7. Verificar el cambio de tema: en la landing, alternar con `BotonTema` y confirmar que componentes MUI y Tailwind cambian juntos, sin parpadeo al recargar en modo oscuro (ejecutar `npm run dev`).
8. Migrar `boton-tema.tsx` a `IconButton` conservando `useSyncExternalStore`, `useLayoutEffect`, `aria-pressed`, `aria-label` y evento `tema-cambiado`.
9. Migrar la landing en orden: `encabezado.tsx`, `hero.tsx`, `servicios.tsx`, `precios.tsx`, `contacto.tsx`, `pie.tsx` (ver tabla). Los enlaces internos usan `next/link` vía `component={Link}`; los anclas (`#servicios`) siguen como `href`. Mantener `id` y `aria-labelledby` de cada sección.
10. Migrar login (`page.tsx`, `login-form.tsx`), conservando el flujo `signInWithPassword`, mensajes de error y `router.replace("/clientes")`.
11. Migrar clientes (`page.tsx`, `cliente-form.tsx`, `clientes-crud.tsx`) sin tocar la lógica de estado, debounce, `key` del formulario ni llamadas a `@/lib/clientes/servicio`.
12. Migrar reservas (`page.tsx`, `reserva-form.tsx`) conservando `useLimitesFecha`, validación de domingo y pantalla de éxito.
13. Limpiar `globals.css`: buscar con Grep usos de `boton`, `campo`, `tarjeta`, `mensaje-error`, `text-suave`, `bg-superficie`, etc.; eliminar solo las clases sin uso y la regla global `label`.
14. Ejecutar build/lint y repasar manualmente cada ruta en claro y oscuro.

## Pruebas
- Comando de build/lint/test: `npm run lint`, `npm run build` (no hay suite de tests configurada).
- Casos a probar:
  - `/`, `/login`, `/clientes`, `/reservas` en modo claro y oscuro; recarga con `localStorage.tema` = `dark`, `light` y ausente (con preferencia del SO).
  - Sin errores de hidratación en consola ni advertencias de Emotion; estilos presentes en el HTML inicial (SSR) y orden de capas correcto (utilidades Tailwind ganan sobre MUI).
  - Login: error de credenciales (400) y error genérico; botón deshabilitado mientras envía; redirección a `/clientes`.
  - Clientes: crear, editar (aviso "No hay cambios para guardar"), eliminar con confirmación, búsqueda con debounce, estados cargando/vacío/error 401/409/404, cerrar sesión.
  - Reservas: campos obligatorios, límites de fecha, domingo rechazado, 409 de horario ocupado, pantalla de éxito y "Hacer otra reserva".
  - Teclado y lector de pantalla: foco visible, labels, `role="alert"`; contraste en ambos modos; viewport móvil (encabezado con wrap).

## Supuestos y riesgos
- Supuesto: "migrar de forma razonable" implica reemplazar clases propias de botones, campos, tarjetas y alertas por MUI, pero conservar Tailwind para layout y espaciado donde sea más simple; no se exige eliminar Tailwind.
- Supuesto: se mantiene el mecanismo propio de tema (clase `.dark` + `localStorage["tema"]`) en vez de adoptar `useColorScheme` de MUI, para no romper lo ya validado (ver `planifications/2026-10-16-modo-oscuro-frontend.md`).
- Supuesto: los íconos usan `@mui/icons-material` (agrega peso al bundle; alternativa: conservar los SVG actuales con `SvgIcon`).
- Riesgo: `cacheComponents: true` y `partialPrefetching` con Emotion/CSS-in-JS; si el build falla por acceso a datos dinámicos o por el registro de estilos, ajustar según la doc de Next del proyecto y de `@mui/material-nextjs`.
- Riesgo: compatibilidad de peer dependencies de MUI/Emotion con React 19.3 y Next 16.4.2 (versiones muy recientes); confirmar al instalar.
- Riesgo: conflicto de reset entre el preflight de Tailwind y `CssBaseline`; la regla global `label { @apply mb-1 block ... }` afectaría a labels internos de MUI, por eso se elimina en el paso 13 (o se acota antes si hay pantallas aún sin migrar).
- Riesgo: la regresión de `Hero` (colores fijos oscuros) si se delega al tema; usar colores explícitos.
- Riesgo: `TextField type="date"` y `select` de MUI cambian el comportamiento de los selects nativos y de `required`; usar `native` y probar la validación del navegador.
- Fuera de alcance: cambiar la lógica de negocio, API, Supabase, rutas, ni reemplazar `window.confirm` por `Dialog`.

## Implementación
Pasos 1-6 y 8-13 completados (paso 7 y 14 manuales en navegador no ejecutados; `npm run lint` y `npm run build` pasan).

Archivos creados: `src/app/tema/tema-mui.ts`, `src/app/tema/proveedor-tema.tsx`, `src/app/tema/enlace-next.tsx`.
Archivos modificados: `package.json`, `package-lock.json` (en el directorio padre), `src/app/layout.tsx`, `src/app/globals.css`, `src/app/tema/boton-tema.tsx`, `src/app/landing/{encabezado,hero,servicios,precios,contacto,pie}.tsx`, `src/app/login/{page,login-form}.tsx`, `src/app/clientes/{page,cliente-form,clientes-crud}.tsx`, `src/app/reservas/{page,reserva-form}.tsx`.

Desviaciones:
- Subpath verificado: `@mui/material-nextjs/v16-appRouter` (v9.5.0, MUI 9.5.0).
- `colorSchemeSelector: "html.%s"` en lugar de `"class"`: con `"class"` MUI quita/agrega la clase `dark` en `<html>` y competiría con `TemaScript`/`BotonTema`. Con este selector no escribe clases y aplica las variables dark cuando `<html>` tiene `.dark`. `ThemeProvider` usa `defaultMode="light"` y `storageManager={null}`.
- `enlace-next.tsx`: re-export cliente de `next/link`, necesario porque pasar `component={Link}` desde Server Components falla en build ("Functions cannot be passed directly to Client Components").
- Íconos con `@mui/icons-material`; `CssBaseline` no se usó.
- Se eliminó `@layer components` completo (.boton, .campo, .tarjeta, .mensaje-error) y la regla global `label`.
