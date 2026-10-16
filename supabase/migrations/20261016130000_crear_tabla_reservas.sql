-- Crea public.reservas (reservas de la landing) con checks, indices, trigger de
-- updated_at y RLS: anon solo puede insertar (estado pendiente); el resto es
-- exclusivo del staff autenticado. Reutiliza public.set_updated_at().

create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  servicio text not null,
  fecha date not null,
  hora time not null,
  estado text not null default 'pendiente',
  notas text,
  cliente_id uuid references public.clientes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservas_nombre_check
    check (char_length(btrim(nombre)) between 1 and 120),
  constraint reservas_telefono_check
    check (char_length(telefono) between 7 and 20),
  constraint reservas_servicio_check
    check (servicio in ('Corte clásico', 'Barba', 'Corte + barba', 'Cejas', 'Corte infantil')),
  constraint reservas_hora_check
    check (hora between time '09:00' and time '18:30'),
  constraint reservas_estado_check
    check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')),
  constraint reservas_notas_check
    check (notas is null or char_length(notas) <= 500)
);

comment on table public.reservas is 'Reservas de la barberia (creadas por anonimos desde la landing, gestionadas por staff).';

-- Una sola reserva activa por slot; cancelada/completada libera el cupo.
create unique index if not exists reservas_slot_activo_unico_idx
  on public.reservas (fecha, hora) where estado in ('pendiente', 'confirmada');

-- Soporta el listado ordenado por fecha y hora.
create index if not exists reservas_fecha_hora_idx
  on public.reservas (fecha, hora);

create index if not exists reservas_estado_idx
  on public.reservas (estado);

create index if not exists reservas_cliente_id_idx
  on public.reservas (cliente_id);

drop trigger if exists reservas_set_updated_at on public.reservas;
create trigger reservas_set_updated_at
  before update on public.reservas
  for each row execute function public.set_updated_at();

alter table public.reservas enable row level security;

-- Grants explicitos: anon solo inserta; authenticated gestiona.
grant insert on public.reservas to anon;
grant select, insert, update, delete on public.reservas to authenticated;

drop policy if exists reservas_select_authenticated on public.reservas;
create policy reservas_select_authenticated on public.reservas
  for select to authenticated using (true);

drop policy if exists reservas_insert_authenticated on public.reservas;
create policy reservas_insert_authenticated on public.reservas
  for insert to authenticated with check (true);

drop policy if exists reservas_insert_anon on public.reservas;
create policy reservas_insert_anon on public.reservas
  for insert to anon with check (estado = 'pendiente' and cliente_id is null);

drop policy if exists reservas_update_authenticated on public.reservas;
create policy reservas_update_authenticated on public.reservas
  for update to authenticated using (true) with check (true);

drop policy if exists reservas_delete_authenticated on public.reservas;
create policy reservas_delete_authenticated on public.reservas
  for delete to authenticated using (true);
