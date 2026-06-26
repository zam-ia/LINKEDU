-- DOCE / LINKEDU - Landing conversion leads and analytics events
-- Safe to run more than once.

create table if not exists public.landing_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  cargo text,
  institucion text not null,
  tipo_institucion text,
  alumnos integer,
  celular text,
  correo text not null,
  intereses text[] not null default '{}',
  mensaje text,
  source text not null default 'landing',
  atendido boolean not null default false,
  atendido_por uuid references public.usuarios(id) on delete set null,
  atendido_at timestamptz,
  notas text
);

create table if not exists public.landing_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  path text,
  referrer text,
  payload jsonb not null default '{}'::jsonb,
  user_agent text
);

create index if not exists landing_leads_created_at_idx on public.landing_leads (created_at desc);
create index if not exists landing_leads_correo_idx on public.landing_leads (lower(correo));
create index if not exists landing_leads_atendido_idx on public.landing_leads (atendido, created_at desc);
create index if not exists landing_events_created_at_idx on public.landing_events (created_at desc);
create index if not exists landing_events_event_name_idx on public.landing_events (event_name, created_at desc);

alter table public.landing_leads enable row level security;
alter table public.landing_events enable row level security;

drop policy if exists "Superadmin gestiona landing leads" on public.landing_leads;
create policy "Superadmin gestiona landing leads"
on public.landing_leads
for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

drop policy if exists "Superadmin lee landing events" on public.landing_events;
create policy "Superadmin lee landing events"
on public.landing_events
for select
to authenticated
using (public.is_superadmin());

comment on table public.landing_leads is 'Solicitudes comerciales enviadas desde la landing Doce.';
comment on table public.landing_events is 'Eventos de conversión de landing para optimización comercial.';
