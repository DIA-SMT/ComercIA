/**
 * Genera el UUID del relevamiento del lado del cliente.
 *
 * Lo necesitamos porque el formulario público (rol anónimo) tiene permiso de
 * INSERT pero no de SELECT, así que no puede leer el id que generaría la base.
 * Al fijarlo nosotros, después podemos pedirle a la Edge Function que guarde
 * las recomendaciones en esa misma fila.
 *
 * `crypto.randomUUID` solo existe en contextos seguros (HTTPS o localhost);
 * el respaldo cubre el caso de servir la app por HTTP en una IP de red local.
 */
export function nuevoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (caracter) => {
    const aleatorio = (Math.random() * 16) | 0
    const valor = caracter === 'x' ? aleatorio : (aleatorio & 0x3) | 0x8
    return valor.toString(16)
  })
}
