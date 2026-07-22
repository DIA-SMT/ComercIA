import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ESTADOS, RUBROS } from '../lib/constants'
import { exportarCSV, formatearFecha } from '../lib/csv'

function EtiquetaEstado({ estado }) {
  const clases = {
    Pendiente: 'etiqueta etiqueta-pendiente',
    Relevado: 'etiqueta etiqueta-relevado',
    Capacitado: 'etiqueta etiqueta-capacitado',
  }
  return <span className={clases[estado] || 'etiqueta'}>{estado}</span>
}

function EtiquetaIA({ usaIa }) {
  if (usaIa === true) return <span className="etiqueta etiqueta-si">Usa IA</span>
  if (usaIa === false) return <span className="etiqueta etiqueta-no">No usa IA</span>
  return <span className="etiqueta etiqueta-no">Sin dato</span>
}

function EtiquetaOpinion({ gusto }) {
  if (gusto === true) return <span className="etiqueta etiqueta-si">Le gustó</span>
  if (gusto === false) {
    return <span className="etiqueta etiqueta-opinion-no">No le gustó</span>
  }
  return <span className="etiqueta etiqueta-origen">Sin respuesta</span>
}

function textoOrigen(origen) {
  return origen === 'relevador' ? 'Relevador' : 'Comercio'
}

