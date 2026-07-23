import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Layout({ children }) {
  const navegar = useNavigate()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navegar('/')
  }

  const claseEnlace = ({ isActive }) => (isActive ? 'nav-enlace activo' : 'nav-enlace')

  return (
    <>
      <nav className="nav">
        <div className="nav-contenido">
          <NavLink to="/" className="nav-marca">
            <img src="/logo.svg" alt="" className="logo-nav" />
            Comerc<span>IA</span>
          </NavLink>
          <div className="nav-enlaces">
            <NavLink to="/" end className={claseEnlace}>
              Nueva encuesta
            </NavLink>
            <NavLink to="/panel" end className={claseEnlace}>
              Panel
            </NavLink>
            <NavLink to="/carga" className={claseEnlace}>
              Nueva carga
            </NavLink>
            <button className="nav-salir" onClick={cerrarSesion}>
              Salir
            </button>
          </div>
        </div>
      </nav>
      <main className="contenedor">{children}</main>
    </>
  )
}
