export const RUBROS = [
  'Gastronomía',
  'Indumentaria',
  'Almacén/Kiosco',
  'Servicios profesionales',
  'Salud/Estética',
  'Tecnología',
  'Educación',
  'Turismo',
  'Otro',
]

export const EMPLEADOS_OPCIONES = ['1', '2 a 5', '6 a 10', '11 a 50', 'Más de 50']

export const HERRAMIENTAS_IA = [
  'ChatGPT',
  'Copilot',
  'Gemini',
  'Canva IA',
  'Herramientas de diseño',
  'Chatbots',
  'Otras',
]

export const NIVELES_CONOCIMIENTO = ['Ninguno', 'Básico', 'Intermedio', 'Avanzado']

export const INTERES_OPCIONES = ['Sí', 'No', 'Tal vez']

export const PROMPT_OPCIONES = ['Sí', 'No', 'Más o menos']

export const SOFTWARE_OPCIONES = [
  'Sistema de ventas/facturación',
  'Gestión de stock',
  'Punto de venta (POS)',
  'Planilla de cálculo',
  'Ninguno',
  'Otro',
]

export const ESTADOS = ['Pendiente', 'Relevado', 'Capacitado']

export const REGISTRO_VACIO = {
  nombre_comercio: '',
  rubro: '',
  rubro_otro: '',
  direccion: '',
  telefono_local: '',
  web_redes: '',
  empleados: '',
  contacto_nombre: '',
  contacto_cargo: '',
  contacto_email: '',
  contacto_telefono: '',
  usa_ia: null,
  herramientas_ia: [],
  herramientas_ia_otras: '',
  ia_para_que: '',
  nivel_conocimiento: '',
  sabe_prompt: '',
  interes_incorporar_ia: '',
  interes_capacitacion: '',
  tiene_internet: null,
  software_gestion: [],
  software_gestion_otro: '',
  proveedores_sistema: null,
  proveedores_cual: '',
  consultas_tecnologia: '',
  estado: 'Pendiente',
  observaciones: '',
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
