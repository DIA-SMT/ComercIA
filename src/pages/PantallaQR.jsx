import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function PantallaQR() {
  const referenciaMarco = useRef(null)
  const urlPublica = `${window.location.origin}/registro`

  function descargarQR() {
    const canvas = referenciaMarco.current?.querySelector('canvas')
    if (!canvas) return
    const enlace = document.createElement('a')
    enlace.href = canvas.toDataURL('image/png')
    enlace.download = 'comercia-qr-autocarga.png'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(urlPublica)
      alert('Enlace copiado al portapapeles.')
    } catch {
      alert(`Copiá el enlace manualmente: ${urlPublica}`)
    }
  }

  return (
    <div className="tarjeta caja-qr contenedor-angosto" style={{ margin: '0 auto' }}>
      <h1 className="titulo-pagina">Código QR de autocarga</h1>
      <p className="subtitulo-pagina">
        Mostralo desde el celular o imprimilo y pegalo en el mostrador. Al escanearlo, el comercio
        completa sus propios datos sin necesidad de usuario.
      </p>

      <div className="marco-qr" ref={referenciaMarco}>
        <QRCodeCanvas value={urlPublica} size={280} level="M" includeMargin />
      </div>

      <div className="url-publica">{urlPublica}</div>

      <div className="acciones-form" style={{ justifyContent: 'center' }}>
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
  )
}