export default function Panel() {
  const navegar = useNavigate()
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroRubro, setFiltroRubro] = useState('')
  const [filtroIA, setFiltroIA] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroOrigen, setFiltroOrigen] = useState('')
  const [filtroOpinion, setFiltroOpinion] = useState('')

  useEffect(() => {
    async function cargarRegistros() {
      const { data, error: errorSelect } = await supabase
        .from('relevamientos')
        .select('*')
        .order('created_at', { ascending: false })
      if (errorSelect) {
        setError('No se pudieron cargar los relevamientos.')
      } else {
        setRegistros(data || [])
      }
      setCargando(false)
    }
    cargarRegistros()
  }, [])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return registros.filter((r) => {
      if (filtroRubro && r.rubro !== filtroRubro) return false
      if (filtroIA === 'si' && r.usa_ia !== true) return false
      if (filtroIA === 'no' && r.usa_ia !== false) return false
      if (filtroEstado && r.estado !== filtroEstado) return false
      if (filtroOrigen && r.origen !== filtroOrigen) return false
      if (filtroOpinion === 'si' && r.recomendacion_gusto !== true) return false
      if (filtroOpinion === 'no' && r.recomendacion_gusto !== false) return false
      if (
        filtroOpinion === 'sin-respuesta' &&
        (r.recomendacion_gusto === true || r.recomendacion_gusto === false)
      )
        return false
      if (texto) {
        const blanco = [r.nombre_comercio, r.contacto_nombre, r.direccion, r.contacto_email]
          .join(' ')
          .toLowerCase()
        if (!blanco.includes(texto)) return false
      }
      return true
    })
  }, [
    registros,
    busqueda,
    filtroRubro,
    filtroIA,
    filtroEstado,
    filtroOrigen,
    filtroOpinion,
  ])

  const metricas = useMemo(() => {
    const total = registros.length
    const usanIA = registros.filter((r) => r.usa_ia === true).length
    const noUsanIA = registros.filter((r) => r.usa_ia === false).length
    const interesados = registros.filter((r) => r.interes_capacitacion === 'Sí').length
    const opinionesPositivas = registros.filter((r) => r.recomendacion_gusto === true).length
    const opinionesNegativas = registros.filter((r) => r.recomendacion_gusto === false).length
    const totalOpiniones = opinionesPositivas + opinionesNegativas
    const porcentajeOpinionesPositivas = totalOpiniones
      ? Math.round((opinionesPositivas / totalOpiniones) * 100)
      : null
    const porRubro = {}
    registros.forEach((r) => {
      porRubro[r.rubro] = (porRubro[r.rubro] || 0) + 1
    })
    const rubrosOrdenados = Object.entries(porRubro).sort((a, b) => b[1] - a[1])
    return {
      total,
      usanIA,
      noUsanIA,
      interesados,
      opinionesPositivas,
      opinionesNegativas,
      totalOpiniones,
      porcentajeOpinionesPositivas,
      rubrosOrdenados,
    }
  }, [registros])

  const maxRubro = metricas.rubrosOrdenados[0]?.[1] || 1

  if (cargando) return <div className="cargando">Cargando relevamientos…</div>

  return (
    <>
      <div className="encabezado-panel">
        <div>
          <h1 className="titulo-pagina">Panel de relevamientos</h1>
          <p className="subtitulo-pagina" style={{ marginBottom: 0 }}>
            {registros.length} comercio{registros.length === 1 ? '' : 's'} registrado
            {registros.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          className="boton boton-secundario"
          onClick={() => exportarCSV(filtrados)}
          disabled={filtrados.length === 0}
          title="Exporta los registros visibles según los filtros aplicados"
        >
          ⬇ Exportar CSV ({filtrados.length})
        </button>
      </div>

      {error && <div className="aviso aviso-error">{error}</div>}

      <div className="grilla-metricas">
        <div className="metrica">
          <div className="valor">{metricas.total}</div>
          <div className="detalle">Comercios relevados</div>
        </div>
        <div className="metrica">
          <div className="valor">{metricas.usanIA}</div>
          <div className="detalle">Usan IA</div>
          <div className="comparativa">{metricas.noUsanIA} no usan</div>
        </div>
        <div className="metrica">
          <div className="valor">{metricas.interesados}</div>
          <div className="detalle">Interesados en capacitarse</div>
        </div>
        <div className="metrica">
          <div className="valor">{metricas.rubrosOrdenados.length}</div>
          <div className="detalle">Rubros distintos</div>
        </div>
        <div className="metrica">
          <div className="valor">
            {metricas.porcentajeOpinionesPositivas === null
              ? '—'
              : `${metricas.porcentajeOpinionesPositivas}%`}
          </div>
          <div className="detalle">Les gustó la recomendación</div>
          <div className="comparativa">
            {metricas.opinionesPositivas} sí · {metricas.opinionesNegativas} no ·{' '}
            {metricas.totalOpiniones} respuestas
          </div>
        </div>
      </div>

      {metricas.rubrosOrdenados.length > 0 && (
        <div className="tarjeta barra-rubros">
          <h2 className="seccion-titulo">Distribución por rubro</h2>
          {metricas.rubrosOrdenados.map(([rubro, cantidad]) => (
            <div className="fila-rubro" key={rubro}>
              <span className="nombre">{rubro}</span>
              <div className="pista">
                <div className="relleno" style={{ width: `${(cantidad / maxRubro) * 100}%` }} />
              </div>
              <span className="cantidad">{cantidad}</span>
            </div>
          ))}
        </div>
      )}

      <div className="barra-filtros">
        <input
          type="search"
          placeholder="Buscar por comercio, contacto, dirección o email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar"
        />
        <select value={filtroRubro} onChange={(e) => setFiltroRubro(e.target.value)} aria-label="Filtrar por rubro">
          <option value="">Rubro: todos</option>
          {RUBROS.map((rubro) => (
            <option key={rubro} value={rubro}>
              {rubro}
            </option>
          ))}
        </select>
        <select value={filtroIA} onChange={(e) => setFiltroIA(e.target.value)} aria-label="Filtrar por uso de IA">
          <option value="">IA: todos</option>
          <option value="si">Usan IA</option>
          <option value="no">No usan IA</option>
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Estado: todos</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        <select value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)} aria-label="Filtrar por origen">
          <option value="">Origen: todos</option>
          <option value="relevador">Relevador</option>
          <option value="comercio">Comercio (QR)</option>
        </select>
        <select
          value={filtroOpinion}
          onChange={(e) => setFiltroOpinion(e.target.value)}
          aria-label="Filtrar por opinión sobre la recomendación"
        >
          <option value="">Opinión: todas</option>
          <option value="si">Le gustó</option>
          <option value="no">No le gustó</option>
          <option value="sin-respuesta">Sin respuesta</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="tarjeta sin-resultados">
          {registros.length === 0
            ? 'Todavía no hay relevamientos cargados. Empezá desde “Nueva carga” o compartí el código QR.'
            : 'No hay resultados con los filtros aplicados.'}
        </div>
      ) : (
        <>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Comercio</th>
                  <th>Rubro</th>
                  <th>Contacto</th>
                  <th>IA</th>
                  <th>Estado</th>
                  <th>Origen</th>
                  <th>Opinión</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r) => (
                  <tr key={r.id} onClick={() => navegar(`/panel/${r.id}`)}>
                    <td>
                      <div className="principal">{r.nombre_comercio}</div>
                      <div className="secundario">{r.direccion}</div>
                    </td>
                    <td>{r.rubro === 'Otro' && r.rubro_otro ? `Otro: ${r.rubro_otro}` : r.rubro}</td>
                    <td>
                      <div>{r.contacto_nombre}</div>
                      <div className="secundario">{r.contacto_email}</div>
                    </td>
                    <td>
                      <EtiquetaIA usaIa={r.usa_ia} />
                    </td>
                    <td>
                      <EtiquetaEstado estado={r.estado} />
                    </td>
                    <td>
                      <span className="etiqueta etiqueta-origen">{textoOrigen(r.origen)}</span>
                    </td>
                    <td>
                      <EtiquetaOpinion gusto={r.recomendacion_gusto} />
                    </td>
                    <td className="secundario">{formatearFecha(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lista-movil">
            {filtrados.map((r) => (
              <button key={r.id} className="item-movil" onClick={() => navegar(`/panel/${r.id}`)}>
                <div className="encabezado">
                  <span className="nombre">{r.nombre_comercio}</span>
                  <EtiquetaEstado estado={r.estado} />
                </div>
                <div className="datos">
                  {r.rubro === 'Otro' && r.rubro_otro ? r.rubro_otro : r.rubro} ·{' '}
                  {r.contacto_nombre} · {formatearFecha(r.created_at)}
                </div>
                <div className="etiquetas">
                  <EtiquetaIA usaIa={r.usa_ia} />
                  <span className="etiqueta etiqueta-origen">{textoOrigen(r.origen)}</span>
                  <EtiquetaOpinion gusto={r.recomendacion_gusto} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
