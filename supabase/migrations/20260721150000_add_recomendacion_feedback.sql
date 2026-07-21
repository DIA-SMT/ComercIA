-- Opinión opcional sobre la recomendación generada por IA.
alter table public.relevamientos
  add column if not exists recomendacion_gusto boolean;

alter table public.relevamientos
  add column if not exists recomendacion_opinada_at timestamptz;
