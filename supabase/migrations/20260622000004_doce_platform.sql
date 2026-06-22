-- ============================================================================
-- DOCE - Educational operating system foundation
-- Multi-tenant RBAC, LMS, credentials and verifiable documents
-- ============================================================================

create extension if not exists pgcrypto;

-- Tenant commercial and branding configuration --------------------------------
alter table public.colegios add column if not exists razon_social text;
alter table public.colegios add column if not exists tipo_institucion text default 'colegio';
alter table public.colegios add column if not exists slug text;
alter table public.colegios add column if not exists dominio text;
alter table public.colegios add column if not exists color_primario text default '#ff2432';
alter table public.colegios add column if not exists color_secundario text default '#111111';
alter table public.colegios add column if not exists estado text default 'activa';
alter table public.colegios add column if not exists updated_at timestamptz default now();
create unique index if not exists colegios_slug_unique on public.colegios(slug) where slug is not null;

create table if not exists public.planes_suscripcion (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  precio_alumno numeric(10,2),
  limites jsonb not null default '{}'::jsonb,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  plan_id uuid not null references public.planes_suscripcion(id),
  estado text not null default 'prueba' check (estado in ('prueba','activa','vencida','suspendida','cancelada')),
  alumnos_contratados integer not null default 0 check (alumnos_contratados >= 0),
  fecha_inicio date not null default current_date,
  fecha_fin date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modulos_institucion (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  modulo text not null,
  activo boolean not null default true,
  configuracion jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (colegio_id, modulo)
);

-- RBAC -------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid references public.colegios(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  descripcion text,
  es_sistema boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (colegio_id, codigo)
);

create table if not exists public.permisos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  recurso text not null,
  accion text not null,
  nombre text not null,
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists public.rol_permisos (
  rol_id uuid not null references public.roles(id) on delete cascade,
  permiso_id uuid not null references public.permisos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (rol_id, permiso_id)
);

create table if not exists public.usuario_roles (
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  rol_id uuid not null references public.roles(id) on delete cascade,
  asignado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  primary key (usuario_id, rol_id)
);

create table if not exists public.usuario_permisos (
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  permiso_id uuid not null references public.permisos(id) on delete cascade,
  permitido boolean not null default true,
  asignado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  primary key (usuario_id, permiso_id)
);

-- LMS --------------------------------------------------------------------------
create table if not exists public.programas_aprendizaje (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  tipo text not null default 'curso' check (tipo in ('curso','taller','diplomado','programa','evento')),
  codigo text not null,
  nombre text not null,
  descripcion text,
  portada_url text,
  modalidad text not null default 'virtual' check (modalidad in ('virtual','presencial','hibrida')),
  fecha_inicio date,
  fecha_fin date,
  horas_academicas numeric(8,2),
  creditos numeric(8,2),
  estado text not null default 'borrador' check (estado in ('borrador','publicado','en_curso','finalizado','archivado')),
  creado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (colegio_id, codigo)
);

create table if not exists public.modulos_aprendizaje (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references public.programas_aprendizaje(id) on delete cascade,
  titulo text not null,
  descripcion text,
  orden integer not null default 0,
  fecha_liberacion timestamptz,
  estado text not null default 'borrador' check (estado in ('borrador','publicado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lecciones (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references public.modulos_aprendizaje(id) on delete cascade,
  titulo text not null,
  tipo text not null default 'contenido' check (tipo in ('contenido','video','archivo','enlace','clase_vivo','evaluacion','tarea')),
  contenido jsonb not null default '{}'::jsonb,
  orden integer not null default 0,
  duracion_minutos integer,
  obligatoria boolean not null default true,
  estado text not null default 'borrador' check (estado in ('borrador','publicada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matriculas_programa (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  programa_id uuid not null references public.programas_aprendizaje(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  estado text not null default 'activa' check (estado in ('pendiente','activa','completada','retirada','suspendida')),
  progreso numeric(5,2) not null default 0 check (progreso between 0 and 100),
  fecha_matricula timestamptz not null default now(),
  fecha_completado timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programa_id, usuario_id)
);

create table if not exists public.progreso_lecciones (
  id uuid primary key default gen_random_uuid(),
  matricula_id uuid not null references public.matriculas_programa(id) on delete cascade,
  leccion_id uuid not null references public.lecciones(id) on delete cascade,
  estado text not null default 'no_iniciada' check (estado in ('no_iniciada','en_progreso','completada')),
  porcentaje numeric(5,2) not null default 0 check (porcentaje between 0 and 100),
  ultima_posicion integer,
  completado_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (matricula_id, leccion_id)
);

-- Reusable templates and verifiable assets -------------------------------------
create table if not exists public.plantillas_documento (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  tipo text not null check (tipo in ('certificado','diploma','constancia','boletin','reporte')),
  nombre text not null,
  orientacion text not null default 'horizontal' check (orientacion in ('horizontal','vertical')),
  ancho_mm numeric(8,2) not null default 297,
  alto_mm numeric(8,2) not null default 210,
  configuracion jsonb not null default '{"pages":{"front":{"elements":[]}}}'::jsonb,
  version integer not null default 1,
  activa boolean not null default true,
  creado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.documentos_emitidos (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  plantilla_id uuid references public.plantillas_documento(id) on delete set null,
  titular_usuario_id uuid references public.usuarios(id) on delete set null,
  tipo text not null,
  codigo text not null,
  token_verificacion text not null default encode(gen_random_bytes(24), 'hex'),
  datos jsonb not null default '{}'::jsonb,
  archivo_url text,
  estado text not null default 'borrador' check (estado in ('borrador','emitido','anulado','vencido')),
  fecha_emision timestamptz,
  fecha_vencimiento timestamptz,
  emitido_por uuid references public.usuarios(id),
  anulado_por uuid references public.usuarios(id),
  motivo_anulacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (colegio_id, codigo),
  unique (token_verificacion)
);

create table if not exists public.plantillas_credencial (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  nombre text not null,
  tipo text not null default 'alumno' check (tipo in ('alumno','docente','administrativo','ponente','invitado','evento')),
  orientacion text not null default 'vertical' check (orientacion in ('vertical','horizontal')),
  ancho_mm numeric(8,2) not null default 53.98,
  alto_mm numeric(8,2) not null default 85.60,
  configuracion jsonb not null default '{"pages":{"front":{"elements":[]},"back":{"elements":[]}}}'::jsonb,
  activa boolean not null default true,
  creado_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credenciales (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid not null references public.colegios(id) on delete cascade,
  plantilla_id uuid references public.plantillas_credencial(id) on delete set null,
  usuario_id uuid references public.usuarios(id) on delete set null,
  codigo text not null,
  token_verificacion text not null default encode(gen_random_bytes(24), 'hex'),
  rol_impreso text not null,
  datos jsonb not null default '{}'::jsonb,
  estado text not null default 'activa' check (estado in ('activa','vencida','anulada')),
  fecha_emision timestamptz not null default now(),
  fecha_vencimiento timestamptz,
  emitido_por uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (colegio_id, codigo),
  unique (token_verificacion)
);

create table if not exists public.registros_verificacion (
  id uuid primary key default gen_random_uuid(),
  colegio_id uuid references public.colegios(id) on delete set null,
  tipo text not null check (tipo in ('documento','credencial')),
  recurso_id uuid,
  resultado text not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  colegio_id uuid references public.colegios(id) on delete set null,
  usuario_id uuid,
  entidad text not null,
  entidad_id text,
  accion text not null,
  anterior jsonb,
  nuevo jsonb,
  created_at timestamptz not null default now()
);

-- Shared security helpers -------------------------------------------------------
create or replace function public.current_colegio_id()
returns uuid
language sql stable security definer
set search_path = public
as $$ select colegio_id from public.usuarios where id = auth.uid() $$;

create or replace function public.is_superadmin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select coalesce((select rol = 'superadmin' from public.usuarios where id = auth.uid()), false) $$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.is_superadmin() or coalesce(
    (select up.permitido
       from public.usuario_permisos up
       join public.permisos p on p.id = up.permiso_id
      where up.usuario_id = auth.uid() and p.codigo = permission_code),
    exists (
      select 1 from public.usuario_roles ur
      join public.rol_permisos rp on rp.rol_id = ur.rol_id
      join public.permisos p on p.id = rp.permiso_id
      where ur.usuario_id = auth.uid() and p.codigo = permission_code
    ),
    false
  )
$$;

-- Public verification exposes only an allow-listed payload ---------------------
create or replace function public.verificar_documento(codigo_o_token text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare d record; result jsonb;
begin
  select de.*, c.nombre as institucion
    into d
    from public.documentos_emitidos de
    join public.colegios c on c.id = de.colegio_id
   where de.codigo = codigo_o_token or de.token_verificacion = codigo_o_token
   limit 1;

  if d.id is null then
    insert into public.registros_verificacion(tipo, resultado) values ('documento', 'no_encontrado');
    return jsonb_build_object('encontrado', false, 'estado', 'no_encontrado');
  end if;

  result := jsonb_build_object(
    'encontrado', true,
    'estado', case when d.estado = 'emitido' and d.fecha_vencimiento is not null and d.fecha_vencimiento < now() then 'vencido' else d.estado end,
    'codigo', d.codigo,
    'tipo', d.tipo,
    'institucion', d.institucion,
    'titular', d.datos ->> 'nombre_completo',
    'programa', coalesce(d.datos ->> 'programa', d.datos ->> 'curso'),
    'horas', d.datos ->> 'horas',
    'creditos', d.datos ->> 'creditos',
    'fecha_emision', d.fecha_emision
  );
  insert into public.registros_verificacion(colegio_id, tipo, recurso_id, resultado) values (d.colegio_id, 'documento', d.id, result ->> 'estado');
  return result;
end $$;

create or replace function public.verificar_credencial(token text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare cr record; result jsonb;
begin
  select ce.*, c.nombre as institucion, u.nombre, u.apellido
    into cr
    from public.credenciales ce
    join public.colegios c on c.id = ce.colegio_id
    left join public.usuarios u on u.id = ce.usuario_id
   where ce.token_verificacion = token or ce.codigo = token
   limit 1;
  if cr.id is null then
    insert into public.registros_verificacion(tipo, resultado) values ('credencial', 'no_encontrada');
    return jsonb_build_object('encontrado', false, 'estado', 'no_encontrada');
  end if;
  result := jsonb_build_object(
    'encontrado', true,
    'estado', case when cr.estado = 'activa' and cr.fecha_vencimiento is not null and cr.fecha_vencimiento < now() then 'vencida' else cr.estado end,
    'codigo', cr.codigo,
    'institucion', cr.institucion,
    'titular', trim(concat(cr.nombre, ' ', cr.apellido)),
    'rol', cr.rol_impreso,
    'periodo', cr.datos ->> 'periodo',
    'fecha_emision', cr.fecha_emision,
    'fecha_vencimiento', cr.fecha_vencimiento
  );
  insert into public.registros_verificacion(colegio_id, tipo, recurso_id, resultado) values (cr.colegio_id, 'credencial', cr.id, result ->> 'estado');
  return result;
end $$;

grant execute on function public.verificar_documento(text) to anon, authenticated;
grant execute on function public.verificar_credencial(text) to anon, authenticated;

-- Audit and timestamps ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare tenant uuid; entity_id text;
begin
  tenant := coalesce((to_jsonb(new) ->> 'colegio_id')::uuid, (to_jsonb(old) ->> 'colegio_id')::uuid, public.current_colegio_id());
  entity_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');
  insert into public.audit_logs(colegio_id, usuario_id, entidad, entidad_id, accion, anterior, nuevo)
  values (tenant, auth.uid(), tg_table_name, entity_id, tg_op, case when tg_op = 'INSERT' then null else to_jsonb(old) end, case when tg_op = 'DELETE' then null else to_jsonb(new) end);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['colegios','suscripciones','modulos_institucion','roles','programas_aprendizaje','modulos_aprendizaje','lecciones','matriculas_programa','plantillas_documento','documentos_emitidos','plantillas_credencial','credenciales']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
  foreach table_name in array array['roles','usuario_roles','usuario_permisos','programas_aprendizaje','matriculas_programa','plantillas_documento','documentos_emitidos','plantillas_credencial','credenciales']
  loop
    execute format('drop trigger if exists audit_changes on public.%I', table_name);
    execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.audit_row_change()', table_name);
  end loop;
end $$;

-- Permissions catalog and role bootstrap ---------------------------------------
insert into public.permisos(codigo,recurso,accion,nombre) values
('organizations.manage','organizations','manage','Gestionar institución'),
('users.read','users','read','Ver usuarios'),
('users.manage','users','manage','Gestionar usuarios'),
('roles.manage','roles','manage','Gestionar roles y permisos'),
('learning.read','learning','read','Ver aula virtual'),
('learning.manage','learning','manage','Gestionar aula virtual'),
('learning.grade','learning','grade','Evaluar estudiantes'),
('credentials.read','credentials','read','Ver credenciales'),
('credentials.issue','credentials','issue','Emitir credenciales'),
('credentials.design','credentials','design','Diseñar credenciales'),
('documents.read','documents','read','Ver documentos'),
('documents.issue','documents','issue','Emitir documentos'),
('documents.design','documents','design','Diseñar documentos'),
('documents.revoke','documents','revoke','Anular documentos'),
('finance.read','finance','read','Ver finanzas'),
('finance.manage','finance','manage','Gestionar finanzas'),
('reports.read','reports','read','Ver reportes')
on conflict (codigo) do update set nombre = excluded.nombre, recurso = excluded.recurso, accion = excluded.accion;

insert into public.planes_suscripcion(codigo,nombre,precio_alumno,limites) values
('basico','Básico',5,'{"modules":["academic","attendance","communications"]}'::jsonb),
('gestion','Gestión',7,'{"modules":["academic","attendance","communications","finance","credentials"]}'::jsonb),
('profesional','Profesional',10,'{"modules":["academic","attendance","communications","finance","credentials","documents","learning"]}'::jsonb),
('enterprise','Enterprise',null,'{"modules":["all"],"white_label":true,"api":true}'::jsonb)
on conflict (codigo) do update set nombre = excluded.nombre, precio_alumno = excluded.precio_alumno, limites = excluded.limites;

do $$
declare tenant record; role_row record; user_row record;
begin
  for tenant in select id from public.colegios loop
    insert into public.roles(colegio_id,codigo,nombre,descripcion,es_sistema) values
      (tenant.id,'director','Director','Control integral de la institución',true),
      (tenant.id,'coordinador','Coordinador académico','Gestión académica y del aula virtual',true),
      (tenant.id,'docente','Docente','Cursos, asistencia y evaluación',true),
      (tenant.id,'alumno','Alumno','Experiencia de aprendizaje y documentos propios',true),
      (tenant.id,'padre','Padre o apoderado','Seguimiento de sus estudiantes',true)
    on conflict (colegio_id,codigo) do nothing;

    for role_row in select id,codigo from public.roles where colegio_id = tenant.id loop
      insert into public.rol_permisos(rol_id,permiso_id)
      select role_row.id, p.id from public.permisos p
      where (role_row.codigo = 'director')
         or (role_row.codigo = 'coordinador' and p.codigo in ('users.read','learning.read','learning.manage','learning.grade','credentials.read','credentials.issue','documents.read','documents.issue','reports.read'))
         or (role_row.codigo = 'docente' and p.codigo in ('learning.read','learning.manage','learning.grade','credentials.read','documents.read'))
         or (role_row.codigo in ('alumno','padre') and p.codigo in ('learning.read','credentials.read','documents.read'))
      on conflict do nothing;
    end loop;
  end loop;

  for user_row in select id,colegio_id,rol from public.usuarios where colegio_id is not null loop
    insert into public.usuario_roles(usuario_id,rol_id)
    select user_row.id, r.id from public.roles r where r.colegio_id = user_row.colegio_id and r.codigo = user_row.rol
    on conflict do nothing;
  end loop;
end $$;

-- RLS --------------------------------------------------------------------------
alter table public.planes_suscripcion enable row level security;
alter table public.suscripciones enable row level security;
alter table public.modulos_institucion enable row level security;
alter table public.roles enable row level security;
alter table public.permisos enable row level security;
alter table public.rol_permisos enable row level security;
alter table public.usuario_roles enable row level security;
alter table public.usuario_permisos enable row level security;
alter table public.programas_aprendizaje enable row level security;
alter table public.modulos_aprendizaje enable row level security;
alter table public.lecciones enable row level security;
alter table public.matriculas_programa enable row level security;
alter table public.progreso_lecciones enable row level security;
alter table public.plantillas_documento enable row level security;
alter table public.documentos_emitidos enable row level security;
alter table public.plantillas_credencial enable row level security;
alter table public.credenciales enable row level security;
alter table public.registros_verificacion enable row level security;
alter table public.audit_logs enable row level security;

create policy "catalogo planes lectura" on public.planes_suscripcion for select to authenticated using (true);
create policy "permisos catalogo lectura" on public.permisos for select to authenticated using (true);
create policy "suscripcion tenant lectura" on public.suscripciones for select to authenticated using (colegio_id = public.current_colegio_id() or public.is_superadmin());
create policy "modulos tenant lectura" on public.modulos_institucion for select to authenticated using (colegio_id = public.current_colegio_id() or public.is_superadmin());
create policy "roles tenant lectura" on public.roles for select to authenticated using (colegio_id = public.current_colegio_id() or public.is_superadmin());
create policy "roles tenant gestion" on public.roles for all to authenticated using (public.has_permission('roles.manage')) with check (colegio_id = public.current_colegio_id() or public.is_superadmin());
create policy "rol permisos lectura" on public.rol_permisos for select to authenticated using (exists(select 1 from public.roles r where r.id = rol_id and (r.colegio_id = public.current_colegio_id() or public.is_superadmin())));
create policy "rol permisos gestion" on public.rol_permisos for all to authenticated using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy "usuario roles lectura" on public.usuario_roles for select to authenticated using (usuario_id = auth.uid() or public.has_permission('users.read'));
create policy "usuario roles gestion" on public.usuario_roles for all to authenticated using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy "usuario permisos lectura" on public.usuario_permisos for select to authenticated using (usuario_id = auth.uid() or public.has_permission('users.read'));
create policy "usuario permisos gestion" on public.usuario_permisos for all to authenticated using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));

create policy "programas tenant lectura" on public.programas_aprendizaje for select to authenticated using (colegio_id = public.current_colegio_id() and public.has_permission('learning.read'));
create policy "programas tenant gestion" on public.programas_aprendizaje for all to authenticated using (colegio_id = public.current_colegio_id() and public.has_permission('learning.manage')) with check (colegio_id = public.current_colegio_id() and public.has_permission('learning.manage'));
create policy "modulos aprendizaje lectura" on public.modulos_aprendizaje for select to authenticated using (exists(select 1 from public.programas_aprendizaje p where p.id = programa_id and p.colegio_id = public.current_colegio_id()) and public.has_permission('learning.read'));
create policy "modulos aprendizaje gestion" on public.modulos_aprendizaje for all to authenticated using (public.has_permission('learning.manage')) with check (public.has_permission('learning.manage'));
create policy "lecciones lectura" on public.lecciones for select to authenticated using (exists(select 1 from public.modulos_aprendizaje m join public.programas_aprendizaje p on p.id=m.programa_id where m.id=modulo_id and p.colegio_id=public.current_colegio_id()) and public.has_permission('learning.read'));
create policy "lecciones gestion" on public.lecciones for all to authenticated using (public.has_permission('learning.manage')) with check (public.has_permission('learning.manage'));
create policy "matriculas lectura" on public.matriculas_programa for select to authenticated using (colegio_id=public.current_colegio_id() and (usuario_id=auth.uid() or public.has_permission('learning.manage')));
create policy "matriculas gestion" on public.matriculas_programa for all to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('learning.manage')) with check (colegio_id=public.current_colegio_id() and public.has_permission('learning.manage'));
create policy "progreso propio lectura" on public.progreso_lecciones for select to authenticated using (exists(select 1 from public.matriculas_programa mp where mp.id=matricula_id and (mp.usuario_id=auth.uid() or public.has_permission('learning.manage'))));
create policy "progreso propio gestion" on public.progreso_lecciones for all to authenticated using (exists(select 1 from public.matriculas_programa mp where mp.id=matricula_id and (mp.usuario_id=auth.uid() or public.has_permission('learning.manage')))) with check (exists(select 1 from public.matriculas_programa mp where mp.id=matricula_id and (mp.usuario_id=auth.uid() or public.has_permission('learning.manage'))));

create policy "plantillas documento lectura" on public.plantillas_documento for select to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('documents.read'));
create policy "plantillas documento gestion" on public.plantillas_documento for all to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('documents.design')) with check (colegio_id=public.current_colegio_id() and public.has_permission('documents.design'));
create policy "documentos lectura" on public.documentos_emitidos for select to authenticated using (colegio_id=public.current_colegio_id() and (titular_usuario_id=auth.uid() or public.has_permission('documents.read')));
create policy "documentos emision" on public.documentos_emitidos for insert to authenticated with check (colegio_id=public.current_colegio_id() and public.has_permission('documents.issue'));
create policy "documentos actualizacion" on public.documentos_emitidos for update to authenticated using (colegio_id=public.current_colegio_id() and (public.has_permission('documents.issue') or public.has_permission('documents.revoke'))) with check (colegio_id=public.current_colegio_id());
create policy "plantillas credencial lectura" on public.plantillas_credencial for select to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('credentials.read'));
create policy "plantillas credencial gestion" on public.plantillas_credencial for all to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('credentials.design')) with check (colegio_id=public.current_colegio_id() and public.has_permission('credentials.design'));
create policy "credenciales lectura" on public.credenciales for select to authenticated using (colegio_id=public.current_colegio_id() and (usuario_id=auth.uid() or public.has_permission('credentials.read')));
create policy "credenciales emision" on public.credenciales for all to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('credentials.issue')) with check (colegio_id=public.current_colegio_id() and public.has_permission('credentials.issue'));
create policy "auditoria tenant lectura" on public.audit_logs for select to authenticated using (colegio_id=public.current_colegio_id() and public.has_permission('reports.read'));
