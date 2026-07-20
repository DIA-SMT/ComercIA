// ============================================================
// ComercIA — Edge Function "ia"
//
// Concentra todas las llamadas al modelo de lenguaje del lado del servidor,
// para que la API key NUNCA viaje al navegador.
//
// Dos acciones:
//   { accion: 'recomendaciones', id, datos } → genera 2-3 recomendaciones
//        para el comercio y las guarda en la fila correspondiente.
//   { accion: 'chat', mensajes }             → asistente educativo que
//        explica qué es la IA y qué es un prompt, en criollo.
//
// Desplegar:  supabase functions deploy ia
// Secreto:    supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cabecerasCors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function responder(cuerpo: unknown, estado = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...cabecerasCors, 'Content-Type': 'application/json' },
  })
}

// OpenRouter y OpenAI hablan el mismo protocolo (/chat/completions), así que
// alcanza con cambiar la URL, la key y el nombre del modelo. Se elige el
// proveedor según qué secreto esté cargado; OpenRouter tiene prioridad.
function configurarProveedor() {
  const claveOpenRouter = Deno.env.get('OPENROUTER_API_KEY')
  if (claveOpenRouter) {
    return {
      nombre: 'OpenRouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: claveOpenRouter,
      // En OpenRouter el modelo se nombra "proveedor/modelo".
      modelo: Deno.env.get('MODELO_IA') || 'openai/gpt-4o-mini',
      // Opcionales: OpenRouter las usa para atribuir el uso a la app.
      cabecerasExtra: {
        'HTTP-Referer': Deno.env.get('SITIO_URL') || 'https://comercia.app',
        'X-Title': 'ComercIA',
      } as Record<string, string>,
    }
  }

  const claveOpenAI = Deno.env.get('OPENAI_API_KEY')
  if (claveOpenAI) {
    return {
      nombre: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: claveOpenAI,
      modelo: Deno.env.get('MODELO_IA') || 'gpt-4o-mini',
      cabecerasExtra: {} as Record<string, string>,
    }
  }

  throw new Error(
    'Falta configurar el secreto OPENROUTER_API_KEY (o, si preferís usar OpenAI directo, OPENAI_API_KEY)',
  )
}

