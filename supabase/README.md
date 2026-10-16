# Supabase - barberiaFercho

Proyecto remoto: `ydqlcqubyjwygtcathaa` (https://ydqlcqubyjwygtcathaa.supabase.co).

## Estado actual
Migracion `20261016120000_crear_tabla_clientes.sql` escrita (tabla `public.clientes` con RLS). NO aplicada al remoto: pendiente de `db push` con aprobacion del usuario.

## Pasos
1. `npx supabase login`
2. `npx supabase link --project-ref ydqlcqubyjwygtcathaa`
3. `npx supabase db push` (solo cuando existan migraciones y con aprobacion del usuario)

Las migraciones se nombran `<AAAAMMDDHHMMSS>_<descripcion>.sql` (`npx supabase migration new <nombre>`).

## Seguridad
Nunca commitear llaves (anon, service role, tokens). Van en `.env.local`, que esta ignorado por git. La service role key jamas lleva prefijo `NEXT_PUBLIC_`.
