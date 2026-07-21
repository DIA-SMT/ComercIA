import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { pedirRecomendaciones } from '../lib/ia'
import { nuevoId } from '../lib/id'
import FormularioRelevamiento from '../components/FormularioRelevamiento.jsx'
import DevolucionIA from '../components/DevolucionIA.jsx'

const DEVOLUCION_INICIAL = { saludo: '', mensaje: '', recomendaciones: [], cierre: '' }

export default function Publico() {
  const [enviado, setEnviado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [devolucion, setDevolucion] = useState(DEVOLUCION_INICIAL)
  const [generandoRecomendaciones, setGenerandoRecomendaciones] = useState(false)
  const [recomendacionGenerada, setRecomendacionGenerada] = useState(false)
  const [relevamientoGuardado, setRelevamientoGuardado] = useState(null)

  async function guardar(datos) {
    setGuardando(true)
    setError('')

    const id = nuevoId()
    const { estado: _estado, observaciones: _obs, ...resto } = datos
    const { error: errorInsert } = await supabase.from('relevamientos').insert({
      ...resto,
      id,
      origen: 'comercio',
      estado: 'Pendiente',
    })
    setGuardando(false)

    if (errorInsert) {
      setError('No pudimos guardar tus datos. Revisá tu conexión e intentá de nuevo.')
      return
    }

    // La IA no se invoca durante el envío: el relevamiento queda guardado y
    // la persona decide después si quiere generar su recomendación.
    setRelevamientoGuardado({ id, datos })
    setEnviado(true)
    window.scrollTo({ top: 0 })
  }

  async function generarRecomendacion() {
    if (!relevamientoGuardado || generandoRecomendaciones) return
    setGenerandoRecomendaciones(true)
    const resultado = await pedirRecomendaciones(
      relevamientoGuardado.id,
      relevamientoGuardado.datos,
    )
    setDevolucion(resultado)
    setRecomendacionGenerada(true)
    setGenerandoRecomendaciones(false)
  }

  function cargarOtro() {
    setEnviado(false)
    setDevolucion(DEVOLUCION_INICIAL)
    setRecomendacionGenerada(false)
    setRelevamientoGuardado(null)
    setGenerandoRecomendaciones(false)
  }

  if (enviado) {
    return (
      <>
        <header className="encabezado-publico">
          <h1>
            Comerc<span>IA</span>
          </h1>
        </header>
        <main className="contenedor contenedor-angosto">
          <div className="caja-gracias-ancha">
            <div className="icono" aria-hidden="true">
              ✓
            </div>
            <h2>¡Gracias! Tus datos fueron registrados.</h2>
            <p>
              Con esta información vamos a organizar la capacitación sobre Inteligencia Artificial.
              Nos vamos a poner en contacto por email.
            </p>
          </div>

          <DevolucionIA
            generando={generandoRecomendaciones}
            generada={recomendacionGenerada}
            devolucion={devolucion}
            onGenerar={generarRecomendacion}
          />

          <div className="acciones-form" style={{ justifyContent: 'center' }}>
            <button className="boton boton-secundario" onClick={cargarOtro}>
              Cargar otro comercio
            </button>
          </div>

          <p className="leyenda-privacidad">
            🔒 Tus datos personales se usan únicamente para organizar la capacitación sobre
            Inteligencia Artificial y no se comparten con terceros.
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="encabezado-publico">
        <h1>
          Comerc<span>IA</span>
        </h1>
        <p>Contanos sobre tu comercio · Te lleva menos de 5 minutos</p>
      </header>
      <main className="contenedor contenedor-angosto">
        {error && (
          <div className="aviso aviso-error" role="alert">
            {error}
          </div>
        )}
        <FormularioRelevamiento
          modo="publico"
          guardando={guardando}
          textoBoton="Enviar mis datos"
          onGuardar={guardar}
        />
        <p className="leyenda-privacidad">
          🔒 Tus datos personales se usan únicamente para organizar la capacitación sobre
          Inteligencia Artificial y no se comparten con terceros.
        </p>
      </main>
    </>
  )
}
