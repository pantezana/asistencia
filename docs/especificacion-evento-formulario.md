# Especificacion de relacion evento-formulario

## 1. Pregunta funcional

Un mismo conjunto de preguntas puede ser usado por muchos eventos. Esto es valido y esperado en una aplicacion de asistencia, porque muchos eventos solicitan los mismos datos generales del participante.

El sistema debe evitar confundir dos conceptos distintos:

- **Modelo de formulario:** mascara reutilizable que define secciones, campos, tipos de control, catalogos, validaciones y reglas.
- **Formulario publicado de evento:** uso concreto de un modelo dentro de un evento especifico, bajo el enlace publico y QR del evento.

## 2. Estado actual del sistema

Actualmente la tabla `forms` cumple dos responsabilidades al mismo tiempo:

- Guarda la estructura del formulario.
- Actua como formulario publicado de un evento, porque tiene `event_id` y `short_link_slug`.

La ruta publica resuelve el formulario por `short_link_slug` y desde ahi obtiene el evento asociado. Por eso, en la implementacion actual, un formulario publicado pertenece a un evento especifico.

Cuando se intenta asociar a un evento un formulario de otro evento, la logica actual copia la estructura del formulario origen y crea un nuevo formulario para el evento destino. Esto evita romper el evento origen y permite conservar el enlace y QR del evento destino.

En la practica, hoy la reutilizacion funciona por **clonacion tecnica**.

## 3. Respuesta a la duda principal

Con el modelo actual, no conviene asociar fisicamente el mismo registro `forms.id` a dos eventos distintos, porque `forms` tiene `event_id`, `short_link_slug` y estado de publicacion.

Sin embargo, desde el punto de vista funcional, dos eventos si pueden usar exactamente las mismas preguntas.

La pregunta correcta no es si dos eventos pueden compartir un `forms.id`, sino si dos eventos pueden compartir un **modelo de formulario**.

La respuesta recomendada es: **si, deben poder compartir un modelo de formulario**.

## 4. Solucion profesional recomendada

La arquitectura debe evolucionar hacia tres niveles:

### 4.1 Plantilla o modelo de formulario

Entidad reutilizable y administrable.

Responsabilidades:

- Nombre del modelo.
- Descripcion.
- Version.
- Estado: borrador, activo, archivado.
- Secciones.
- Campos.
- Tipos de control.
- Catalogos asociados.
- Reglas de obligatoriedad.
- Reglas condicionales.

Ejemplos:

- `Formulario base OTCA`
- `Formulario SERFOR Educa simplificado`
- `Formulario general de capacitaciones`
- `Formulario solo datos generales`

Este modelo no debe depender directamente de un evento ni de un enlace publico.

### 4.2 Publicacion de formulario por evento

Entidad que vincula un evento con un modelo de formulario.

Responsabilidades:

- Evento.
- Modelo de formulario usado.
- Version del modelo usada.
- Estado de publicacion.
- Slug publico del evento.
- QR del evento.
- Politica de actualizacion: sincronizado con modelo o congelado.

El enlace corto y el QR deben pertenecer al evento/publicacion, no al modelo reutilizable.

### 4.3 Asistencia registrada

Entidad transaccional.

Responsabilidades:

- Evento.
- Modulo.
- Sesion.
- Participante.
- Formulario/publicacion usada.
- Fecha y hora de registro.
- Datos capturados en el momento.

La asistencia siempre se registra contra el evento y la sesion abierta. Aunque dos eventos usen el mismo modelo de formulario, las asistencias no se mezclan.

## 5. Regla sobre el titulo dinamico

El titulo superior del formulario publico no debe vivir como texto fijo dentro del modelo de formulario.

Debe construirse dinamicamente desde:

- Evento.
- Modulo.
- Sesion abierta.
- Tema de la sesion.

Ejemplo:

`Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}`

Esto significa que el mismo modelo de formulario puede usarse en muchos eventos sin duplicarse solo por cambiar el titulo.

## 6. Reglas funcionales recomendadas

### 6.1 Reutilizar sin editar

Si un evento usa un modelo activo sin modificaciones:

- No se duplica la estructura.
- El evento queda vinculado al modelo.
- El enlace y QR del evento apuntan a la publicacion del evento.
- Las respuestas se guardan en el contexto del evento y la sesion.

### 6.2 Reutilizar y personalizar

Si un evento necesita cambiar campos, etiquetas, secciones o reglas:

