import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'

export default function Inicio({ sesion }) {
  const referenciaMarco = useRef(null)
  const [aviso, setAviso] = useState('')
  // Respeta la subcarpeta cuando la app no vive en la raíz del dominio
  // (en GitHub Pages es /ComercIA/registro; en desarrollo, /registro).
  const urlPublica = new URL(`${import.meta.env.BASE_URL}registro`, window.location.origin).href

  function descargarQR() {
    const canvas = referenciaMarco.current?.querySelector('canvas')
    if (!canvas) return
    const enlace = document.createElement('a')
    enlace.href = canvas.toDataURL('image/png')
    enlace.download = 'comercia-qr-encuesta.png'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(urlPublica)
      setAviso('Enlace copiado al portapapeles.')
    } catch {
      setAviso(`Copiá el enlace manualmente: ${urlPublica}`)
    }
  }

  return (
    <>
      <header className="encabezado-publico">
        <img src="/logo.png" alt="" className="logo-encabezado" />
        <h1>
          Comerc<span>IA</span>
        </h1>
        <p>Relevamiento de comercios para la capacitación en Inteligencia Artificial</p>
      </header>

      <main className="contenedor contenedor-angosto">
        <div className="tarjeta caja-qr">
          <h2 className="titulo-pagina">Generar nueva encuesta</h2>
          <p className="subtitulo-pagina">
            Mostrá este código desde el celular o pegalo en el mostrador. Quien lo escanee completa
            sus datos sin necesidad de usuario.
          </p>

          <div className="marco-qr" ref={referenciaMarco}>
            <QRCodeCanvas value={urlPublica} size={260} level="M" includeMargin />
          </div>

          {aviso && <div className="aviso aviso-exito">{aviso}</div>}

          <div className="acciones-form no-imprimir" style={{ justifyContent: 'center' }}>
            <button className="boton" onClick={descargarQR}>
              ⬇ Descargar PNG
            </button>
            <button className="boton boton-secundario" onClick={() => window.print()}>
              🖨 Imprimir
            </button>
            <button className="boton boton-secundario" onClick={copiarEnlace}>
              Copiar enlace
            </button>
          </div>
        </div>

        <div className="tarjeta no-imprimir">
          <h2 className="seccion-titulo">Equipo relevador</h2>
          <p className="seccion-descripcion">
            {sesion
              ? 'Cargá un relevamiento vos mismo o revisá todo lo registrado hasta ahora.'
              : 'Para estas opciones vas a tener que iniciar sesión, porque incluyen datos de contacto de las personas.'}
          </p>
          <div className="acciones-form" style={{ marginTop: 0 }}>
            <Link className="boton" to="/carga">
              Cargar relevamiento
            </Link>
            <Link className="boton boton-secundario" to="/panel">
              Ver relevamientos
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
