# Backend de horarios de atencion (tabla + API)

## Requerimiento
Crear una tabla nueva en Supabase para los horarios de atencion de la barberia (dias de la semana y horas de apertura/cierre) y su API REST en `src/app/api/horarios`, siguiendo los patrones de `clientes` y `reservas` (`src/lib/<recurso>/` + route handlers). Hoy el horario esta hardcodeado (lun-sab 09:00-19:00) en `src/lib/reservas/validacion.ts` y `horario.ts`.

## Criterios de aceptacion
- [ ] Existe `public.horarios_atencion` con un registro por dia de la semana (0-6), hora de apertura y cierre, y bandera de cerrado.
- [ ] Anonimo y staff pueden leer (`GET /api/horarios`); la landing podra mostrar el horario sin sesion.
- [ ] Solo staff autenticado puede crear, actualizar y eliminar (401 sin sesion; RLS bloquea escrituras anon).
- [ ] No se puede registrar dos veces el mismo dia (409) ni abre >= cierra (400).
- [ ] La migracion deja datos iniciales: lun-sab 09:00-19:00 y domingo cerrado.
- [ ] Respuestas con formato `{ data }` / `{ error, details? }`, mensajes en espanol.
- [ ] `npm run build` y `npm run lint` pasan; la migracion aplica con `supabase db reset`.

## Contexto tecnico
- Next.js 16.4.2 (AGENTS.md: leer `node_modules/next/dist/docs/` sobre Route Handlers antes de codificar; `params: Promise<...>`, `src/proxy.ts` en vez de middleware). `@supabase/supabase-js` ^2.118, `@supabase/ssr` ^0.12.7. Clientes: `src/lib/supabase/server.ts` (`createClient()` async). No se necesita `admin.ts`.
- Convenciones (ver `src/lib/reservas/*` y `src/app/api/reservas/*`): `validacion.ts` (tipos, `COLUMNAS_*`, `parseCrear*`, `parseActualizar*`, rechazo de claves desconocidas, errores en `errors[]`), `respuestas.ts` (reexporta `ok/fallo/noAutenticado` de clientes; `noEncontrado`; `errorDeBd` 23505->409, 23514->400, 23503->400), `servicio.ts` (cliente fetch con `ApiError` importado de clientes), `route.ts` + `[id]/route.ts`, `.overrideTypes<T, { merge: false }>()`, `auth.getUser()` -> 401 en cada handler.
- Migracion: `supabase/migrations/20261016130000_crear_tabla_reservas.sql` como modelo (idempotente `if not exists`, constraints nombrados, trigger con `public.set_updated_at()` ya definida en `20261016120000_crear_tabla_clientes.sql`, grants explicitos, politicas `drop policy if exists` + `create policy`).
- Reutilizar: `esUuid`, `ResultadoParse` (de `@/lib/clientes/validacion`), `HORA_REGEX` (duplicar localmente; en reservas no se exporta), `fallo/ok/noAutenticado`.
- Convencion de dia: 0 = domingo ... 6 = sabado (igual que `getUTCDay()` usado en reservas).

## Modelo de datos (para backend-migraciones)
Archivo nuevo: `supabase/migrations/20261016140000_crear_tabla_horarios_atencion.sql` (timestamp posterior a 20261016130000).

| Tabla | Columna | Tipo | Restricciones |
|---|---|---|---|
| horarios_atencion | id | uuid | PK, default gen_random_uuid() |
| horarios_atencion | dia_semana | smallint | NOT NULL, UNIQUE, CHECK between 0 and 6 (0=domingo) |
| horarios_atencion | cerrado | boolean | NOT NULL default false |
| horarios_atencion | hora_apertura | time | NULL; NOT NULL si cerrado = false |
| horarios_atencion | hora_cierre | time | NULL; NOT NULL si cerrado = false |
| horarios_atencion | created_at | timestamptz | NOT NULL default now() |
| horarios_atencion | updated_at | timestamptz | NOT NULL default now() |

- CHECK `horarios_atencion_horas_check`: `(cerrado and hora_apertura is null and hora_cierre is null) or (not cerrado and hora_apertura is not null and hora_cierre is not null and hora_apertura < hora_cierre)`.
- Indices: la UNIQUE de `dia_semana` ya crea el indice (nombrar `horarios_atencion_dia_semana_key`); no hacen falta mas (tabla de max 7 filas).
- RLS (enable):
  - select: `anon` y `authenticated` using (true) (horario publico).
  - insert / update / delete: solo `authenticated` (using/with check true).
- Grants: `grant select on ... to anon`; `grant select, insert, update, delete on ... to authenticated`.
- Triggers/funciones: trigger `horarios_atencion_set_updated_at` before update con `public.set_updated_at()` (NO redefinir).
- Seed (en la misma migracion, idempotente con `on conflict (dia_semana) do nothing`): dias 1-6 abierto 09:00-19:00; dia 0 cerrado=true sin horas.

