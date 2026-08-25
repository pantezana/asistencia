# Plan de Desarrollo por Partes

## Parte 1. Base técnica

Objetivo:

- Crear estructura del proyecto.
- Configurar frontend React/Vite.
- Configurar backend Cloudflare Worker.
- Configurar Wrangler.
- Preparar migraciones D1 iniciales.
- Dejar build y typecheck funcionando.

Estado: en desarrollo.

## Parte 2. Autenticación y roles

Objetivo:

- Login administrativo.
- Hash seguro de contraseñas.
- Sesiones seguras.
- Roles administrador y supervisor.
- Protección de rutas API.

Estado: implementado inicialmente.

## Parte 3. Gestión de eventos

Objetivo:

- CRUD de eventos.
- CRUD de módulos.
- CRUD de sesiones.
- Apertura/cierre de sesiones.
- Regla de una sola sesión abierta por evento.

## Parte 4. Formularios

Objetivo:

- CRUD de formularios.
- Clonación tipo plantilla.
- Campos y secciones configurables.
- Catálogos y selects dependientes.

## Parte 5. Registro público

Objetivo:

- Enlace corto.
- QR.
- Identificación por documento.
- Registro de participante nuevo.
- Confirmación de participante existente.
- Registro de asistencia.

## Parte 6. Reportes

Objetivo:

- Lista de asistencia por evento, módulo y sesión.
- Filtros.
- Exportación.

## Parte 7. Publicación Cloudflare

Objetivo:

- Crear D1 remoto.
- Aplicar migraciones remotas.
- Configurar variables y permisos.
- Publicar Worker API.
- Publicar Pages frontend.
- Documentar URLs finales.

## Parte 8. Editor dinamico de modelos

Objetivo:

- Gestionar una paleta reutilizable de secciones.
- Gestionar una paleta reutilizable de controles o preguntas.
- Incorporar y excluir secciones dentro de un modelo.
- Incorporar y excluir controles dentro de una seccion.
- Definir posicion al agregar secciones o controles.
- Impedir duplicados reales dentro de un mismo modelo, permitiendo reutilizar controles globales con etiquetas distintas.
- Crear el control `Rango de edad` asociado al catalogo `rangoedad`.
- Preparar versionado para modelos usados historicamente.

Documento base:

- `docs/especificacion-editor-modelos-formulario.md`

## Parte 9. Preguntas interactivas y nube de palabras

Objetivo:

- Crear preguntas interactivas por evento.
- Generar enlace de participante para responder.
- Generar enlace de presentador para visualizar resultados.
- Validar participantes contra asistencias registradas del evento.
- Registrar respuestas individuales.
- Mostrar nube de respuestas con frecuencias dinamicas.
- Preparar base para futuras dinamicas con respuestas guardadas.
- Permitir editar preguntas interactivas con bloqueo de campos de identidad cuando ya existan respuestas.
- Permitir configurar `Numero de seleccionables` por pregunta.
- Permitir que el participante seleccione conceptos desde la nube total cuando la nube participante este visible.
- Guardar selecciones personales por participante y pregunta.

Regla de edicion:

- Siempre editables: sesion asociada, descripcion, maximo de caracteres, permitir mas de una respuesta y maximo de respuestas por participante.
- Tambien editable siempre: numero de seleccionables.
- Editables solo sin respuestas registradas: texto de la pregunta y enlace corto de participante.
- La regla debe validarse en frontend y backend.

Subfase de seleccion de conceptos:

- Agregar campo numerico `Numero de seleccionables` en creacion y edicion de preguntas.
- Crear persistencia de conceptos seleccionados por participante.
- Hacer clicables los conceptos de la nube en el enlace participante.
- Mostrar seleccionables personales debajo de la nube en cajas horizontales con accion `X`.
- Respetar el limite configurado y cargar selecciones previas al reidentificarse.
- El control `Ver nube participante` debe mostrar/ocultar nube y seleccionables como un solo bloque.

Documento base:

- `docs/especificacion-interacciones-preguntas-nube-palabras.md`