- Se debe crear una nueva version del modelo, o
- Se debe crear una variante derivada del modelo.

La variante puede quedar como:

- Modelo privado del evento, si solo sirve para ese evento.
- Nuevo modelo reutilizable, si servira para eventos futuros.

### 6.3 Evitar ediciones destructivas

Si un modelo ya fue usado para registrar asistencias, no debe editarse destructivamente.

Opciones permitidas:

- Crear nueva version.
- Desactivar campos para nuevos usos.
- Crear variante.
- Mantener historial de la version usada por cada asistencia.

Esto protege reportes historicos y evita que datos antiguos queden sin interpretacion.

## 7. Esquema conceptual recomendado

Tablas sugeridas para una evolucion futura:

- `form_templates`
- `form_template_versions`
- `form_template_sections`
- `form_template_fields`
- `event_form_publications`
- `attendance_records`
- `participant_profile_data`
- `attendance_field_values` o `attendance_snapshot`

Relacion principal:

- Un `form_template` tiene muchas versiones.
- Una version tiene muchas secciones.
- Una seccion tiene muchos campos.
- Un evento tiene una publicacion activa.
- Una publicacion apunta a una version de plantilla.
- Una asistencia apunta a evento, sesion, participante y publicacion.

## 8. Regla de enlace corto y QR

El enlace corto debe identificar la publicacion del evento, no el modelo reusable.

Ejemplo:

- Evento OTCA: `/f/inauguracion-otca`
- Evento SERFOR: `/f/curso-serforeduca1`

Ambos podrian usar el mismo modelo de formulario, pero cada enlace resuelve a su propio evento y sesion abierta.

El QR siempre apunta al enlace del evento. Por lo tanto, cambiar el modelo asociado al evento no debe cambiar el enlace ni el QR.

## 9. Comportamiento esperado del selector de formulario en evento

En la pantalla de evento debe existir el control `Formulario asociado`.

Debe mostrar:

- Modelos de formulario activos.
- Nombre del modelo.
- Version.
- Cantidad de secciones y campos.
- Indicador de si esta sincronizado o personalizado.

Al guardar:

- El evento mantiene su slug.
- El QR no cambia.
- La publicacion del evento pasa a usar el modelo seleccionado.
- Las nuevas asistencias usan el nuevo modelo.
- Las asistencias anteriores conservan referencia al modelo/version usado en su momento.

## 10. Recomendacion final

La mejor solucion no es crear clones identicos para cada evento como unica forma de reutilizar preguntas.

La mejor solucion es:

1. Crear modelos de formulario reutilizables.
2. Asociar cada evento a un modelo/version.
3. Mantener el enlace y QR en el nivel del evento.
4. Registrar asistencias siempre contra evento, sesion y participante.
5. Crear variantes o nuevas versiones solo cuando el formulario necesite personalizacion real.

Esto reduce duplicacion, mantiene trazabilidad historica y permite administrar formularios de forma mas limpia y profesional.

## 11. Transicion desde el modelo actual

Mientras se implementa el modelo definitivo, la aplicacion puede seguir usando copias internas para proteger eventos existentes.

Pero a nivel de especificacion, la direccion correcta es migrar desde:

`forms por evento`

hacia:

`modelos de formulario reutilizables + publicaciones de formulario por evento`

Esta migracion debe planificarse antes de ampliar el editor avanzado de formularios.

## 12. Editor dinamico de modelos

La gestion avanzada de modelos debe permitir editar la estructura de preguntas despues de crear o clonar un modelo.

La especificacion detallada se encuentra en:

`docs/especificacion-editor-modelos-formulario.md`

Puntos clave:

- Los modelos se componen desde una paleta reutilizable de secciones y controles.
- Una pregunta existente debe poder incorporarse a un modelo sin recrearla manualmente.
- El sistema debe impedir duplicados reales dentro del mismo modelo: misma combinacion de control global y etiqueta visible normalizada.
- El mismo control global puede usarse varias veces si cada instancia representa una pregunta distinta, con etiqueta visible y clave interna propias.
- Las secciones y controles deben poder agregarse, excluirse y reordenarse.
- Al incorporar elementos debe poder indicarse posicion: inicio, final, antes o despues de otro elemento.
- Los modelos usados en asistencias deben protegerse con versionado o borradores publicados.
- El enlace corto y QR pertenecen al evento/publicacion y no deben cambiar por editar el modelo.
