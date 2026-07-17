import { useMemo, useState } from 'react'
import {
  EMAIL_REGEX,
  EMPLEADOS_OPCIONES,
  ESTADOS,
  HERRAMIENTAS_IA,
  INTERES_OPCIONES,
  NIVELES_CONOCIMIENTO,
  REGISTRO_VACIO,
  RUBROS,
  SOFTWARE_OPCIONES,
} from '../lib/constants'

function OpcionesBoton({ opciones, valor, onCambio, nombre }) {
  return (
    <div className="grupo-opciones" role="radiogroup" aria-label={nombre}>
      {opciones.map((opcion) => (
        <button
          key={String(opcion.valor)}
          type="button"
          role="radio"
          aria-checked={valor === opcion.valor}
          className={`opcion-boton${valor === opcion.valor ? ' seleccionada' : ''}`}
          onClick={() => onCambio(opcion.valor)}
        >
          {opcion.texto}
        </button>
      ))}
    </div>
  )
}

const SI_NO = [
  { valor: true, texto: 'Sí' },
  { valor: false, texto: 'No' },
]

export default function FormularioRelevamiento({
  modo, // 'relevador' | 'publico'
  valoresIniciales = null,
  guardando = false,
  textoBoton = 'Guardar',
  onGuardar,
}) {
  const [datos, setDatos] = useState(() => {
    const base = { ...REGISTRO_VACIO }
    if (valoresIniciales) {
      for (const clave of Object.keys(base)) {
        const valor = valoresIniciales[clave]
        if (valor !== null && valor !== undefined) base[clave] = valor
      }
    }
    return base
  })
  const [errores, setErrores] = useState({})
  const esPublico = modo === 'publico'

  function cambiar(campo, valor) {
    setDatos((previos) => ({ ...previos, [campo]: valor }))
    setErrores((previos) => {
      if (!previos[campo]) return previos
      const { [campo]: _quitado, ...resto } = previos
      return resto
    })
  }

  function alternarLista(campo, opcion) {
    setDatos((previos) => {
      const lista = previos[campo] || []
      const nueva = lista.includes(opcion)
        ? lista.filter((item) => item !== opcion)
        : [...lista, opcion]
      return { ...previos, [campo]: nueva }
    })
  }

  const idsErrores = useMemo(() => Object.keys(errores), [errores])

  function validar() {
    const nuevos = {}
    if (!datos.nombre_comercio.trim()) nuevos.nombre_comercio = 'Ingresá el nombre del comercio.'
    if (!datos.rubro) nuevos.rubro = 'Elegí el rubro o actividad.'
    if (datos.rubro === 'Otro' && !datos.rubro_otro.trim())
      nuevos.rubro_otro = 'Contanos cuál es el rubro.'
    if (!datos.contacto_nombre.trim()) nuevos.contacto_nombre = 'Ingresá nombre y apellido.'
    if (!datos.contacto_email.trim()) {
      nuevos.contacto_email = 'Ingresá un email de contacto.'
    } else if (!EMAIL_REGEX.test(datos.contacto_email.trim())) {
      nuevos.contacto_email = 'El email no tiene un formato válido.'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!validar()) {
      const primerCampo = document.querySelector('.campo.con-error')
      if (primerCampo) primerCampo.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const limpios = {
      ...datos,
      nombre_comercio: datos.nombre_comercio.trim(),
      contacto_nombre: datos.contacto_nombre.trim(),
      contacto_email: datos.contacto_email.trim().toLowerCase(),
      rubro_otro: datos.rubro === 'Otro' ? datos.rubro_otro.trim() : '',
      herramientas_ia: datos.usa_ia ? datos.herramientas_ia : [],
      herramientas_ia_otras:
        datos.usa_ia && datos.herramientas_ia.includes('Otras') ? datos.herramientas_ia_otras : '',
      ia_para_que: datos.usa_ia ? datos.ia_para_que : '',
      software_gestion_otro: datos.software_gestion.includes('Otro')
        ? datos.software_gestion_otro
        : '',
      proveedores_cual: datos.proveedores_sistema ? datos.proveedores_cual : '',
    }
    onGuardar(limpios)
  }

  function claseCampo(campo) {
    return errores[campo] ? 'campo con-error' : 'campo'
  }

  return (
    <form onSubmit={enviar} noValidate>
      {idsErrores.length > 0 && (
        <div className="aviso aviso-error" role="alert">
          Revisá los campos marcados: falta completar información obligatoria.
        </div>
      )}

      <fieldset className="seccion-form">
        <legend>Datos del local</legend>
        <div className={claseCampo('nombre_comercio')}>
          <label htmlFor="nombre_comercio" className="obligatorio">
            Nombre del comercio
          </label>
          <input
            id="nombre_comercio"
            type="text"
            value={datos.nombre_comercio}
            onChange={(e) => cambiar('nombre_comercio', e.target.value)}
            placeholder="Ej: Panadería La Espiga"
          />
          {errores.nombre_comercio && <div className="error-campo">{errores.nombre_comercio}</div>}
        </div>

        <div className="fila-doble">
          <div className={claseCampo('rubro')}>
            <label htmlFor="rubro" className="obligatorio">
              Rubro / actividad
            </label>
            <select
              id="rubro"
              value={datos.rubro}
              onChange={(e) => cambiar('rubro', e.target.value)}
            >
              <option value="">Elegí una opción…</option>
              {RUBROS.map((rubro) => (
                <option key={rubro} value={rubro}>
                  {rubro}
                </option>
              ))}
            </select>
            {errores.rubro && <div className="error-campo">{errores.rubro}</div>}
          </div>

          {datos.rubro === 'Otro' && (
            <div className={claseCampo('rubro_otro')}>
              <label htmlFor="rubro_otro" className="obligatorio">
                ¿Cuál?
              </label>
              <input
                id="rubro_otro"
                type="text"
                value={datos.rubro_otro}
                onChange={(e) => cambiar('rubro_otro', e.target.value)}
                placeholder="Describí la actividad"
              />
              {errores.rubro_otro && <div className="error-campo">{errores.rubro_otro}</div>}
            </div>
          )}
        </div>

        <div className="campo">
          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            value={datos.direccion}
            onChange={(e) => cambiar('direccion', e.target.value)}
            placeholder="Calle y número"
          />
        </div>

        <div className="fila-doble">
          <div className="campo">
            <label htmlFor="telefono_local">Teléfono del local</label>
            <input
              id="telefono_local"
              type="tel"
              value={datos.telefono_local}
              onChange={(e) => cambiar('telefono_local', e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="web_redes">Sitio web y/o redes sociales</label>
            <input
              id="web_redes"
              type="text"
              value={datos.web_redes}
              onChange={(e) => cambiar('web_redes', e.target.value)}
              placeholder="Ej: @milocal / www.milocal.com.ar"
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="empleados">Cantidad aproximada de empleados</label>
          <select
            id="empleados"
            value={datos.empleados}
            onChange={(e) => cambiar('empleados', e.target.value)}
          >
            <option value="">Elegí una opción…</option>
            {EMPLEADOS_OPCIONES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="seccion-form">
        <legend>Persona de contacto</legend>
        <div className={claseCampo('contacto_nombre')}>
          <label htmlFor="contacto_nombre" className="obligatorio">
            Nombre y apellido
          </label>
          <input
            id="contacto_nombre"
            type="text"
            value={datos.contacto_nombre}
            onChange={(e) => cambiar('contacto_nombre', e.target.value)}
          />
          {errores.contacto_nombre && <div className="error-campo">{errores.contacto_nombre}</div>}
        </div>

        <div className="campo">
          <label htmlFor="contacto_cargo">Cargo / rol en el comercio</label>
          <input
            id="contacto_cargo"
            type="text"
            value={datos.contacto_cargo}
            onChange={(e) => cambiar('contacto_cargo', e.target.value)}
            placeholder="Ej: dueño/a, encargado/a, empleado/a"
          />
        </div>

        <div className="fila-doble">
          <div className={claseCampo('contacto_email')}>
            <label htmlFor="contacto_email" className="obligatorio">
              Email
            </label>
            <input
              id="contacto_email"
              type="email"
              value={datos.contacto_email}
              onChange={(e) => cambiar('contacto_email', e.target.value)}
              placeholder="nombre@correo.com"
            />
            {errores.contacto_email && <div className="error-campo">{errores.contacto_email}</div>}
          </div>
          <div className="campo">
            <label htmlFor="contacto_telefono">Teléfono de contacto</label>
            <input
              id="contacto_telefono"
              type="tel"
              value={datos.contacto_telefono}
              onChange={(e) => cambiar('contacto_telefono', e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="seccion-form">
        <legend>Uso de Inteligencia Artificial</legend>
        <div className="campo">
          <span className="etiqueta">¿Usan actualmente alguna herramienta de IA?</span>
          <OpcionesBoton
            opciones={SI_NO}
            valor={datos.usa_ia}
            onCambio={(valor) => cambiar('usa_ia', valor)}
            nombre="¿Usan actualmente alguna herramienta de IA?"
          />
        </div>

        {datos.usa_ia === true && (
          <>
            <div className="campo">
              <span className="etiqueta">¿Cuáles?</span>
              <div className="grupo-casillas">
                {HERRAMIENTAS_IA.map((herramienta) => (
                  <label key={herramienta} className="casilla">
                    <input
                      type="checkbox"
                      checked={datos.herramientas_ia.includes(herramienta)}
                      onChange={() => alternarLista('herramientas_ia', herramienta)}
                    />
                    {herramienta}
                  </label>
                ))}
              </div>
            </div>

            {datos.herramientas_ia.includes('Otras') && (
              <div className="campo">
                <label htmlFor="herramientas_ia_otras">¿Qué otras herramientas?</label>
                <input
                  id="herramientas_ia_otras"
                  type="text"
                  value={datos.herramientas_ia_otras}
                  onChange={(e) => cambiar('herramientas_ia_otras', e.target.value)}
                />
              </div>
            )}

            <div className="campo">
              <label htmlFor="ia_para_que">¿Para qué la usan?</label>
              <textarea
                id="ia_para_que"
                value={datos.ia_para_que}
                onChange={(e) => cambiar('ia_para_que', e.target.value)}
                placeholder="Ej: redactar publicaciones, responder consultas, diseñar promociones…"
              />
            </div>
          </>
        )}

        <div className="campo">
          <label htmlFor="nivel_conocimiento">Nivel de conocimiento sobre IA</label>
          <select
            id="nivel_conocimiento"
            value={datos.nivel_conocimiento}
            onChange={(e) => cambiar('nivel_conocimiento', e.target.value)}
          >
            <option value="">Elegí una opción…</option>
            {NIVELES_CONOCIMIENTO.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <span className="etiqueta">¿Les interesa capacitarse en IA?</span>
          <OpcionesBoton
            opciones={INTERES_OPCIONES.map((opcion) => ({ valor: opcion, texto: opcion }))}
            valor={datos.interes_capacitacion}
            onCambio={(valor) => cambiar('interes_capacitacion', valor)}
            nombre="¿Les interesa capacitarse en IA?"
          />
        </div>
      </fieldset>

      <fieldset className="seccion-form">
        <legend>Tecnología e infraestructura</legend>
        <div className="campo">
          <span className="etiqueta">¿Tienen acceso a internet en el local?</span>
          <OpcionesBoton
            opciones={SI_NO}
            valor={datos.tiene_internet}
            onCambio={(valor) => cambiar('tiene_internet', valor)}
            nombre="¿Tienen acceso a internet en el local?"
          />
        </div>

        <div className="campo">
          <span className="etiqueta">¿Qué sistema o software usan para gestionar el negocio?</span>
          <div className="grupo-casillas">
            {SOFTWARE_OPCIONES.map((opcion) => (
              <label key={opcion} className="casilla">
                <input
                  type="checkbox"
                  checked={datos.software_gestion.includes(opcion)}
                  onChange={() => alternarLista('software_gestion', opcion)}
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>

        {datos.software_gestion.includes('Otro') && (
          <div className="campo">
            <label htmlFor="software_gestion_otro">¿Qué otro sistema?</label>
            <input
              id="software_gestion_otro"
              type="text"
              value={datos.software_gestion_otro}
              onChange={(e) => cambiar('software_gestion_otro', e.target.value)}
            />
          </div>
        )}

        <div className="campo">
          <span className="etiqueta">
            ¿Manejan a sus proveedores a través de algún sistema o plataforma?
          </span>
          <OpcionesBoton
            opciones={SI_NO}
            valor={datos.proveedores_sistema}
            onCambio={(valor) => cambiar('proveedores_sistema', valor)}
            nombre="¿Manejan a sus proveedores a través de algún sistema o plataforma?"
          />
        </div>

        {datos.proveedores_sistema === true && (
          <div className="campo">
            <label htmlFor="proveedores_cual">¿Cuál?</label>
            <input
              id="proveedores_cual"
              type="text"
              value={datos.proveedores_cual}
              onChange={(e) => cambiar('proveedores_cual', e.target.value)}
            />
          </div>
        )}

        <div className="campo">
          <label htmlFor="consultas_tecnologia">Consultas de tecnología</label>
          <textarea
            id="consultas_tecnologia"
            value={datos.consultas_tecnologia}
            onChange={(e) => cambiar('consultas_tecnologia', e.target.value)}
            placeholder="Dudas, necesidades o consultas tecnológicas del comercio"
          />
        </div>
      </fieldset>

      {!esPublico && (
        <fieldset className="seccion-form">
          <legend>Seguimiento</legend>
          <p className="seccion-descripcion">Campos internos del equipo relevador.</p>
          <div className="campo">
            <label htmlFor="estado">Estado del relevamiento</label>
            <select
              id="estado"
              value={datos.estado}
              onChange={(e) => cambiar('estado', e.target.value)}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              value={datos.observaciones}
              onChange={(e) => cambiar('observaciones', e.target.value)}
            />
          </div>
        </fieldset>
      )}

      <div className="acciones-form">
        <button className={`boton${esPublico ? ' boton-ancho' : ''}`} type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : textoBoton}
        </button>
      </div>
    </form>
  )
}
