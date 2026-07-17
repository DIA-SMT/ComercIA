import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatearFecha } from '../lib/csv'
import FormularioRelevamiento from '../components/FormularioRelevamiento.jsx'

export default function Detalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [registro, setRegistro] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  useEffect(() => {
    async function cargarRegistro() {
      const { data, error: errorSelect } = await supabase
        .from('relevamientos')
        .select('*')
        .eq('id', id)
        .single()
      if (errorSelect || !data) {
        setError('No se encontró el relevamiento.')
      } else {
        setRegistro(data)
      }
      setCargando(false)
    }
    cargarRegistro()
  }, [id])

  async function guardar(datos) {
    setGuardando(true)
    setError('')
    setExito(false)
    const { id: _id, created_at: _fecha, origen: _origen, ...cambios } = datos
    const { error: errorUpdate } = await supabase
      .from('relevamientos')
      .update(cambios)
      .eq('id', id)
    setGuardando(false)
    if (errorUpdate) {
      setError('No se pudieron guardar los cambios. Intentá de nuevo.')
      return
    }
    setExito(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function eliminar() {
    const confirmado = window.confirm(
      `¿Eliminar el relevamiento de "${registro.nombre_comercio}"? Esta acción no se puede deshacer.`,
    )
    if (!confirmado) return
    const { error: errorDelete } = await supabase.from('relevamientos').delete().eq('id', id)
    if (errorDelete) {
      setError('No se pudo eliminar el relevamiento.')
      return
    }
    navegar('/panel')
  }

  if (cargando) return <div className="cargando">Cargando…</div>

  if (!registro) {
    return (
      <>
        <div className="aviso aviso-error">{error || 'No se encontró el relevamiento.'}</div>
        <button className="boton boton-secundario" onClick={() => navegar('/panel')}>
          ← Volver al panel
        </button>
      </>
    )
  }

  return (
    <div className="contenedor-angosto" style={{ margin: '0 auto' }}>
      <div className="encabezado-detalle">
        <div>
          <h1 className="titulo-pagina">{registro.nombre_comercio}</h1>
          <div className="meta-detalle">
            Cargado el {formatearFecha(registro.created_at)} ·{' '}
            {registro.origen === 'relevador' ? 'por relevador' : 'autocarga del comercio (QR)'}
          </div>
        </div>
        <button className="boton boton-secundario" onClick={() => navegar('/panel')}>
          ← Volver
        </button>
      </div>

      {error && (
        <div className="aviso aviso-error" role="alert">
          {error}
        </div>
      )}
      {exito && (
        <div className="aviso aviso-exito" role="status">
          ✓ Cambios guardados correctamente.
        </div>
      )}

      <FormularioRelevamiento
        key={registro.id}
        modo="relevador"
        valoresIniciales={registro}
        guardando={guardando}
        textoBoton="Guardar cambios"
        onGuardar={guardar}
      />

      <div className="acciones-form no-imprimir">
        <button className="boton boton-peligro" onClick={eliminar}>
          Eliminar relevamiento
        </button>
      </div>
    </div>
  )
}
