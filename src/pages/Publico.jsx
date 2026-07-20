import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { pedirRecomendaciones } from '../lib/ia'
import { nuevoId } from '../lib/id'
import FormularioRelevamiento from '../components/FormularioRelevamiento.jsx'
import AsistenteIA from '../components/AsistenteIA.jsx'

export default function Publico() {
  const [enviado, setEnviado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [recomendaciones, setRecomendaciones] = useState([])
  const [generandoRecomendaciones, setGenerandoRecomendaciones] = useState(false)

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

    // Los datos ya están a salvo: a partir de acá, si algo falla con las
    // recomendaciones, no se pierde nada del relevamiento.
    setEnviado(true)
    window.scrollTo({ top: 0 })

    setGenerandoRecomendaciones(true)
    const sugerencias = await pedirRecomendaciones(id, datos)
    setRecomendaciones(sugerencias)
    setGenerandoRecomendaciones(false)
  }

  function cargarOtro() {
    setEnviado(false)
    setRecomendaciones([])
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

          {generandoRecomendaciones && (
            <div className="tarjeta caja-recomendaciones" aria-live="polite">
              <h3>Estamos preparando algunas ideas para tu negocio…</h3>
              <p className="seccion-descripcion">Dura unos segundos.</p>
            </div>
          )}

          {!generandoRecomendaciones && recomendaciones.length > 0 && (
            <div className="tarjeta caja-recomendaciones" aria-live="polite">
              <h3>Según lo que nos contaste, así podrías empezar a usar IA en tu negocio:</h3>
              <ul className="lista-recomendaciones">
                {recomendaciones.map((recomendacion, indice) => (
                  <li key={indice}>{recomendacion}</li>
                ))}
              </ul>
              <p className="nota-recomendaciones">
                Son ideas generadas automáticamente para arrancar. En la capacitación las vemos en
                detalle.
              </p>
            </div>
          )}

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
        <AsistenteIA />
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
      <AsistenteIA />
    </>
  )
}