## Endpoints (para backend-logica-negocio)
| Metodo | Ruta | Entrada | Respuesta OK | Errores |
|---|---|---|---|---|
| GET | `/api/horarios` | sin parametros | 200 `{ data: Horario[] }` orden `dia_semana` asc | 500 |
| POST | `/api/horarios` | body: dia_semana, cerrado?, hora_apertura?, hora_cierre? | 201 `{ data: Horario }` | 400 JSON/datos invalidos; 401; 409 dia ya registrado |
| GET | `/api/horarios/[id]` | id UUID | 200 `{ data: Horario }` | 400 id; 404 |
| PATCH | `/api/horarios/[id]` | parcial: cerrado, hora_apertura, hora_cierre (dia_semana no editable) | 200 `{ data: Horario }` | 400; 401; 404 |
| DELETE | `/api/horarios/[id]` | - | 200 `{ data: { id } }` | 400; 401; 404 |

- Reglas de negocio:
  - Un solo registro por dia (UNIQUE -> 409 "Ya existe un horario para ese día" via `errorDeBd`, mensaje propio del recurso).
  - `cerrado = true` => horas deben ser null (el parser las normaliza a null si vienen vacias y rechaza si vienen con valor); `cerrado = false` => ambas horas obligatorias y `apertura < cierre`.
  - Horas en formato `HH:MM`, sin segundos; se devuelven como las entrega Postgres (`HH:MM:SS`); decidir normalizar a `HH:MM` en la respuesta (ver supuesto 4).
  - PATCH: como la regla cruza campos, tras el parse el handler (o el CHECK de BD, 23514 -> 400) valida el estado final; recomendado: leer fila actual, mezclar con parcial y validar el resultado completo antes de actualizar.
- Validaciones de entrada (`src/lib/horarios/validacion.ts`): `dia_semana` entero 0-6; `cerrado` booleano estricto; horas string `HH:MM` valida (regex `^([01]\d|2[0-3]):([0-5]\d)$`); rechazo de claves desconocidas (`Campo no permitido: x`); PATCH requiere al menos un campo; `dia_semana` en PATCH -> clave no permitida.
- Autenticacion / autorizacion: GET lista y GET por id publicos (`createClient()` sin exigir sesion; RLS permite select a anon). POST/PATCH/DELETE: `createClient()` + `auth.getUser()` -> `noAutenticado()` antes de tocar la BD (validar body primero, luego auth, como en reservas).

## Archivos
| Accion | Ruta | Que cambia | Agente |
|---|---|---|---|
| crear | `supabase/migrations/20261016140000_crear_tabla_horarios_atencion.sql` | Tabla, checks, trigger, RLS, grants, seed | backend-migraciones |
| crear | `src/lib/horarios/validacion.ts` | Tipos `Horario`, `DatosHorario`, `DIAS_SEMANA` (nombres), `COLUMNAS_HORARIO`, `parseCrearHorario`, `parseActualizarHorario`, reexporta `esUuid` | backend-logica-negocio |
| crear | `src/lib/horarios/respuestas.ts` | Reexporta `ok/fallo/noAutenticado`; `noEncontrado` ("Horario no encontrado"); `errorDeBd` (23505 -> 409 "Ya existe un horario para ese día") | backend-logica-negocio |
| crear | `src/lib/horarios/servicio.ts` | Cliente fetch: `listarHorarios`, `obtenerHorario`, `crearHorario`, `actualizarHorario`, `eliminarHorario` (`ApiError` de clientes) | backend-logica-negocio |
| crear | `src/app/api/horarios/route.ts` | GET (publico), POST (auth) | backend-logica-negocio |
| crear | `src/app/api/horarios/[id]/route.ts` | GET (publico), PATCH, DELETE (auth) | backend-logica-negocio |

## Pasos de implementacion
### Migraciones
1. [x] (backend-migraciones) Crear `supabase/migrations/20261016140000_crear_tabla_horarios_atencion.sql` con la tabla, constraints nombrados (`_dia_semana_check`, `_horas_check`) e `if not exists`.
2. [x] Agregar trigger `horarios_atencion_set_updated_at` con `public.set_updated_at()` existente.
3. [x] Habilitar RLS, grants y politicas (select anon+authenticated; insert/update/delete authenticated), con `drop policy if exists` previo.
4. [x] Insertar seed lun-sab 09:00-19:00 y domingo cerrado con `on conflict (dia_semana) do nothing`.
5. [ ] Verificar con `supabase db reset` y `supabase db lint` (pendiente: Supabase CLI no disponible en el entorno).
### Logica de negocio
1. [x] (backend-logica-negocio) Leer guia de Route Handlers en `node_modules/next/dist/docs/` (Next 16).
2. [x] Crear `src/lib/horarios/validacion.ts` con tipos y parsers segun Validaciones de entrada.
3. [x] Crear `src/lib/horarios/respuestas.ts` y `servicio.ts` reutilizando `src/lib/clientes`.
4. [x] Crear `src/app/api/horarios/route.ts`: GET ordenado por `dia_semana`; POST con auth, parse -> insert `.select(COLUMNAS_HORARIO)` -> 201.
5. [x] Crear `src/app/api/horarios/[id]/route.ts` con GET/PATCH/DELETE copiando el patron de `reservas/[id]/route.ts`; en PATCH validar el estado final combinado (leer fila actual, mezclar, revalidar apertura/cierre/cerrado).
6. [x] Entregar contrato al frontend: tipo `Horario`, `DIAS_SEMANA`, mensajes `details`.

