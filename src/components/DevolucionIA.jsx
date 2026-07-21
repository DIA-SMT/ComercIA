const DEVOLUCION_GENERICA = {
  saludo: 'Gracias por abrirle la puerta a nuevas ideas para tu negocio',
  mensaje:
    'No hace falta saber de tecnología para empezar con IA. En la capacitación vas a poder conocer herramientas simples y descubrir cuáles pueden servirte en tu día a día.',
  cierre:
    'Este puede ser tu primer paso: aprender de a poco también es una forma de hacer crecer tu negocio.',
}

export default function DevolucionIA({ generando, generada, devolucion, onGenerar }) {
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
    </section>
  )
}
