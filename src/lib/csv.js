// Exportación a CSV compatible con Excel en español (separador ";" y BOM UTF-8)

const COLUMNAS = [
  ['Fecha y hora', (r) => formatearFecha(r.created_at)],
  ['Origen de la carga', (r) => (r.origen === 'relevador' ? 'Relevador' : 'Autocarga del comercio')],
  ['Estado', (r) => r.estado],
  ['Nombre del comercio', (r) => r.nombre_comercio],
  ['Rubro', (r) => (r.rubro === 'Otro' && r.rubro_otro ? `Otro: ${r.rubro_otro}` : r.rubro)],
  ['Dirección', (r) => r.direccion],
  ['Teléfono del local', (r) => r.telefono_local],
  ['Sitio web / redes', (r) => r.web_redes],
  ['Empleados', (r) => r.empleados],
  ['Contacto', (r) => r.contacto_nombre],
  ['Cargo', (r) => r.contacto_cargo],
  ['Email', (r) => r.contacto_email],
  ['Teléfono de contacto', (r) => r.contacto_telefono],
  ['Usa IA', (r) => siNo(r.usa_ia)],
  ['Herramientas de IA', (r) => listaHerramientas(r)],
  ['Para qué usan IA', (r) => r.ia_para_que],
  ['Nivel de conocimiento', (r) => r.nivel_conocimiento],
  ['Interés en capacitarse', (r) => r.interes_capacitacion],
  ['Internet en el local', (r) => siNo(r.tiene_internet)],
  ['Software de gestión', (r) => listaSoftware(r)],
  ['Sistema de proveedores', (r) => siNo(r.proveedores_sistema)],
  ['Cuál (proveedores)', (r) => r.proveedores_cual],
  ['Consultas de tecnología', (r) => r.consultas_tecnologia],
  ['Observaciones', (r) => r.observaciones],
]

function siNo(valor) {
  if (valor === true) return 'Sí'
  if (valor === false) return 'No'
  return ''
}

function listaHerramientas(r) {
  const items = [...(r.herramientas_ia || [])]
  const idx = items.indexOf('Otras')
  if (idx !== -1 && r.herramientas_ia_otras) items[idx] = `Otras: ${r.herramientas_ia_otras}`
  return items.join(', ')
}

function listaSoftware(r) {
  const items = [...(r.software_gestion || [])]
  const idx = items.indexOf('Otro')
  if (idx !== -1 && r.software_gestion_otro) items[idx] = `Otro: ${r.software_gestion_otro}`
  return items.join(', ')
}

export function formatearFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function escaparCelda(valor) {
  const texto = String(valor ?? '')
  if (/[";\n\r]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`
  return texto
}

export function exportarCSV(registros) {
  const filas = [
    COLUMNAS.map(([titulo]) => titulo),
    ...registros.map((r) => COLUMNAS.map(([, obtener]) => obtener(r))),
  ]
  const contenido = filas.map((fila) => fila.map(escaparCelda).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  const fecha = new Date().toISOString().slice(0, 10)
  enlace.href = url
  enlace.download = `comercia-relevamientos-${fecha}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}
