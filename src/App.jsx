import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase, supabaseConfigurado } from './supabaseClient'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Carga from './pages/Carga.jsx'
import Publico from './pages/Publico.jsx'
import Panel from './pages/Panel.jsx'
import Detalle from './pages/Detalle.jsx'
import PantallaQR from './pages/PantallaQR.jsx'

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

  const requiereSesion = (elemento) =>
    sesion ? <Layout>{elemento}</Layout> : <Navigate to="/login" replace />

  return (
    <Routes>
      <Route path="/" element={<Navigate to={sesion ? '/panel' : '/login'} replace />} />
      <Route
        path="/login"
        element={sesion ? <Navigate to="/panel" replace /> : <Login />}
      />
      <Route path="/registro" element={<Publico />} />
      <Route path="/panel" element={requiereSesion(<Panel />)} />
      <Route path="/panel/:id" element={requiereSesion(<Detalle />)} />
      <Route path="/carga" element={requiereSesion(<Carga />)} />
      <Route path="/qr" element={requiereSesion(<PantallaQR />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
