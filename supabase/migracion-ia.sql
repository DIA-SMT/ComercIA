-- ============================================================
-- ComercIA — Migración: preguntas nuevas + recomendaciones de IA
--
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query → pegar y Run.
--
-- Es SEGURA de correr sobre una base que ya tiene datos: solo agrega
-- columnas nuevas (add column if not exists), no borra ni modifica nada.
-- Se puede ejecutar más de una vez sin problema.
-- ============================================================

-- Preguntas nuevas del bloque de Inteligencia Artificial
alter table public.relevamientos
  add column if not exists sabe_prompt text;

alter table public.relevamientos
  add column if not exists interes_incorporar_ia text;

-- Recomendaciones que genera OpenAI para cada comercio
alter table public.relevamientos
  add column if not exists recomendaciones_ia text[] default '{}';

alter table public.relevamientos
  add column if not exists recomendaciones_generadas_at timestamptz;

-- ============================================================
-- Nota sobre seguridad:
-- Las recomendaciones las escribe la Edge Function usando la
-- service_role key (del lado del servidor), por lo que NO hace falta
-- darle permiso de UPDATE al rol anónimo. Las políticas de RLS
-- existentes quedan igual: anon solo puede INSERT.
-- ============================================================
