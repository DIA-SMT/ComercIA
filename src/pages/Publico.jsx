import { useState } from 'react'
import { supabase } from '../supabaseClient'
import FormularioRelevamiento from '../components/FormularioRelevamiento.jsx'

export default function Publico() {
  const [enviado, setEnviado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(datos) {
    setGuardando(true)
    setError('')
    const { estado: _estado, observaciones: _obs, ...resto } = datos
    const { error: errorInsert } = await supabase.from('relevamientos').insert({
      ...resto,
      origen: 'comercio',
      estado: 'Pendiente',
    })
    setGuardando(false)
    if (errorInsert) {
      setError('No pudimos guardar tus datos. Revisá tu conexión e intentá de nuevo.')
      return
    }
    setEnviado(true)
    window.scrollTo({ top: 0 })
  }

  if (enviado) {
    return (
      <>
        <header className="encabezado-publico">
          <h1>
            Comerc<span>IA</span>
          </h1>
        </header>
        <div className="pantalla-gracias">
          <div className="caja-gracias">
            <div className="icono" aria-hidden="true">
              ✓
            </div>
            <h2>¡Gracias! Tus datos fueron registrados.</h2>
            <p>
              Con esta información vamos a organizar la capacitación sobre Inteligencia Artificial.
              Nos vamos a poner en contacto por email.
            </p>
            <button className="boton boton-secundario" onClick={() => setEnviado(false)}>
              Cargar otro comercio
            </button>
          </div>
        </div>
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
