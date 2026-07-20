import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { supabase, supabaseConfigurado } from './supabaseClient'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Inicio from './pages/Inicio.jsx'
import Carga from './pages/Carga.jsx'
import Publico from './pages/Publico.jsx'
import Panel from './pages/Panel.jsx'
import Detalle from './pages/Detalle.jsx'

function AvisoConfiguracion() {
  return (
    <div className="pantalla-login">
      <div className="caja-login">
        <div className="logo-login">
          <h1>
            Comerc<span>IA</span>
          </h1>
          <p>Falta configurar la conexión con Supabase</p>
        </div>
        <div className="aviso aviso-error">
          Creá el archivo <strong>.env</strong> en la raíz del proyecto (copiando{' '}
          <strong>.env.example</strong>) y completá <code>VITE_SUPABASE_URL</code> y{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> con los datos de tu proyecto de Supabase. Después
          reiniciá el servidor de desarrollo.
        </div>
      </div>
    </div>
  )
}

/**
 * Envuelve las pantallas que muestran datos personales. Si no hay sesión manda
 * al login recordando a dónde quería ir, para volver ahí después de entrar.
 */
function RutaProtegida({ sesion, children }) {
  const ubicacion = useLocation()
  if (!sesion) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />
  }
  return <Layout>{children}</Layout>
}

function RutaLogin({ sesion }) {
  const ubicacion = useLocation()
  if (sesion) {
    return <Navigate to={ubicacion.state?.desde || '/panel'} replace />
  }
  return <Login />
}

export default function App() {
  const [sesion, setSesion] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setCargandoSesion(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setCargandoSesion(false)
    })
    const { data: escucha } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
    })
    return () => escucha.subscription.unsubscribe()
  }, [])

  if (!supabaseConfigurado) return <AvisoConfiguracion />
  if (cargandoSesion) return <div className="cargando">Cargando…</div>

  return (
    <Routes>
      {/* Públicas: no piden sesión */}
      <Route path="/" element={<Inicio sesion={sesion} />} />
      <Route path="/registro" element={<Publico />} />
      <Route path="/login" element={<RutaLogin sesion={sesion} />} />

      {/* Protegidas: muestran datos de contacto de las personas */}
      <Route
        path="/panel"
        element={
          <RutaProtegida sesion={sesion}>
            <Panel />
          </RutaProtegida>
        }
      />
      <Route
        path="/panel/:id"
        element={
          <RutaProtegida sesion={sesion}>
            <Detalle />
          </RutaProtegida>
        }
      />
      <Route
        path="/carga"
        element={
          <RutaProtegida sesion={sesion}>
            <Carga />
          </RutaProtegida>
        }
      />

      {/* La pantalla de QR se fusionó con el inicio */}
      <Route path="/qr" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
