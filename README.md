# ComercIA

Aplicación web para el relevamiento de comercios de cara a una capacitación sobre Inteligencia Artificial. Permite registrar los datos de cada local (actividad, contacto, uso de IA, tecnología) de dos formas:

- **Modo relevador (interno):** el equipo inicia sesión, carga relevamientos y administra el listado completo con panel de métricas, filtros y exportación a CSV.
- **Autocarga por QR (público):** un código QR lleva a un formulario público donde el propio comercio completa sus datos, sin login. Queda marcado con origen "comercio".

## Stack

- React 18 + Vite + React Router
- Supabase (PostgreSQL + Auth + Row Level Security)
- `qrcode.react` para el código QR

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com), creá un proyecto nuevo (plan gratuito alcanza).
2. En **SQL Editor → New query**, pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo (**Run**). Esto crea la tabla `relevamientos`, los índices y las políticas de seguridad.
3. En **Authentication → Users → Add user**, creá los usuarios del equipo relevador (email + contraseña). Cualquier usuario autenticado es tratado como relevador.
   - Sugerencia: en **Authentication → Sign In / Up**, desactivá "Allow new users to sign up" para que nadie pueda registrarse por su cuenta.

### 2. Configurar la aplicación

```bash
# copiar la plantilla de variables de entorno
copy .env.example .env
```

Editá `.env` y completá con los datos de **Settings → API** de tu proyecto Supabase:

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Ejecutar

```bash
npm install
npm run dev        # desarrollo (http://localhost:5173)
npm run build      # build de producción (carpeta dist/)
```

## Pantallas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión del equipo relevador |
| `/registro` | Público (QR) | Formulario de autocarga del comercio, sin login |
| `/panel` | Relevador | Métricas, listado con buscador y filtros (rubro, IA, estado, origen), exportación CSV |
| `/panel/:id` | Relevador | Detalle completo de un relevamiento, edición y eliminación |
| `/carga` | Relevador | Formulario de carga interna (incluye estado y observaciones) |
| `/qr` | Relevador | Genera el código QR hacia `/registro`, con descarga PNG e impresión |

## Seguridad de datos

- La tabla usa **Row Level Security**: el rol anónimo (formulario público) solo puede **insertar** registros con `origen = 'comercio'` y `estado = 'Pendiente'`; no puede leer ni modificar nada.
- Leer, editar y borrar requiere usuario autenticado.
- El formulario público muestra una leyenda de privacidad: los datos se usan solo para organizar la capacitación.

## Despliegue

Al ser una SPA con rutas, el hosting debe redirigir todas las rutas a `index.html`:

- **Netlify:** crear archivo `public/_redirects` con `/* /index.html 200`
- **Vercel:** funciona directo con el preset de Vite
- Recordá cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como variables de entorno del hosting.

El QR apunta automáticamente a `https://TU-DOMINIO/registro` según el dominio donde esté publicada la app.
