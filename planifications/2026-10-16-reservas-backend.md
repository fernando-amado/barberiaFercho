# Backend de reservas (tabla + API) para el form de reservas

## Requerimiento
El frontend de reservas necesita persistir datos. No existe tabla ni endpoint. Se pide el backend minimo: tabla `public.reservas` (nombre, telefono, servicio, fecha, hora, estado, notas) y API en `src/app/api/reservas`, siguiendo el patron de `src/app/api/clientes` y `src/lib/clientes`.

## Criterios de aceptacion
- [ ] Un visitante anonimo puede crear una reserva via `POST /api/reservas` (el form es publico en la landing).
- [ ] La reserva se crea siempre con estado `pendiente`; el anonimo no puede fijar estado.
- [ ] Staff autenticado puede listar, ver, actualizar (incl. estado) y eliminar reservas.
- [ ] Anonimo no puede leer, listar, actualizar ni eliminar reservas (RLS + 401).
- [ ] No se aceptan fechas pasadas ni horas fuera del horario ni doble reserva del mismo slot (fecha+hora) activa.
- [ ] Respuestas con el mismo formato `{ data }` / `{ error, details? }` que clientes.
- [ ] `npm run build` y `npm run lint` pasan; migracion aplica con `supabase db reset`.

## Contexto tecnico
- Next.js 16.4.2 (AGENTS.md avisa de cambios: leer `node_modules/next/dist/docs/` sobre Route Handlers antes de codificar; ya se usa `params: Promise<...>` y `src/proxy.ts` en lugar de middleware). React 19.3, `@supabase/supabase-js` ^2.118, `@supabase/ssr` ^0.12.7.
- Clientes Supabase: `src/lib/supabase/server.ts` (`createClient()` async, cookies/sesion), `src/lib/supabase/admin.ts` (`createAdminClient()`, service role, `server-only`), `client.ts`, `env.ts`.
- Convenciones: carpeta `src/lib/<recurso>/` con `validacion.ts` (tipos, `COLUMNAS_*`, `parseCrear*`, `parseActualizar*`, `parseListado`, `esUuid`), `respuestas.ts` (`ok`, `fallo`, `noAutenticado`, `noEncontrado`, `errorDeBd` con 23505->409, 23514->400), `servicio.ts` (cliente fetch para frontend, `ApiError`). Rutas: `route.ts` (GET lista, POST) y `[id]/route.ts` (GET, PATCH, DELETE). Texto de errores en espanol. `overrideTypes<T, { merge: false }>()`.
- Migracion previa: `supabase/migrations/20261016120000_crear_tabla_clientes.sql` define `public.set_updated_at()` (reutilizar, NO redefinir) y RLS solo `authenticated`.
- `src/proxy.ts` solo protege paginas `/clientes`; `/api/*` no se redirige, cada handler valida con `auth.getUser()`.
- Servicios disponibles (landing): `src/app/landing/datos.ts` (SERVICIOS: Corte clasico, Barba, Corte + barba, Cejas, Corte infantil). Horario placeholder: lun-sab 9:00-19:00.

## Modelo de datos (para backend-migraciones)
Archivo nuevo: `supabase/migrations/<timestamp>_crear_tabla_reservas.sql` (timestamp posterior a 20261016120000).

| Tabla | Columna | Tipo | Restricciones |
|---|---|---|---|
| reservas | id | uuid | PK, default gen_random_uuid() |
| reservas | nombre | text | NOT NULL, CHECK btrim length 1..120 |
| reservas | telefono | text | NOT NULL, CHECK length 7..20 |
| reservas | servicio | text | NOT NULL, CHECK en lista cerrada: 'Corte clásico','Barba','Corte + barba','Cejas','Corte infantil' (ver supuesto 3) |
| reservas | fecha | date | NOT NULL |
| reservas | hora | time | NOT NULL, CHECK entre 09:00 y 18:30 (ver supuesto 4) |
| reservas | estado | text | NOT NULL default 'pendiente', CHECK in ('pendiente','confirmada','cancelada','completada') |
| reservas | notas | text | NULL, CHECK length <= 500 |
| reservas | cliente_id | uuid | NULL, FK -> clientes(id) ON DELETE SET NULL (opcional, uso futuro por staff; no lo envia el form publico) |
| reservas | created_at | timestamptz | NOT NULL default now() |
| reservas | updated_at | timestamptz | NOT NULL default now() |

- Indices: UNIQUE parcial `(fecha, hora) where estado in ('pendiente','confirmada')` (evita doble reserva; devuelve 23505 -> 409); indice `(fecha, hora)` para listado; indice `(estado)` opcional.
- RLS (enable): 
  - select: solo `authenticated` using (true). Anon sin select.
  - insert: `authenticated` with check (true); `anon` with check (estado = 'pendiente' and cliente_id is null).
  - update: solo `authenticated` using/with check (true).
  - delete: solo `authenticated` using (true).
