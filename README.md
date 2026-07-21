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
   - **Si ya tenías la base creada de antes**, no vuelvas a correr `schema.sql`: ejecutá [`supabase/migracion-ia.sql`](supabase/migracion-ia.sql), que solo agrega las columnas nuevas (`sabe_prompt`, `interes_incorporar_ia`, `recomendaciones_ia`) sin tocar los datos existentes. Se puede correr más de una vez sin problema.
3. En **Authentication → Users → Add user**, creá los usuarios del equipo relevador (email + contraseña). Cualquier usuario autenticado es tratado como relevador.
   - Sugerencia: en **Authentication → Sign In / Up**, desactivá "Allow new users to sign up" para que nadie pueda registrarse por su cuenta.

### 2. Configurar la aplicación

```bash
# copiar la plantilla de variables de entorno
copy .env.example .env.local
```

Editá `.env.local` y completá con los datos de **Settings → API** de tu proyecto Supabase:

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

### 4. Activar las funciones de IA (Edge Function + OpenRouter)

La app usa un modelo de lenguaje para dos cosas: recomendar cómo cada comercio puede empezar a usar IA, y un asistente que explica qué es la IA y qué es un prompt. **La API key nunca va al frontend**: vive como secreto del backend y todas las llamadas salen desde la Edge Function [`supabase/functions/ia`](supabase/functions/ia/index.ts).

```bash
# 1. Instalar la CLI de Supabase (una sola vez)
npm install -g supabase

# 2. Iniciar sesión y vincular con tu proyecto
supabase login
supabase link --project-ref TU-PROJECT-REF     # está en Settings → General

# 3. Cargar la API key de OpenRouter como secreto del backend
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...

# 4. Desplegar la función
supabase functions deploy ia
```

La key se saca de [openrouter.ai/keys](https://openrouter.ai/keys) y requiere una cuenta con crédito cargado.

#### Elegir el modelo

Por defecto usa `openai/gpt-4o-mini`. Para cambiarlo no hace falta tocar código, es otro secreto:

```bash
supabase secrets set MODELO_IA=google/gemini-flash-1.5
supabase functions deploy ia          # volver a desplegar para tomar el cambio
```

El catálogo con precios actualizados está en [openrouter.ai/models](https://openrouter.ai/models). Un detalle a tener en cuenta: la generación de recomendaciones pide la respuesta en JSON, y **no todos los modelos respetan el modo JSON igual de bien**. La función contempla las respuestas envueltas en ```` ```json ```` o con texto alrededor, pero si cambiás a un modelo muy chico y las recomendaciones dejan de aparecer, es el primer lugar donde mirar. El asistente del chat no tiene este problema porque devuelve texto libre.

#### Usar OpenAI directo en vez de OpenRouter

La función soporta los dos: si en lugar de `OPENROUTER_API_KEY` cargás `OPENAI_API_KEY`, pega contra la API de OpenAI sin ningún otro cambio. Si están las dos, gana OpenRouter.

**Mientras la función no esté desplegada, la app sigue funcionando igual**: la encuesta se guarda normalmente, solo que no se muestran ni guardan recomendaciones, y el asistente avisa que no está disponible. Nada se rompe ni se pierde.

Para ver los errores de la función: **Dashboard → Edge Functions → ia → Logs**.

#### Privacidad de los datos enviados a OpenAI

A OpenAI se le mandan **solo los datos del negocio** (rubro, empleados, uso de IA, software, acceso a internet, interés). **No se envía ningún dato personal**: ni nombre, ni email, ni teléfono, ni dirección. El recorte está definido en `CAMPOS_RELEVANTES` dentro de [`src/lib/ia.js`](src/lib/ia.js).

## Funciones de IA

| Función | Dónde se ve | Qué hace |
|---|---|---|
| Recomendaciones automáticas | Al enviar la encuesta pública, y en el detalle del panel | Genera 2-3 ideas concretas y alineadas al rubro sobre cómo ese comercio puede empezar a usar IA. Se guardan en la columna `recomendaciones_ia`. |
| Asistente educativo | Botón "¿No sabés qué es la IA o un prompt?" en la encuesta pública | Mini chat que explica en criollo qué es la IA, qué es un prompt y para qué sirve en un comercio. |

En el flujo del relevador las recomendaciones se generan en segundo plano (no lo hacen esperar) y quedan visibles después en el detalle, donde además hay un botón para volver a generarlas.

## Pantallas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | **Pantalla de inicio: "Generar nueva encuesta".** Muestra el código QR hacia `/registro` con descarga PNG, impresión y copia del link, más los accesos a la carga manual y al panel |
| `/registro` | Público (QR) | Formulario de autocarga del comercio, sin login |
| `/login` | Público | Inicio de sesión. Ya no es la puerta de entrada: aparece solo al intentar abrir una pantalla protegida, y después del ingreso devuelve a la pantalla que se había pedido |
| `/panel` | Relevador | Métricas, listado con buscador y filtros (rubro, IA, estado, origen), exportación CSV |
| `/panel/:id` | Relevador | Detalle completo de un relevamiento, edición y eliminación |
| `/carga` | Relevador | Formulario de carga interna (incluye estado y observaciones) |
| `/qr` | — | Redirige a `/`: la pantalla de QR se fusionó con el inicio |

La app abre en `/` sin pedir nada, para que generar y compartir la encuesta no tenga fricción. El login protege únicamente las pantallas que muestran datos de contacto de las personas (`/panel`, `/panel/:id`) y la carga interna (`/carga`, que además necesita sesión porque el RLS solo permite guardar con `origen = 'relevador'` a usuarios autenticados).

## Seguridad de datos

- La tabla usa **Row Level Security**: el rol anónimo (formulario público) solo puede **insertar** registros con `origen = 'comercio'` y `estado = 'Pendiente'`; no puede leer ni modificar nada.
- Leer, editar y borrar requiere usuario autenticado.
- El formulario público muestra una leyenda de privacidad: los datos se usan solo para organizar la capacitación.

## Despliegue

**Producción: https://comerc-ia-vert.vercel.app** — proyecto de Vercel conectado al repo; cada push a `main` redespliega solo. El archivo [`vercel.json`](vercel.json) redirige todas las rutas al `index.html` para que los links directos y el QR funcionen.

Al ser una SPA con rutas, el hosting debe redirigir todas las rutas a `index.html`:

- **Netlify:** crear archivo `public/_redirects` con `/* /index.html 200`
- **Vercel:** funciona directo con el preset de Vite
- Recordá cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como variables de entorno del hosting.
- La key de OpenRouter **no** va en el hosting: vive en Supabase como secreto de la Edge Function.

El QR apunta automáticamente a `https://TU-DOMINIO/registro` según el dominio donde esté publicada la app.
