import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function iniciarSesion(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    const { error: errorAuth } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: clave,
    })
    setEnviando(false)
    if (errorAuth) {
      setError(
        errorAuth.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Intentá de nuevo.',
      )
    }
  }

  return (
    <div className="pantalla-login">
      <div className="caja-login">
        <div className="logo-login">
          <h1>
            Comerc<span>IA</span>
          </h1>
          <p>Relevamiento de comercios · Acceso del equipo</p>
        </div>
        {error && <div className="aviso aviso-error">{error}</div>}
        <form onSubmit={iniciarSesion}>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="boton boton-ancho" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <p className="volver-inicio">
          <Link to="/">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}