- Triggers/funciones: trigger `reservas_set_updated_at` before update usando `public.set_updated_at()` existente. Grants: confirmar que `anon` tiene INSERT en la tabla (si no, `grant insert on public.reservas to anon`).
- Nota: un insert anonimo con `.select()` falla porque anon no tiene select; ver Endpoints (POST usa insert sin retorno de fila o admin client).

## Endpoints (para backend-logica-negocio)
| Metodo | Ruta | Entrada | Respuesta OK | Errores |
|---|---|---|---|---|
| POST | `/api/reservas` | body JSON: nombre, telefono, servicio, fecha (YYYY-MM-DD), hora (HH:MM), notas? | 201 `{ data: { id, nombre, servicio, fecha, hora, estado } }` | 400 JSON invalido / datos invalidos (details); 409 horario ya reservado; 500 |
| GET | `/api/reservas` | query: estado?, desde?, hasta? (fechas), limit (1-100, def 50), offset | 200 `{ data: Reserva[] }` orden fecha, hora asc | 400 parametros; 401 |
| GET | `/api/reservas/[id]` | id UUID | 200 `{ data: Reserva }` | 400 id; 401; 404 |
| PATCH | `/api/reservas/[id]` | parcial: nombre, telefono, servicio, fecha, hora, estado, notas | 200 `{ data: Reserva }` | 400; 401; 404; 409 |
| DELETE | `/api/reservas/[id]` | - | 200 `{ data: { id } }` | 400; 401; 404 |

Opcional (recomendado, bajo costo): `GET /api/reservas/disponibilidad?fecha=YYYY-MM-DD` publico, devuelve horas ocupadas `{ data: { fecha, ocupadas: string[] } }` para que el form deshabilite slots. Requiere admin client o funcion SQL `security definer` que solo devuelva horas (sin datos personales). Decidir con el frontend; si no se hace, el 409 del POST basta.

- Reglas de negocio:
  - POST publico fuerza `estado = 'pendiente'`; rechaza cualquier campo `estado`/`cliente_id` en el body (clave desconocida -> 400, como en clientes).
  - Fecha no anterior a hoy (zona horaria del negocio, ver supuesto 5) y no mas de 60 dias hacia adelante; hora dentro del horario y en bloques de 30 min; domingo cerrado (supuesto 4).
  - Cupo por slot: una sola reserva activa (pendiente/confirmada) por fecha+hora; cancelada/completada libera el slot.
  - Transiciones de estado solo por staff (PATCH autenticado).
- Validaciones de entrada (en `src/lib/reservas/validacion.ts`): nombre 1-120 trim; telefono 7-20 con `/^[0-9\s+\-()]+$/` (reusar la regla de clientes); servicio en lista cerrada; fecha formato ISO valido y real; hora `HH:MM` valida; notas <=500; estado en enum; trim y vacio->null en notas; rechazo de claves desconocidas. `parseListado` con regex de enteros como en clientes; `estado`/`desde`/`hasta` validados.
- Autenticacion / autorizacion: POST sin sesion (anon). Para devolver el recurso creado sin dar select a anon, usar `createAdminClient()` solo en POST tras validar (alternativa: insert con cliente server sin `.select()` y responder con los datos validados + 201). Preferir la alternativa sin service role (menor privilegio) si basta con no devolver `id`; si el frontend necesita `id`, usar admin. Resto de endpoints: `createClient()` + `auth.getUser()` -> 401 como en clientes.
- Anti-abuso (minimo): limite de longitud ya en CHECKs; evaluar honeypot en el body descartado y rate limit simple (supuesto 6).

## Archivos
| Accion | Ruta | Que cambia | Agente |
|---|---|---|---|
| crear | `supabase/migrations/<ts>_crear_tabla_reservas.sql` | Tabla, checks, indices, trigger, RLS, grants | backend-migraciones |
| crear | `src/lib/reservas/validacion.ts` | Tipos `Reserva`, `DatosReserva`, `COLUMNAS_RESERVA`, `SERVICIOS_VALIDOS`, parsers crear/actualizar/listado, `esUuid` (importar de clientes o duplicar) | backend-logica-negocio |
| crear | `src/lib/reservas/respuestas.ts` | `ok`, `fallo`, `noEncontrado` ("Reserva no encontrada"), `errorDeBd` (23505 -> 409 "Horario no disponible") ; reutilizar `ok/fallo/noAutenticado` de clientes importandolos | backend-logica-negocio |
| crear | `src/lib/reservas/servicio.ts` | Cliente fetch para el frontend: `crearReserva`, `listarReservas`, `obtenerReserva`, `actualizarReserva`, `eliminarReserva` (con `ApiError`; importar de clientes en vez de duplicar) | backend-logica-negocio |
| crear | `src/app/api/reservas/route.ts` | GET (auth) y POST (publico) | backend-logica-negocio |
| crear | `src/app/api/reservas/[id]/route.ts` | GET, PATCH, DELETE (auth) | backend-logica-negocio |
| crear (opcional) | `src/app/api/reservas/disponibilidad/route.ts` | Horas ocupadas por fecha | backend-logica-negocio |

