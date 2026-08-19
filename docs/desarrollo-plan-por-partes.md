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
