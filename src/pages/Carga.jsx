import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { pedirRecomendaciones } from '../lib/ia'
import { nuevoId } from '../lib/id'
import FormularioRelevamiento from '../components/FormularioRelevamiento.jsx'
import AsistenteIA from '../components/AsistenteIA.jsx'
import DevolucionIA from '../components/DevolucionIA.jsx'

const DEVOLUCION_INICIAL = { saludo: '', mensaje: '', recomendaciones: [], cierre: '' }

export default function Carga() {
  const navegar = useNavigate()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [devolucion, setDevolucion] = useState(DEVOLUCION_INICIAL)
  const [generandoRecomendaciones, setGenerandoRecomendaciones] = useState(false)

  async function guardar(datos) {
    setGuardando(true)
    setError('')
    const id = nuevoId()
    const { error: errorInsert } = await supabase.from('relevamientos').insert({
      ...datos,
      id,
      origen: 'relevador',
    })
    setGuardando(false)
    if (errorInsert) {
      setError('No se pudo guardar el relevamiento. Revisá la conexión e intentá de nuevo.')
      return
    }

    // El relevamiento ya quedó guardado. La devolución se pide después y
    // continúa siendo best-effort, igual que en la encuesta pública.
    setEnviado(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    setGenerandoRecomendaciones(true)
    const resultado = await pedirRecomendaciones(id, datos)
    setDevolucion(resultado)
    setGenerandoRecomendaciones(false)
  }

  function cargarOtro() {
    setEnviado(false)
    setDevolucion(DEVOLUCION_INICIAL)
    setGenerandoRecomendaciones(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (enviado) {
    return (
      <>
        <div className="contenedor-angosto carga-relevamiento">
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

          <DevolucionIA generando={generandoRecomendaciones} devolucion={devolucion} />

          <div className="acciones-form acciones-carga-completa">
            <button type="button" className="boton" onClick={cargarOtro}>
              Cargar otro comercio
            </button>
            <button
              type="button"
              className="boton boton-secundario"
              onClick={() => navegar('/panel')}
            >
              Ir al panel
            </button>
          </div>

          <p className="leyenda-privacidad">
            🔒 Tus datos personales se usan únicamente para organizar la capacitación sobre
            Inteligencia Artificial y no se comparten con terceros.
          </p>
        </div>
        <AsistenteIA />
      </>
    )
  }

  return (
    <>
      <div className="contenedor-angosto carga-relevamiento">
        <h1 className="titulo-pagina">Nueva carga</h1>
        <p className="subtitulo-pagina">
          La misma encuesta que completa el comercio, cargada por el equipo relevador.
        </p>
        {error && (
          <div className="aviso aviso-error" role="alert">
            {error}
          </div>
        )}
        <FormularioRelevamiento
          modo="publico"
          guardando={guardando}
          textoBoton="Guardar relevamiento"
          onGuardar={guardar}
        />
        <p className="leyenda-privacidad">
          🔒 Tus datos personales se usan únicamente para organizar la capacitación sobre
          Inteligencia Artificial y no se comparten con terceros.
        </p>
      </div>
      <AsistenteIA />
    </>
  )
}