## Pruebas
- Comandos: `npm run build`, `npm run lint`, `supabase db reset`, `supabase db lint`.
- GET lista: sin sesion 200 con 7 filas del seed ordenadas; GET por id: 200 / id no UUID 400 / inexistente 404.
- POST: sin sesion 401; con sesion 201; dia_semana fuera de 0-6, no entero, apertura >= cierre, hora mal formada, cerrado=false sin horas, cerrado=true con horas, clave desconocida, JSON malformado -> 400; dia duplicado -> 409.
- PATCH: sin sesion 401; cambio valido 200; cerrar un dia (cerrado=true, horas null) 200; apertura posterior al cierre actual -> 400; body vacio -> 400; `dia_semana` en body -> 400; inexistente 404.
- DELETE: 401 / 200 / 400 id / 404.
- RLS con anon key directo a PostgREST: select permitido; insert/update/delete denegados.

## Supuestos y riesgos
1. Un unico tramo por dia (sin pausa de almuerzo ni turnos partidos). Si se necesitan varios tramos, cambiar UNIQUE a `(dia_semana, hora_apertura)` con control de solapamiento (fuera de alcance).
2. Un solo local/barbero; sin excepciones por fecha (festivos, vacaciones). Alcance: horario semanal recurrente.
3. Convencion 0=domingo..6=sabado, alineada con `getUTCDay()`; zona horaria del negocio America/Bogota (las horas son hora local, tipo `time` sin zona).
4. Postgres devuelve `time` como `HH:MM:SS`; el frontend/reservas usa `HH:MM`. Definir si el API normaliza a `HH:MM` (recomendado) para evitar inconsistencias.
5. La integracion con reservas NO se incluye: `src/lib/reservas/validacion.ts`, `horario.ts` y el CHECK `reservas_hora_check` seguiran con el horario hardcodeado. Cambiar horarios en esta tabla no afectara la validacion de reservas hasta una tarea posterior (leer la tabla desde `validarFecha/validarHora`, y retirar el CHECK fijo de `reservas`).
6. GET publico: se asume que mostrar el horario es informacion publica (landing). Si debe ser solo staff, quitar `anon` del select.
7. Se incluye POST/DELETE por consistencia con el patron CRUD; con seed de 7 dias podrian omitirse si el negocio solo edita (PATCH).
8. Supabase CLI puede no estar disponible en el entorno (ocurrio con reservas); verificacion de migracion puede quedar pendiente.

## Implementación - Migraciones
- Creado `supabase/migrations/20261016140000_crear_tabla_horarios_atencion.sql` (tabla, constraints `horarios_atencion_dia_semana_key/_dia_semana_check/_horas_check`, trigger `horarios_atencion_set_updated_at`, RLS, grants, politicas y seed).
- Horas: la BD usa `time` nativo; se devuelven como `HH:MM:SS` (decision del solicitante, sin normalizar a `HH:MM`).
- Validacion con la CLI: no ejecutada (Supabase CLI no instalada).

## Implementación - Lógica de negocio
- Creados `src/lib/horarios/validacion.ts` (tipos, `DIAS_SEMANA`, `COLUMNAS_HORARIO`, `parseCrearHorario`, `parseActualizarHorario`, `combinarHorario`, `normalizarHorario`), `src/lib/horarios/respuestas.ts`, `src/lib/horarios/servicio.ts`.
- Creados `src/app/api/horarios/route.ts` (GET público, POST auth) y `src/app/api/horarios/[id]/route.ts` (GET público, PATCH y DELETE auth).
- Horas normalizadas a `HH:MM` en todas las respuestas (`normalizarHorario`), según supuesto 4 (la nota de migraciones decía HH:MM:SS; prevalece la instrucción posterior de normalizar).
- PATCH lee la fila actual, mezcla con el parcial y valida el estado final antes de actualizar; cerrar un día sin enviar horas las limpia a null.
- `npm run build` y `npm run lint` pasan.
