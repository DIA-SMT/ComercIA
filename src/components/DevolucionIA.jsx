import { useState } from 'react'
import { guardarOpinionRecomendacion } from '../lib/ia'

const DEVOLUCION_GENERICA = {
  saludo: 'Gracias por abrirle la puerta a nuevas ideas para tu negocio',
  mensaje:
    'No hace falta saber de tecnología para empezar con IA. En la capacitación vas a poder conocer herramientas simples y descubrir cuáles pueden servirte en tu día a día.',
  cierre:
    'Este puede ser tu primer paso: aprender de a poco también es una forma de hacer crecer tu negocio.',
}

export default function DevolucionIA({
  generando,
  generada,
  devolucion,
  relevamientoId,
  onGenerar,
}) {
  const [opinion, setOpinion] = useState(null)
  const [guardandoOpinion, setGuardandoOpinion] = useState(false)
  const [errorOpinion, setErrorOpinion] = useState('')

  async function responderOpinion(gusto) {
    if (guardandoOpinion || opinion !== null) return
    setGuardandoOpinion(true)
    setErrorOpinion('')
    const guardada = await guardarOpinionRecomendacion(relevamientoId, gusto)
    setGuardandoOpinion(false)
    if (guardada) {
      setOpinion(gusto)
    } else {
      setErrorOpinion('No pudimos guardar tu respuesta. Probá de nuevo.')
    }
  }

  if (!generada && !generando) {
    return (
      <section className="tarjeta invitacion-recomendacion">
        <span className="icono-devolucion" aria-hidden="true">
          ✦
        </span>
        <div>
          <h3>Una recomendación pensada para tu negocio</h3>
          <p>
            Podemos analizar lo que respondiste y prepararte ideas concretas para empezar a usar IA.
          </p>
          <button type="button" className="boton boton-generar-ia" onClick={onGenerar}>
            <span aria-hidden="true">✦</span>
            Generar recomendación con IA
          </button>
        </div>
      </section>
    )
  }

  if (generando) {
    return (
      <section className="tarjeta devolucion-cargando" aria-live="polite" aria-busy="true">
        <span className="indicador-carga" aria-hidden="true" />
        <div>
          <h3>Estamos preparando algo especial para vos…</h3>
          <p>Dura solo unos segundos.</p>
        </div>
      </section>
    )
  }

  const recomendaciones = Array.isArray(devolucion?.recomendaciones)
    ? devolucion.recomendaciones
    : []
  const tieneIdeas = recomendaciones.length > 0
  const saludo = devolucion?.saludo || DEVOLUCION_GENERICA.saludo
  const mensaje = devolucion?.mensaje || DEVOLUCION_GENERICA.mensaje
  const cierre = devolucion?.cierre || DEVOLUCION_GENERICA.cierre

  return (
    <section
      className={`tarjeta devolucion-ia${tieneIdeas ? '' : ' devolucion-generica'}`}
      aria-live="polite"
    >
      <div className="encabezado-devolucion">
        <span className="icono-devolucion" aria-hidden="true">
          ✦
        </span>
        <div>
          <p className="etiqueta-devolucion">Una devolución para vos</p>
          <h3>{saludo}</h3>
        </div>
      </div>

      <p className="mensaje-devolucion">{mensaje}</p>

      {tieneIdeas && (
        <div className="ideas-devolucion">
          <h4>Ideas que podrías probar</h4>
          <ol>
            {recomendaciones.map((recomendacion, indice) => (
              <li key={indice}>
                <span className="numero-idea" aria-hidden="true">
                  {indice + 1}
                </span>
                <span>{recomendacion}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <blockquote className="cierre-devolucion">{cierre}</blockquote>

      {tieneIdeas && (
        <div className="encuesta-recomendacion">
          {opinion === null ? (
            <>
              <h4>¿Te gustó la recomendación?</h4>
              <div className="opciones-opinion" role="group" aria-label="¿Te gustó la recomendación?">
                <button
                  type="button"
                  className="boton-opinion"
                  disabled={guardandoOpinion}
                  onClick={() => responderOpinion(true)}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className="boton-opinion"
                  disabled={guardandoOpinion}
                  onClick={() => responderOpinion(false)}
                >
                  No
                </button>
              </div>
              {guardandoOpinion && <p className="estado-opinion">Guardando respuesta…</p>}
              {errorOpinion && (
                <p className="error-opinion" role="alert">
                  {errorOpinion}
                </p>
              )}
            </>
          ) : (
            <p className="opinion-guardada" role="status">
              Gracias por tu respuesta.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
