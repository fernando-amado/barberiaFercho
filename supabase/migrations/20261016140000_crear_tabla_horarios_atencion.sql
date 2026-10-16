-- Crea public.horarios_atencion (horario semanal recurrente de la barberia, un
-- registro por dia: 0 = domingo ... 6 = sabado) con checks, trigger de updated_at
-- y RLS: lectura publica (anon y authenticated); escritura solo staff autenticado.
-- Reutiliza public.set_updated_at() y deja datos iniciales (lun-sab 09:00-19:00,
-- domingo cerrado).

create table if not exists public.horarios_atencion (
  id uuid primary key default gen_random_uuid(),
  dia_semana smallint not null,
  cerrado boolean not null default false,
  hora_apertura time,
  hora_cierre time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint horarios_atencion_dia_semana_key unique (dia_semana),
  constraint horarios_atencion_dia_semana_check
    check (dia_semana between 0 and 6),
  constraint horarios_atencion_horas_check
    check (
      (cerrado and hora_apertura is null and hora_cierre is null)
      or (not cerrado and hora_apertura is not null and hora_cierre is not null and hora_apertura < hora_cierre)
    )
);

comment on table public.horarios_atencion is 'Horario semanal de atencion de la barberia (un registro por dia; 0 = domingo). Horas en hora local del negocio.';

drop trigger if exists horarios_atencion_set_updated_at on public.horarios_atencion;
create trigger horarios_atencion_set_updated_at
  before update on public.horarios_atencion
  for each row execute function public.set_updated_at();

alter table public.horarios_atencion enable row level security;

-- Grants explicitos: anon solo lee; authenticated gestiona.
grant select on public.horarios_atencion to anon;
grant select, insert, update, delete on public.horarios_atencion to authenticated;

drop policy if exists horarios_atencion_select_public on public.horarios_atencion;
create policy horarios_atencion_select_public on public.horarios_atencion
  for select to anon, authenticated using (true);

drop policy if exists horarios_atencion_insert_authenticated on public.horarios_atencion;
create policy horarios_atencion_insert_authenticated on public.horarios_atencion
  for insert to authenticated with check (true);

drop policy if exists horarios_atencion_update_authenticated on public.horarios_atencion;
create policy horarios_atencion_update_authenticated on public.horarios_atencion
  for update to authenticated using (true) with check (true);

drop policy if exists horarios_atencion_delete_authenticated on public.horarios_atencion;
create policy horarios_atencion_delete_authenticated on public.horarios_atencion
  for delete to authenticated using (true);

-- Datos iniciales: lunes a sabado 09:00-19:00, domingo cerrado.
insert into public.horarios_atencion (dia_semana, cerrado, hora_apertura, hora_cierre)
values
  (0, true, null, null),
  (1, false, '09:00', '19:00'),
  (2, false, '09:00', '19:00'),
  (3, false, '09:00', '19:00'),
  (4, false, '09:00', '19:00'),
  (5, false, '09:00', '19:00'),
  (6, false, '09:00', '19:00')
on conflict (dia_semana) do nothing;
