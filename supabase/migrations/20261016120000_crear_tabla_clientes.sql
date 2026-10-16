-- Crea public.clientes (CRUD de clientes de la barberia) con checks, indices,
-- trigger de updated_at y RLS: solo el rol authenticated (staff) tiene acceso.

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text,
  telefono text,
  detalle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clientes_nombre_check
    check (char_length(btrim(nombre)) between 1 and 120),
  constraint clientes_correo_check
    check (correo is null or (char_length(correo) <= 254 and correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  constraint clientes_telefono_check
    check (telefono is null or char_length(telefono) between 7 and 20),
  constraint clientes_detalle_check
    check (detalle is null or char_length(detalle) <= 2000)
);

comment on table public.clientes is 'Clientes de la barberia (datos personales, solo staff autenticado).';

-- Correo unico sin distinguir mayusculas, solo cuando existe.
create unique index if not exists clientes_correo_unico_idx
  on public.clientes (lower(correo)) where correo is not null;

-- Soporta el ordenamiento del listado por nombre.
create index if not exists clientes_nombre_idx
  on public.clientes (lower(nombre));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

drop policy if exists clientes_select_authenticated on public.clientes;
create policy clientes_select_authenticated on public.clientes
  for select to authenticated using (true);

drop policy if exists clientes_insert_authenticated on public.clientes;
create policy clientes_insert_authenticated on public.clientes
  for insert to authenticated with check (true);

drop policy if exists clientes_update_authenticated on public.clientes;
create policy clientes_update_authenticated on public.clientes
  for update to authenticated using (true) with check (true);

drop policy if exists clientes_delete_authenticated on public.clientes;
create policy clientes_delete_authenticated on public.clientes
  for delete to authenticated using (true);
