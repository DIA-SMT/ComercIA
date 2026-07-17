import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
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
    const { error: errorInsert } = await supabase.from('relevamientos').insert({
      ...datos,
      origen: 'relevador',
    })
    setGuardando(false)
    if (errorInsert) {
      setError('No se pudo guardar el relevamiento. Revisá la conexión e intentá de nuevo.')
      return
    }
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
