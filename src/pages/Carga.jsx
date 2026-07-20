import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { pedirRecomendaciones } from '../lib/ia'
import { nuevoId } from '../lib/id'
import FormularioRelevamiento from '../components/FormularioRelevamiento.jsx'

export default function Carga() {
  const navegar = useNavigate()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [claveForm, setClaveForm] = useState(0)

  async function guardar(datos) {
    setGuardando(true)
    setError('')
    setExito(false)
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

    // Las recomendaciones se generan y guardan en segundo plano: el relevador
    // no espera y las ve después en el detalle del comercio.
    pedirRecomendaciones(id, datos)
    setExito(true)
    setClaveForm((clave) => clave + 1) // reinicia el formulario para cargar el siguiente local
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <h1 className="titulo-pagina">Nueva carga</h1>
      <p className="subtitulo-pagina">
        Relevamiento cargado por el equipo (origen: relevador).
      </p>
      {error && (
        <div className="aviso aviso-error" role="alert">
          {error}
        </div>
      )}
      {exito && (
        <div className="aviso aviso-exito" role="status">
          ✓ Relevamiento guardado correctamente. Podés cargar el siguiente comercio o{' '}
          <a href="#/" onClick={(e) => { e.preventDefault(); navegar('/panel') }}>
            ir al panel
          </a>
          .
        </div>
      )}
      <div className="contenedor-angosto" style={{ margin: 0 }}>
        <FormularioRelevamiento
          key={claveForm}
          modo="relevador"
          guardando={guardando}
          textoBoton="Guardar relevamiento"
          onGuardar={guardar}
        />
      </div>
    </>
  )
}
