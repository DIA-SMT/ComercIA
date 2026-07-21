import { supabase } from '../supabaseClient'

// Campos que le mandamos a la Edge Function para armar las recomendaciones.
// Mandamos solo lo necesario: ningún dato personal (nombre, email, teléfono,
// dirección) sale hacia OpenAI.
const CAMPOS_RELEVANTES = [
  'rubro',
  'rubro_otro',
  'empleados',
  'usa_ia',
  'herramientas_ia',
  'herramientas_ia_otras',
  'ia_para_que',
  'nivel_conocimiento',
  'sabe_prompt',
  'tiene_internet',
  'software_gestion',
  'software_gestion_otro',
  'interes_incorporar_ia',
]

function soloCamposRelevantes(datos) {
  const recorte = {}
  for (const campo of CAMPOS_RELEVANTES) {
    if (datos[campo] !== undefined) recorte[campo] = datos[campo]
  }
  return recorte
}

const DEVOLUCION_VACIA = { saludo: '', mensaje: '', recomendaciones: [], cierre: '' }

/**
 * Pide a la Edge Function la devolución de IA para un comercio: un objeto
 * { saludo, mensaje, recomendaciones, cierre }. Si `id` viene, la función
 * también la guarda en la fila correspondiente.
 *
 * Nunca lanza excepción: ante cualquier problema devuelve la forma vacía,
 * porque el relevamiento ya quedó guardado y no queremos romper el flujo.
 * (Si el backend todavía corre la versión vieja que devolvía solo el array,
 * los textos vienen vacíos y la pantalla usa sus versiones genéricas.)
 */
export async function pedirRecomendaciones(id, datos) {
  try {
    const { data, error } = await supabase.functions.invoke('ia', {
      body: { accion: 'recomendaciones', id, datos: soloCamposRelevantes(datos) },
    })
    if (error || !Array.isArray(data?.recomendaciones)) return DEVOLUCION_VACIA
    return {
      saludo: typeof data.saludo === 'string' ? data.saludo : '',
      mensaje: typeof data.mensaje === 'string' ? data.mensaje : '',
      recomendaciones: data.recomendaciones,
      cierre: typeof data.cierre === 'string' ? data.cierre : '',
    }
  } catch {
    return DEVOLUCION_VACIA
  }
}

/** Guarda la opinión de un comercio sobre la recomendación generada. */
export async function guardarOpinionRecomendacion(id, gusto) {
  try {
    const { data, error } = await supabase.functions.invoke('ia', {
      body: { accion: 'opinion_recomendacion', id, gusto },
    })
    return !error && data?.ok === true
  } catch {
    return false
  }
}

/**
 * Envía la conversación al asistente educativo y devuelve su respuesta.
 * Lanza excepción para que el chat pueda mostrar un mensaje de error.
 */
export async function preguntarAlAsistente(mensajes) {
  const { data, error } = await supabase.functions.invoke('ia', {
    body: { accion: 'chat', mensajes },
  })
  if (error) throw new Error(error.message || 'No se pudo contactar al asistente')
  if (data?.error) throw new Error(data.error)
  return data?.respuesta || ''
}
