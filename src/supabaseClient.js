import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigurado = Boolean(
  url && anonKey && !url.includes('TU-PROYECTO') && !anonKey.includes('TU-ANON'),
)

export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null