async function llamarModelo(mensajes: unknown[], opciones: Record<string, unknown> = {}) {
  const proveedor = configurarProveedor()

  const respuesta = await fetch(proveedor.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${proveedor.apiKey}`,
      'Content-Type': 'application/json',
      ...proveedor.cabecerasExtra,
    },
    body: JSON.stringify({ model: proveedor.modelo, messages: mensajes, ...opciones }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(
      `${proveedor.nombre} respondió ${respuesta.status} para el modelo "${proveedor.modelo}": ${detalle.slice(0, 300)}`,
    )
  }

  const json = await respuesta.json()
  return json.choices?.[0]?.message?.content ?? ''
}

/**
 * Extrae el JSON de la respuesta del modelo.
 *
 * En OpenRouter se puede elegir entre muchos modelos y no todos respetan el
 * modo JSON al pie de la letra: algunos devuelven el objeto envuelto en un
 * bloque ```json o con texto alrededor. Esto contempla esos casos.
 */
function extraerJson(texto: string) {
  const limpio = texto
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()

  try {
    return JSON.parse(limpio)
  } catch {
    // Sigue abajo: probamos recortando lo que haya alrededor del objeto.
  }

  const desde = limpio.indexOf('{')
  const hasta = limpio.lastIndexOf('}')
  if (desde !== -1 && hasta > desde) {
    try {
      return JSON.parse(limpio.slice(desde, hasta + 1))
    } catch {
      return null
    }
  }

  return null
}

// ---------- Acción 1: recomendaciones por comercio ----------

function describirComercio(datos: Record<string, any>) {
  const rubro = datos.rubro === 'Otro' && datos.rubro_otro ? datos.rubro_otro : datos.rubro
  const herramientas = (datos.herramientas_ia || []).join(', ')
  const software = (datos.software_gestion || []).join(', ')

  const lineas = [
    `Rubro / actividad: ${rubro || 'no indicado'}`,
    `Cantidad de empleados: ${datos.empleados || 'no indicado'}`,
    `¿Usan IA actualmente?: ${datos.usa_ia === true ? 'Sí' : datos.usa_ia === false ? 'No' : 'no indicado'}`,
    herramientas ? `Herramientas de IA que usan: ${herramientas}` : '',
    datos.ia_para_que ? `Para qué usan la IA: ${datos.ia_para_que}` : '',
    `Nivel de conocimiento sobre IA: ${datos.nivel_conocimiento || 'no indicado'}`,
    `¿Sabe qué es un prompt?: ${datos.sabe_prompt || 'no indicado'}`,
    `¿Tiene internet en el local?: ${datos.tiene_internet === true ? 'Sí' : datos.tiene_internet === false ? 'No' : 'no indicado'}`,
    software ? `Software de gestión que usan: ${software}` : '',
    `¿Le interesa incorporar IA al negocio?: ${datos.interes_incorporar_ia || 'no indicado'}`,
  ]

  return lineas.filter(Boolean).join('\n')
}

const INSTRUCCIONES_RECOMENDACIONES = `
Sos un asesor que ayuda a comercios chicos de Tucumán, Argentina, a dar sus primeros
pasos con Inteligencia Artificial.

Te van a pasar los datos de un comercio. Devolvé entre 2 y 3 recomendaciones concretas
y realistas sobre cómo ESE comercio en particular podría empezar a usar IA en su día a día.

Reglas:
- Escribí en español de Argentina, usando "vos" (no "tú").
- Lenguaje simple y cotidiano, SIN tecnicismos. Lo lee alguien que capaz nunca usó IA.
- Cada recomendación: una sola idea, de 1 a 2 oraciones, concreta y accionable.
- Alineá las ideas al rubro. Por ejemplo: gastronomía → responder reseñas, ideas de menú,
  atención por WhatsApp; indumentaria → descripciones de productos, publicaciones para redes;
  almacén/kiosco → control de stock, listas de precios.
- Si ya usan alguna herramienta, proponé el paso siguiente en vez de repetir lo que ya hacen.
- Si el nivel de conocimiento es "Ninguno", arrancá por algo bien básico.
- Nada de inversiones caras ni de contratar programadores. Herramientas gratuitas o baratas.
- No saludes ni cierres, solo las recomendaciones.

Respondé SOLO un JSON con esta forma exacta:
{"recomendaciones": ["primera recomendación", "segunda recomendación", "tercera recomendación"]}
`.trim()

async function generarRecomendaciones(datos: Record<string, any>) {
  const contenido = await llamarModelo(
    [
      { role: 'system', content: INSTRUCCIONES_RECOMENDACIONES },
      { role: 'user', content: `Datos del comercio:\n${describirComercio(datos)}` },
    ],
    { temperature: 0.7, max_tokens: 500, response_format: { type: 'json_object' } },
  )

  // Si el modelo no devolvió JSON válido no cortamos el flujo: el relevamiento
  // ya está guardado y simplemente queda sin recomendaciones.
  const parseado = extraerJson(contenido)
  if (!Array.isArray(parseado?.recomendaciones)) return []

  return parseado.recomendaciones
    .filter((r: unknown) => typeof r === 'string' && r.trim())
    .map((r: string) => r.trim())
    .slice(0, 3)
}

async function guardarRecomendaciones(id: string, recomendaciones: string[]) {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) throw new Error('Faltan las variables de entorno de Supabase')

  // service_role: escribe saltando RLS, por eso el rol anónimo no necesita UPDATE.
  const supabase = createClient(url, serviceKey)
  const { error } = await supabase
    .from('relevamientos')
    .update({
      recomendaciones_ia: recomendaciones,
      recomendaciones_generadas_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(`No se pudieron guardar las recomendaciones: ${error.message}`)
}

// ---------- Acción 2: asistente educativo ----------

const INSTRUCCIONES_ASISTENTE = `
Sos un asistente que le explica Inteligencia Artificial a dueños y empleados de comercios
chicos de Tucumán, Argentina. La mayoría no tiene conocimientos técnicos.

Reglas:
- Español de Argentina, tratando de "vos". Tono amable, cercano y respetuoso.
- Explicá "en criollo", con ejemplos de la vida cotidiana y del comercio.
- NADA de tecnicismos. Si tenés que usar una palabra técnica, explicala al toque.
- Respuestas BREVES: 3 a 5 oraciones como máximo. Es un chat, no un manual.
- Si te preguntan qué es un prompt, explicá que es simplemente la instrucción o pregunta
  que uno le escribe a la IA, y dales un ejemplo aplicado a un comercio.
- Cuando puedas, cerrá con un ejemplo práctico que le sirva a su negocio.
- Si preguntan algo que no tiene nada que ver con IA o con su comercio, respondé con
  amabilidad que de eso no podés ayudar y volvé al tema.
- Nunca pidas datos personales.
`.trim()

async function responderChat(mensajes: { role: string; content: string }[]) {
  const limpios = mensajes
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10) // solo las últimas idas y vueltas, para acotar el costo
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))

  return await llamarModelo([{ role: 'system', content: INSTRUCCIONES_ASISTENTE }, ...limpios], {
    temperature: 0.6,
    max_tokens: 350,
  })
}

// ---------- Router ----------

Deno.serve(async (peticion) => {
  if (peticion.method === 'OPTIONS') {
    return new Response('ok', { headers: cabecerasCors })
  }

  try {
    const cuerpo = await peticion.json()
    const { accion } = cuerpo

    if (accion === 'recomendaciones') {
      const { id, datos } = cuerpo
      if (!datos) return responder({ error: 'Faltan los datos del comercio' }, 400)

      const recomendaciones = await generarRecomendaciones(datos)

      // El id es opcional: si no vino, devolvemos las recomendaciones sin guardarlas.
      if (id && recomendaciones.length > 0) {
        await guardarRecomendaciones(id, recomendaciones)
      }

      return responder({ recomendaciones })
    }

    if (accion === 'chat') {
      const { mensajes } = cuerpo
      if (!Array.isArray(mensajes) || mensajes.length === 0) {
        return responder({ error: 'Faltan los mensajes' }, 400)
      }
      const respuesta = await responderChat(mensajes)
      return responder({ respuesta })
    }

    return responder({ error: `Acción desconocida: ${accion}` }, 400)
  } catch (e) {
    console.error('Error en la función ia:', e)
    return responder({ error: e instanceof Error ? e.message : 'Error inesperado' }, 500)
  }
})
