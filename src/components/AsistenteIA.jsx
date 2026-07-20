import { useEffect, useRef, useState } from 'react'
import { preguntarAlAsistente } from '../lib/ia'

const SALUDO = {
  role: 'assistant',
  content:
    '¡Hola! Soy un asistente para ayudarte a entender de qué se trata esto de la Inteligencia Artificial. Preguntame lo que quieras, sin vergüenza: no hace falta que sepas nada de tecnología.',
}

const SUGERENCIAS = [
  '¿Qué es la Inteligencia Artificial?',
  '¿Qué es un prompt?',
  '¿Para qué me sirve en mi comercio?',
]

export default function AsistenteIA() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([SALUDO])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [error, setError] = useState('')
  const finDelChat = useRef(null)

  useEffect(() => {
    if (abierto) finDelChat.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, pensando, abierto])

  async function enviar(contenido) {
    const pregunta = (contenido ?? texto).trim()
    if (!pregunta || pensando) return

    const conversacion = [...mensajes, { role: 'user', content: pregunta }]
    setMensajes(conversacion)
    setTexto('')
    setError('')
    setPensando(true)

    try {
      // No mandamos el saludo inicial: no aporta nada al contexto.
      const respuesta = await preguntarAlAsistente(conversacion.filter((m) => m !== SALUDO))
      setMensajes([...conversacion, { role: 'assistant', content: respuesta }])
    } catch {
      setError('No pudimos contactar al asistente. Probá de nuevo en un ratito.')
    } finally {
      setPensando(false)
    }
  }

  function manejarTecla(evento) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault()
      enviar()
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        className="lanzador-asistente"
        onClick={() => setAbierto(true)}
        aria-label="Abrir el asistente: ¿no sabés qué es la IA o un prompt?"
      >
        <span className="icono-lanzador" aria-hidden="true">
          💬
        </span>
        <span className="texto-lanzador">¿Dudas sobre IA?</span>
      </button>
    )
  }

  return (
    <div className="fondo-asistente" role="dialog" aria-modal="true" aria-label="Asistente sobre Inteligencia Artificial">
      <div className="panel-asistente">
        <header className="encabezado-asistente">
          <div>
            <strong>Asistente ComercIA</strong>
            <div className="subtitulo-asistente">Preguntas sobre IA, explicadas fácil</div>
          </div>
          <button
            type="button"
            className="cerrar-asistente"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar el asistente"
          >
            ✕
          </button>
        </header>

        <div className="mensajes-asistente">
          {mensajes.map((mensaje, indice) => (
            <div
              key={indice}
              className={`burbuja ${mensaje.role === 'user' ? 'burbuja-usuario' : 'burbuja-asistente'}`}
            >
              {mensaje.content}
            </div>
          ))}

          {pensando && (
            <div className="burbuja burbuja-asistente burbuja-pensando">Escribiendo…</div>
          )}

          {error && <div className="aviso aviso-error">{error}</div>}

          {mensajes.length === 1 && !pensando && (
            <div className="sugerencias">
              {SUGERENCIAS.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  className="chip-sugerencia"
                  onClick={() => enviar(sugerencia)}
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          )}

          <div ref={finDelChat} />
        </div>

        <div className="pie-asistente">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={manejarTecla}
            placeholder="Escribí tu pregunta…"
            rows={1}
            aria-label="Tu pregunta"
          />
          <button
            type="button"
            className="boton"
            onClick={() => enviar()}
            disabled={pensando || !texto.trim()}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
