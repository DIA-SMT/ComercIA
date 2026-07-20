-- ============================================================
-- ComercIA — Esquema de base de datos
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query → pegar y Run
-- ============================================================

-- Tabla principal de relevamientos
create table if not exists public.relevamientos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Datos del local
  nombre_comercio text not null,
  rubro text not null,
  rubro_otro text,
  direccion text,
  telefono_local text,
  web_redes text,
  empleados text,

  -- Persona de contacto
  contacto_nombre text not null,
  contacto_cargo text,
  contacto_email text not null,
  contacto_telefono text,

  -- Uso de Inteligencia Artificial
  usa_ia boolean,
  herramientas_ia text[] default '{}',
  herramientas_ia_otras text,
  ia_para_que text,
  nivel_conocimiento text,
  sabe_prompt text,
  interes_incorporar_ia text,
  interes_capacitacion text,

  -- Recomendaciones generadas por IA (OpenAI, vía Edge Function)
  recomendaciones_ia text[] default '{}',
  recomendaciones_generadas_at timestamptz,

  -- Tecnología e infraestructura
  tiene_internet boolean,
  software_gestion text[] default '{}',
  software_gestion_otro text,
  proveedores_sistema boolean,
  proveedores_cual text,
  consultas_tecnologia text,

  -- Seguimiento
  origen text not null default 'comercio' check (origen in ('relevador', 'comercio')),
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'Relevado', 'Capacitado')),
  observaciones text
);

-- Índices útiles para filtros del panel
create index if not exists relevamientos_rubro_idx on public.relevamientos (rubro);
create index if not exists relevamientos_estado_idx on public.relevamientos (estado);
create index if not exists relevamientos_origen_idx on public.relevamientos (origen);
create index if not exists relevamientos_created_at_idx on public.relevamientos (created_at desc);

-- ============================================================
-- Seguridad (Row Level Security)
-- ============================================================
alter table public.relevamientos enable row level security;

-- El formulario público (QR, sin login) solo puede INSERTAR,
-- y únicamente con origen = 'comercio' y estado = 'Pendiente'.
drop policy if exists "autocarga_publica_insert" on public.relevamientos;
create policy "autocarga_publica_insert"
  on public.relevamientos
  for insert
  to anon
  with check (origen = 'comercio' and estado = 'Pendiente');

-- Los relevadores (usuarios autenticados) tienen acceso completo.
drop policy if exists "relevadores_select" on public.relevamientos;
create policy "relevadores_select"
  on public.relevamientos for select to authenticated using (true);

drop policy if exists "relevadores_insert" on public.relevamientos;
create policy "relevadores_insert"
  on public.relevamientos for insert to authenticated with check (true);

drop policy if exists "relevadores_update" on public.relevamientos;
create policy "relevadores_update"
  on public.relevamientos for update to authenticated using (true) with check (true);

drop policy if exists "relevadores_delete" on public.relevamientos;
create policy "relevadores_delete"
  on public.relevamientos for delete to authenticated using (true);

-- ============================================================
-- Usuarios relevadores:
-- Crearlos desde Supabase Dashboard → Authentication → Users → Add user
-- (email + contraseña). No hace falta nada más: cualquier usuario
-- autenticado es tratado como relevador.
-- ============================================================