## Pasos de implementacion
### Migraciones
- [x] 1. (backend-migraciones) Crear `supabase/migrations/<ts>_crear_tabla_reservas.sql` con la tabla y CHECKs de la seccion Modelo, idempotente (`if not exists`) como la de clientes.
- [x] 2. Crear indice unico parcial `(fecha, hora) where estado in ('pendiente','confirmada')` e indice `(fecha, hora)`.
- [x] 3. Crear trigger `reservas_set_updated_at` con `public.set_updated_at()` ya existente.
- [x] 4. Habilitar RLS y crear politicas (select/update/delete authenticated; insert authenticated y anon restringido a estado pendiente); verificar grants de `anon`.
5. Verificar con `supabase db reset` y `supabase db lint`.
### Logica de negocio
- [x] 1. (backend-logica-negocio) Leer guia de Route Handlers en `node_modules/next/dist/docs/` por cambios de Next 16.
- [x] 2. Crear `src/lib/reservas/validacion.ts` con parsers (ver Validaciones); constantes de servicios alineadas con `src/app/landing/datos.ts` (idealmente importar nombres de ahi para una sola fuente).
- [x] 3. Crear `src/lib/reservas/respuestas.ts` y `servicio.ts` reutilizando lo de `src/lib/clientes` donde sea generico.
- [x] 4. Crear `src/app/api/reservas/route.ts`: POST publico (parse -> insert con estado fijo -> 201 / mapear 23505 a 409), GET autenticado con filtros y paginado.
- [x] 5. Crear `src/app/api/reservas/[id]/route.ts` con GET/PATCH/DELETE copiando el patron de `[id]/route.ts` de clientes.
6. (Opcional) endpoint de disponibilidad.
- [x] 7. Entregar al frontend el contrato: tipo `Reserva`, lista de servicios, horas permitidas y mensajes de error (`details`).

## Pruebas
- Comandos: `npm run build`, `npm run lint`, `supabase db reset`, `supabase db lint`.
- POST: exito 201 sin sesion; estado siempre pendiente; body con `estado` -> 400; campos faltantes/telefono invalido/servicio fuera de lista/fecha pasada/hora fuera de horario/notas >500 -> 400; JSON malformado -> 400; mismo slot dos veces -> 409; slot de reserva cancelada reutilizable.
- GET lista/detalle, PATCH, DELETE: sin sesion -> 401; con sesion -> 200; id no UUID -> 400; id inexistente -> 404; PATCH a slot ocupado -> 409; PATCH estado valido/invalido.
- RLS (con anon key directo a PostgREST): select/update/delete denegados; insert con estado distinto de pendiente denegado.

## Supuestos y riesgos
1. El form es publico (landing), por eso POST no exige sesion; el resto es solo staff. Si se exige login, simplificar a patron identico a clientes.
2. No se vincula con `clientes` desde el form; `cliente_id` es opcional para staff.
3. Servicios como lista cerrada en CHECK: cambiar servicios exige migracion. Alternativa: tabla `servicios` (fuera de alcance minimo).
4. Horario placeholder lun-sab 9:00-19:00, slots de 30 min, ultimo inicio 18:30 (datos.ts marca todo como ejemplo); confirmar con el negocio. Sin duracion por servicio ni multiples barberos: un solo cupo por slot.
5. Zona horaria del negocio asumida America/Bogota (telefono +57); la validacion "no pasado" debe usar esa zona, no UTC del servidor.
6. Riesgo de spam en endpoint publico: sin rate limit nativo; se propone honeypot/limites y revisar captcha o rate limit en proxy mas adelante.
7. El correo no se pide (no esta en el requerimiento); no se envian confirmaciones.
8. Riesgo: AGENTS.md indica que Next 16 difiere; verificar convenciones antes de escribir handlers.

## Implementación - Migraciones
- `supabase/migrations/20261016130000_crear_tabla_reservas.sql`: tabla, checks, indices (unico parcial de slot activo, fecha+hora, estado, cliente_id), trigger updated_at, RLS, grants y politicas.
- Paso 5 (db reset / db lint) pendiente: Supabase CLI no disponible en el entorno.

## Implementación - Lógica de negocio
- `src/lib/reservas/validacion.ts`: tipos, constantes, parsers crear/actualizar/listado (servicios importados de `src/app/landing/datos.ts`; reutiliza `esUuid` de clientes).
- `src/lib/reservas/respuestas.ts`: reexporta `ok/fallo/noAutenticado`, `noEncontrado`, `errorDeBd` (23505 -> 409 "Horario no disponible").
- `src/lib/reservas/servicio.ts`: cliente fetch para el frontend.
- `src/app/api/reservas/route.ts`: GET (auth) y POST (publico).
- `src/app/api/reservas/[id]/route.ts`: GET, PATCH, DELETE (auth).
- POST sin service role: el `id` se genera con `crypto.randomUUID()` y se inserta sin `.select()`.
- Paso 6 (disponibilidad, opcional) no implementado.
- `npm run build` y `npm run lint` pasan.
