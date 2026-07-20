import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Textos que aparecen en los valores de ejemplo: si alguno está presente,
// las credenciales todavía no fueron reemplazadas por las reales.
const MARCADORES_DE_EJEMPLO = ['tu-proyecto', 'tu-anon', 'placeholder', 'reemplazar']

const esValorDeEjemplo = (valor) =>
  MARCADORES_DE_EJEMPLO.some((marcador) => valor.toLowerCase().includes(marcador))

export const supabaseConfigurado = Boolean(
  url && anonKey && !esValorDeEjemplo(url) && !esValorDeEjemplo(anonKey),
)

export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null
