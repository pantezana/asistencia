# Especificacion funcional: preguntas interactivas y nube de respuestas

## 1. Objetivo

Agregar al sistema **Asistencia** una funcionalidad de interaccion en vivo para eventos, inspirada en dinamicas tipo Mentimeter.

El objetivo es permitir que, durante una exposicion, taller, clase o sesion de un evento, el organizador publique una pregunta para los participantes, reciba respuestas desde celulares o computadoras y visualice en tiempo real una nube de palabras o respuestas donde los terminos mas repetidos aparecen con mayor tamaño.

Esta funcionalidad debe reutilizar la base existente de eventos, participantes y asistencias, pero no debe confundirse con el formulario de asistencia. Es un modulo nuevo de **participacion interactiva del evento**.

## 2. Principios de diseño

- Cada pregunta pertenece a un evento.
- Una pregunta puede asociarse opcionalmente a una sesion del evento, pero la validacion inicial de acceso se hara a nivel de evento.
- Solo podran responder participantes que ya tengan asistencia registrada en alguna sesion del evento.
- La identificacion publica se hara por tipo y numero de documento.
- El sistema debe guardar respuestas individuales y agregados para permitir dinamicas futuras.
- Cada pregunta tendra dos enlaces independientes:
  - Enlace para participante.
  - Enlace para administrador/presentador.
- La experiencia del participante debe ser simple, movil, rapida y sin login administrativo.
- La experiencia del presentador debe estar optimizada para proyectarse en pantalla grande.

## 3. Alcance funcional inicial

### Incluido

- Crear preguntas interactivas dentro de un evento.
- Editar preguntas.
- Activar, cerrar o archivar preguntas.
- Configurar si una pregunta permite una o varias respuestas por participante.
- Configurar el numero maximo de conceptos seleccionables por participante sobre la nube total.
- Generar enlace publico para participante.
- Generar enlace de visualizacion para administrador/presentador.
- Validar participante por numero de documento.
- Confirmar que el participante haya asistido o este registrado en asistencia del evento.
- Redirigir al formulario de asistencia del evento si el participante no tiene asistencia registrada.
- Registrar respuestas individuales.
- Calcular respuestas repetidas y frecuencias.
- Mostrar nube de respuestas en vista de presentador.
- Actualizar la nube de manera dinamica mientras llegan respuestas.
- Permitir que el participante seleccione conceptos desde la nube visible en su enlace publico, cuando el administrador habilite esa dinamica.
- Guardar las selecciones personales de conceptos por participante y pregunta.

### No incluido en la primera version

- Encuestas de opcion multiple.
- Ranking, votaciones, quiz o respuestas correctas.
- Moderacion avanzada de contenido.
- Analisis semantico o agrupacion por sinonimos.
- Control de tiempo con cronometro.
- Exportacion avanzada de respuestas.

Estas capacidades pueden agregarse despues usando el mismo modelo base de preguntas y respuestas.

## 4. Conceptos principales

### 4.1 Pregunta interactiva

Entidad configurada por el administrador o supervisor dentro de un evento.

Campos funcionales sugeridos:

- Evento.
- Sesion asociada opcional.
- Titulo o texto de la pregunta.
- Descripcion opcional.
- Tipo de interaccion.
- Estado.
- Permite multiples respuestas por participante.
- Maximo de caracteres por respuesta.
- Numero de conceptos seleccionables por participante.
- Modo de normalizacion de respuestas.
- Enlace corto de participante.
- Enlace de presentador.
- Fecha de creacion.
- Usuario creador.

Para la primera version, el tipo de interaccion sera:

`word_cloud`

Mas adelante se podran agregar tipos como:

- `open_text`
- `multiple_choice`
- `rating`
- `quiz`
- `prioritization`

### 4.2 Respuesta individual

Registro de una respuesta enviada por un participante identificado.

Debe guardar:

- Pregunta.
- Evento.
- Participante.
- Documento usado para identificacion.
- Texto original enviado.
- Texto normalizado.
- Estado de la respuesta.
- Fecha y hora de envio.
- Informacion tecnica basica opcional: user agent, IP anonimizada o hash de dispositivo.

Guardar la respuesta individual es obligatorio porque luego se quieren hacer mas acciones y dinamicas con esas palabras.

### 4.3 Agregado de respuestas

Representa la cantidad de repeticiones por palabra o respuesta normalizada.

Ejemplo:

| Respuesta original | Normalizada | Conteo |
| --- | --- | --- |
| Bosque | bosque | 5 |
| bosque | bosque | 5 |
| BOSQUES | bosques | 2 |

Para la primera version se recomienda agrupar por texto completo normalizado, no partir frases automaticamente en palabras. Si el evento quiere una nube de una sola palabra, la UI debe recomendar respuestas cortas.

### 4.4 Editabilidad de preguntas

La pregunta interactiva debe poder editarse desde la gestion del evento, pero no todos sus campos tienen la misma regla de modificacion.

La regla profesional recomendada es diferenciar entre:

- Campos de configuracion operativa: pueden cambiarse en cualquier momento porque no alteran la identidad publica ni el significado historico de las respuestas.
- Campos de identidad de pregunta: solo pueden cambiarse mientras la pregunta no tenga respuestas registradas.

Campos editables en cualquier momento:

- Sesion asociada.
- Descripcion.
- Maximo de caracteres por respuesta.
- Permitir mas de una respuesta.
- Maximo de respuestas por participante.

Campos editables solo si la pregunta no tiene respuestas registradas:

- Texto de la pregunta.
- Enlace corto de participante.

Justificacion:

- El texto de la pregunta define el contexto semantico de las respuestas. Si se cambia despues de recibir respuestas, la nube y los reportes pueden quedar historicamente inconsistentes.
- El enlace corto de participante puede estar distribuido por QR, WhatsApp, correo o presentacion. Si se cambia despues de recibir respuestas, se puede romper la trazabilidad de la dinamica ya ejecutada.
- La descripcion, sesion y reglas operativas pueden ajustarse durante la actividad sin invalidar las respuestas ya guardadas.

La validacion debe basarse en el conteo de respuestas activas de la pregunta. Si `response_count > 0`, el sistema debe bloquear cambios en texto de pregunta y enlace corto.

La interfaz debe mostrar esos campos como solo lectura o deshabilitados cuando ya existen respuestas, junto con una indicacion breve:

`Este campo no puede modificarse porque la pregunta ya tiene respuestas registradas.`

### 4.5 Seleccion personal de conceptos desde la nube

Ademas de registrar respuestas, una pregunta interactiva puede habilitar una segunda dinamica: que cada participante seleccione conceptos desde la nube total de respuestas.

Objetivo funcional:

- Permitir que el facilitador diga, por ejemplo: "Ahora, de toda la nube generada por el grupo, elige los 5 conceptos que mejor responden la pregunta".
- La seleccion no esta limitada a los conceptos escritos por el propio participante. Puede seleccionar conceptos generados por cualquier participante, porque la seleccion se hace sobre la nube total.
- Cada seleccion es personal, por participante y por pregunta.
- Las selecciones deben guardarse para reportes y dinamicas posteriores.

Campo de configuracion:

`max_selectable_concepts`

Nombre visible en el formulario administrativo:

`Numero de seleccionables`

Reglas del campo:

- Debe existir tanto al crear como al editar una pregunta interactiva.
- Solo acepta numeros enteros.
- Debe ser mayor o igual que 1 cuando se quiera usar la dinamica de seleccion.
- Valor recomendado por defecto: `5`.
- Puede editarse en cualquier momento porque es una regla operativa.
- Si se reduce por debajo de selecciones ya registradas, no se deben eliminar selecciones existentes automaticamente. La nueva regla debe impedir agregar mas selecciones hasta que el participante quite selecciones y quede dentro del limite vigente.

Relacion con `Ver nube participante`:

- La nube y la seccion de seleccionables forman un solo bloque visual y funcional.
- Si `Ver nube participante` esta activo, el enlace del participante muestra:
  - nube total interactiva;
  - seccion de conceptos seleccionados personales.
- Si `Dejar de ver nube participante` esta activo, el enlace del participante oculta ambos elementos:
  - nube;
  - seleccionables personales.
- La aparicion y ocultamiento debe ser dinamica, sin que el participante recargue la pagina.

Comportamiento de seleccion:

- Cada elemento de la nube debe ser clicable.
- Al hacer clic en un concepto de la nube:
  - si aun no esta seleccionado por ese participante, se agrega a la seccion inferior de seleccionables;
  - si ya esta seleccionado, no debe duplicarse.
- Cada concepto seleccionado debe mostrarse como una caja centrada, con estilo similar a las respuestas personales registradas, pero con color diferenciado.
- Cada caja seleccionada debe incluir una accion de quitar, representada por una `X`.
- Al hacer clic en la `X`, el concepto se desselecciona y se actualiza la persistencia.
- La seccion de seleccionables debe organizarse en fila, centrada y con ajuste automatico de linea solo si no hay espacio horizontal.

Regla de limite:

- El participante puede seleccionar hasta `max_selectable_concepts`.
- Si intenta seleccionar un concepto adicional superando el limite, el sistema debe bloquear la accion y mostrar un mensaje breve.
- Mensaje sugerido:

`Ya seleccionaste el maximo de conceptos permitidos.`

Persistencia:

- Las selecciones deben guardarse en base de datos por:
  - pregunta;
  - evento;
  - participante;
  - concepto normalizado;
  - texto visible del concepto seleccionado;
  - orden de seleccion;
  - fecha y hora.
- Si el participante sale del enlace y vuelve a identificarse, deben cargarse sus selecciones previas.
- Si la nube esta visible para participantes, las selecciones previas deben mostrarse inmediatamente al cargar la seccion de respuestas.

Validacion:

- Solo puede seleccionar un concepto quien ya este identificado y tenga asistencia registrada en el evento.
- Solo se pueden seleccionar conceptos existentes en la nube total de la pregunta.
- La validacion del limite debe aplicarse en frontend y backend.
- La eliminacion tambien debe validarse por pregunta y participante, para impedir modificar selecciones de otro participante.

## 5. Estados de la pregunta

Estados sugeridos:

- `draft`: pregunta creada, todavia no publicada.
- `open`: acepta respuestas.
- `closed`: no acepta nuevas respuestas, pero la nube puede seguir visible.
- `archived`: no aparece como activa en gestion normal.

Reglas:

- Solo preguntas `open` aceptan respuestas.
- Preguntas `closed` pueden mantener visible la nube para exposicion o revision.
- Preguntas `archived` no deben aceptar respuestas ni mostrarse como vigentes.

## 6. Enlaces publicos

### 6.1 Enlace para participante

Formato sugerido:

`https://asistencia.anteru.workers.dev/q/{slugParticipante}`

Funcion:

1. Muestra nombre del evento y pregunta.
2. Solicita tipo y numero de documento.
3. Valida si el documento corresponde a un participante.
4. Valida si ese participante tiene asistencia registrada en alguna sesion del evento.
5. Si esta registrado en el evento, muestra bienvenida con nombre.
6. Permite ver y responder la pregunta.
7. Si no esta registrado en el evento, muestra mensaje y boton hacia el enlace de asistencia del evento.

Mensaje sugerido si no esta registrado:

`No encontramos una asistencia registrada para este evento. Para participar, primero registre su asistencia.`

Accion sugerida:

`Ir al formulario de asistencia`

### 6.2 Enlace para administrador/presentador

Formato sugerido:

`https://asistencia.anteru.workers.dev/q/p/{slugPresentador}`

Funcion:

1. Muestra la pregunta en la parte superior.
2. Muestra la nube de respuestas en pantalla amplia.
3. Actualiza las respuestas dinamicamente.
4. Puede usarse en proyector o pantalla compartida.

Por seguridad, este enlace debe ser distinto al enlace de participante y tener un token no predecible. No debe permitir responder.

Decision recomendada:

- En MVP, el enlace de presentador puede ser un enlace publico con token secreto largo.
- En una fase posterior, se puede exigir login administrativo para gestionar o abrir configuraciones, manteniendo la vista de proyeccion por token.

## 7. Validacion de participante

El acceso del participante no se basa solo en existir en la base general de participantes.

Regla correcta:

Un participante puede responder una pregunta de un evento solo si cumple ambas condiciones:

1. Existe en la base general de participantes.
2. Tiene al menos una asistencia registrada en el evento de la pregunta.

Consulta conceptual:

```text
participant.document_type = tipo_documento
participant.document_number = numero_documento
AND attendance_records.event_id = pregunta.event_id
AND attendance_records.participant_id = participant.id
```

No se requiere que haya asistido a la sesion especifica de la pregunta, salvo que en una version posterior se active la regla `require_session_attendance`.

## 8. Registro de respuestas

### 8.1 Pregunta con respuesta unica

Si `allow_multiple_responses = false`:

- El participante solo puede registrar una respuesta para esa pregunta.
- Si intenta responder nuevamente, el sistema debe mostrar su respuesta anterior.
- Se recomienda permitir reemplazar la respuesta solo si la pregunta tiene configuracion `allow_response_update = true`.
- En MVP, la regla mas simple es bloquear la segunda respuesta.

Mensaje sugerido:

`Ya registraste una respuesta para esta pregunta.`

### 8.2 Pregunta con multiples respuestas

Si `allow_multiple_responses = true`:

- El participante puede registrar mas de una respuesta.
- Puede responder varias veces desde el mismo documento.
- Cada respuesta se guarda individualmente.
- Se puede configurar opcionalmente un limite maximo de respuestas por participante.

Campo recomendado:

`max_responses_per_participant`

Si es `null`, no hay limite practico mientras la pregunta este abierta.

## 9. Normalizacion de respuestas

La nube debe contar repeticiones de manera coherente.

Normalizacion inicial recomendada:

- Quitar espacios al inicio y final.
- Colapsar espacios multiples.
- Convertir a minusculas.
- Remover tildes para comparar.
- Mantener una version visible amigable.

Ejemplo:

| Entrada | Normalizada |
| --- | --- |
| Bosque | bosque |
| bosque | bosque |
| BOSQUE | bosque |
|  bosque   comunitario | bosque comunitario |

La respuesta original debe conservarse para auditoria y reportes.

## 10. Nube de respuestas

### 10.1 Reglas visuales

- Las respuestas con mayor frecuencia se muestran mas grandes.
- Respuestas con frecuencia baja se muestran mas pequeñas.
- La nube debe ser legible en proyector.
- Debe funcionar en escritorio, tablet y celular.
- En pantalla de presentador debe priorizarse vista limpia, sin menus administrativos.

### 10.2 Tamaños

Se recomienda calcular tamaño con escala controlada:

- Frecuencia minima: fuente pequeña legible.
- Frecuencia maxima: fuente grande.
- Usar interpolacion entre minimo y maximo.
- Evitar que una sola palabra ocupe toda la pantalla.

Ejemplo conceptual:

```text
fontSize = minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize)
```

### 10.3 Colores

Usar paleta variada y sobria.

No depender solo del color para transmitir frecuencia; el tamaño debe ser la principal señal.

### 10.4 Nube interactiva para participante

Cuando el administrador activa `Ver nube participante`, el enlace del participante debe mostrar una nube clicable.

La nube del participante debe:

- Usar el mismo resumen agregado que la nube del presentador.
- Actualizarse con polling mientras llegan nuevas respuestas.
- Mantener buen tamano y legibilidad.
- Permitir clic o toque sobre cada concepto.
- Resaltar visualmente que los conceptos son seleccionables, sin ensuciar la vista.

Debajo de la nube debe mostrarse la seccion:

`Conceptos seleccionados`

Esta seccion debe:

- Mostrar solo selecciones del participante identificado.
- Usar cajas horizontales, centradas y con ajuste responsivo.
- Tener color diferenciado respecto a las respuestas personales registradas.
- Incluir una `X` para quitar cada concepto.
- Cargarse automaticamente si el participante ya habia seleccionado conceptos antes.

Nube y seleccionables forman un solo elemento grafico. El control administrativo `Ver nube participante` / `Dejar de ver nube participante` debe mostrar u ocultar ambos.

## 11. Actualizacion en tiempo real

Opciones tecnicas compatibles con Cloudflare Workers:

### Opcion recomendada para MVP: polling liviano

La vista de presentador consulta cada 2 a 5 segundos:

`GET /api/public/questions/{presenterSlug}/responses-summary`

Ventajas:

- Simple.
- Robusta.
- Facil de depurar.
- Suficiente para eventos pequenos y medianos.

### Opcion posterior: Server-Sent Events

SSE puede ofrecer actualizacion mas fluida, pero requiere mas cuidado en Workers y limites de conexiones.

### Opcion posterior: WebSocket o Durable Objects

Recomendable solo si se requiere interaccion de alta concurrencia o actualizacion instantanea real.

Decision inicial:

Implementar polling. Diseñar API de manera que pueda migrarse luego a SSE/Durable Objects sin cambiar el modelo de datos.

## 12. Gestion administrativa

Dentro de la pantalla del evento debe agregarse una seccion:

`Preguntas interactivas`

Acciones:

- Crear pregunta.
- Editar pregunta.
- Abrir pregunta.
- Cerrar pregunta.
- Archivar pregunta.
- Copiar enlace de participante.
- Copiar enlace de presentador.
- Abrir vista participante.
- Abrir vista presentador.
- Ver conteo de respuestas.

Campos del formulario administrativo:

- Texto de la pregunta.
- Descripcion opcional.
- Tipo: nube de palabras.
- Asociar a sesion opcional.
- Permitir multiples respuestas: si/no.
- Maximo de respuestas por participante.
- Maximo de caracteres por respuesta.
- Numero de seleccionables.
- Estado.
- Slug participante.
- Slug presentador.

Reglas de edicion en el formulario administrativo:

- El boton `Editar` debe abrir los mismos campos configurables de la pregunta.
- Si la pregunta no tiene respuestas, todos los campos definidos para edicion pueden modificarse.
- Si la pregunta ya tiene una o mas respuestas activas:
  - `Texto de la pregunta` debe mostrarse deshabilitado o como solo lectura.
  - `Slug participante` o `enlace corto de pregunta` debe mostrarse deshabilitado o como solo lectura.
  - Los demas campos deben quedar editables.
- El sistema debe mostrar el conteo de respuestas cerca de la pregunta para que el usuario entienda por que algunos campos estan bloqueados.
- La validacion debe aplicarse tambien en API/backend, no solo en frontend.
- Si el usuario intenta modificar por API un campo bloqueado, la respuesta debe ser `400` con un mensaje claro.
- El campo `Numero de seleccionables` debe estar disponible en registro y edicion de pregunta.
- `Numero de seleccionables` es editable en cualquier momento y solo debe aceptar numeros enteros.

Mensaje recomendado:

`No se puede modificar la pregunta ni el enlace corto porque ya existen respuestas registradas.`

Controles administrativos adicionales:

- `Ver nube participante`: muestra en el enlace del participante el bloque completo de nube total mas seleccionables personales.
- `Dejar de ver nube participante`: oculta el bloque completo de nube total mas seleccionables personales.

Cuando el bloque esta visible, la nube debe ser interactiva para el participante. Cuando esta oculto, no debe verse ni la nube ni las selecciones personales.

## 13. Permisos

### Administrador

- Puede ver y gestionar preguntas de todos los eventos.
- Puede abrir/cerrar preguntas de cualquier evento.
- Puede ver respuestas de cualquier evento.

### Supervisor

- Puede gestionar preguntas solo de sus propios eventos.
- Puede abrir/cerrar preguntas solo de sus propios eventos.
- Puede ver respuestas solo de sus propios eventos.

### Participante

- No requiere login.
- Solo accede por enlace publico.
- Debe identificarse con documento.
- Solo puede responder si tiene asistencia registrada en el evento.

## 14. Modelo de datos sugerido

### `event_questions`

```text
id
event_id
session_id nullable
question_text
description nullable
interaction_type
status
allow_multiple_responses
allow_response_update
max_responses_per_participant nullable
max_answer_length
max_selectable_concepts
show_participant_cloud
participant_slug unique
presenter_slug unique
created_by_user_id
created_at
updated_at
```

### `event_question_selections`

Tabla para guardar los conceptos priorizados o seleccionados por cada participante desde la nube total.

```text
id
question_id
event_id
participant_id
document_type
document_number
normalized_answer
display_answer
selection_order
status
created_at
updated_at
```

Reglas de datos:

- `question_id`, `participant_id`, `normalized_answer` no deben duplicarse en estado `active`.
- `selection_order` representa el orden en que el participante fue seleccionando conceptos.
- `status` permite manejar `active` y `removed` sin perder auditoria basica.
- `display_answer` debe guardar la forma visible del concepto al momento de seleccionarlo.
- `normalized_answer` debe corresponder al mismo valor usado por la nube para agrupar respuestas.

### `event_question_responses`

```text
id
question_id
event_id
participant_id
document_type
document_number
answer_text
normalized_answer
status
created_at
updated_at
```

### `event_question_response_aggregates`

Tabla opcional para rendimiento.

```text
id
question_id
normalized_answer
display_answer
response_count
last_response_at
updated_at
```

Decision recomendada:

- Guardar siempre `event_question_responses`.
- Para MVP, calcular agregados con consulta SQL agrupada.
- Si el volumen crece, crear y mantener `event_question_response_aggregates`.

## 15. APIs sugeridas

### Administrativas

```text
GET    /api/admin/events/:eventId/questions
POST   /api/admin/events/:eventId/questions
GET    /api/admin/questions/:questionId
PUT    /api/admin/questions/:questionId
POST   /api/admin/questions/:questionId/open
POST   /api/admin/questions/:questionId/close
POST   /api/admin/questions/:questionId/archive
GET    /api/admin/questions/:questionId/responses
GET    /api/admin/questions/:questionId/summary
POST   /api/admin/events/:eventId/questions/:questionId/participant-cloud
```

### Publicas participante

```text
GET  /api/public/questions/:participantSlug
POST /api/public/questions/:participantSlug/identify
POST /api/public/questions/:participantSlug/responses
GET  /api/public/questions/:participantSlug/summary
GET  /api/public/questions/:participantSlug/selections
POST /api/public/questions/:participantSlug/selections
DELETE /api/public/questions/:participantSlug/selections/:selectionId
```

Observacion:

- En endpoints publicos de seleccion, el participante debe identificarse mediante documento o mediante un token temporal de identificacion si se incorpora en una version posterior.
- Para mantener coherencia con el flujo actual, la primera implementacion puede enviar `documentType` y `documentNumber` en cada accion de seleccion/desseleccion y validar nuevamente asistencia.
- El backend debe validar que el concepto seleccionado exista en el resumen agrupado de la pregunta.

### Publicas presentador

```text
GET /api/public/question-presenter/:presenterSlug
GET /api/public/question-presenter/:presenterSlug/summary
```

## 16. Flujo del participante

1. Participante abre enlace o QR de pregunta.
2. Sistema muestra evento y pregunta.
3. Sistema solicita tipo y numero de documento.
4. Participante envia documento.
5. Sistema valida participante.
6. Sistema valida asistencia en el evento.
7. Si no tiene asistencia, muestra mensaje y boton hacia formulario de asistencia del evento.
8. Si tiene asistencia, muestra bienvenida:

`Hola, {Nombre}. Responde la pregunta del evento.`

9. Participante escribe respuesta.
10. Sistema valida longitud, estado de pregunta y regla de multiples respuestas.
11. Sistema guarda respuesta individual.
12. Sistema confirma envio.
13. Si `show_participant_cloud = true`, sistema muestra debajo de las respuestas personales el bloque de nube total mas seleccionables personales.
14. Participante puede hacer clic en conceptos de la nube para agregarlos a sus seleccionables.
15. Participante puede quitar conceptos seleccionados con la accion `X`.
16. El sistema guarda y recarga selecciones personales.

## 17. Flujo del presentador

1. Administrador abre enlace de presentador.
2. Sistema muestra pregunta en la parte superior.
3. Sistema carga resumen inicial.
4. Cada 2 a 5 segundos consulta nuevas frecuencias.
5. La nube se redibuja con tamaños proporcionales.
6. Si la pregunta se cierra, la vista muestra estado cerrado, pero conserva la nube.

## 18. UX movil del participante

La pantalla participante debe:

- Cargar rapido.
- Tener formulario de documento simple.
- Mostrar una sola pregunta clara.
- Usar textarea o input amplio.
- Boton principal visible.
- Mensajes breves.
- No tener menus administrativos.
- Si la nube participante esta visible, mostrar la nube con buen tamano y legibilidad.
- Mostrar las selecciones personales debajo de la nube, centradas y en fila.
- Permitir seleccionar y quitar conceptos con controles tactiles comodos.

Debe ser comoda en celular durante un evento presencial.

## 19. UX de presentador

La pantalla presentador debe:

- Tener fondo limpio.
- Mostrar pregunta como titulo principal.
- Dar protagonismo a la nube.
- Evitar barras laterales o controles innecesarios.
- Tener modo pantalla completa visual.
- Mostrar contador pequeño de respuestas.
- Actualizar sin recargar pagina.

## 20. Reportes y uso posterior

Como se guardan respuestas individuales, luego se podran crear:

- Exportacion por pregunta.
- Exportacion por participante.
- Comparacion de respuestas por sesion.
- Analisis de participacion.
- Dinamicas posteriores con palabras registradas.
- Priorizacion individual de conceptos seleccionados desde la nube total.
- Ranking de conceptos mas seleccionados por los participantes.
- Comparacion entre conceptos mas mencionados y conceptos mas priorizados.
- Moderacion posterior.
- Indicadores de frecuencia.

## 21. Reglas y casos borde

- Si la pregunta no existe: mostrar `Pregunta no disponible`.
- Si la pregunta esta `draft`: no debe ser accesible publicamente.
- Si la pregunta esta `closed`: participante no puede responder, pero presentador puede ver nube.
- Si participante existe pero no tiene asistencia del evento: redirigir al formulario de asistencia.
- Si el evento no tiene enlace de asistencia activo: mostrar mensaje de contacto con organizador.
- Si una pregunta no permite multiples respuestas y el participante ya respondio: bloquear nuevo envio.
- Si respuesta vacia: bloquear envio.
- Si supera maximo de caracteres: bloquear envio.
- Si hay respuestas repetidas con diferencias de mayusculas o tildes: agrupar por normalizacion.
- Si se edita una pregunta sin respuestas: permitir modificar texto, enlace corto y configuracion operativa.
- Si se edita una pregunta con respuestas: bloquear cambios en texto de pregunta y enlace corto, pero permitir cambios operativos.
- Si se cambia el maximo de caracteres a un valor menor que respuestas ya registradas: no se modifican respuestas existentes; la nueva longitud aplica solo a respuestas futuras.
- Si se desactiva la opcion de multiples respuestas cuando ya existen varias respuestas de un participante: no se eliminan respuestas existentes; la nueva regla aplica a nuevos envios.
- Si `Numero de seleccionables` esta vacio o no es numero: bloquear guardado de pregunta.
- Si `Numero de seleccionables` es menor que 1: bloquear guardado o normalizar al valor minimo permitido, recomendado bloquear.
- Si el participante intenta seleccionar mas conceptos que el maximo configurado: bloquear seleccion y mostrar mensaje.
- Si el participante selecciona un concepto ya seleccionado: no duplicar.
- Si el participante quita un concepto, debe desaparecer de sus seleccionables pero no de la nube total.
- Si se oculta la nube participante desde administracion mientras un participante la esta viendo: debe ocultarse tambien la seccion de seleccionables en el siguiente ciclo de actualizacion.
- Si se vuelve a mostrar la nube participante: deben recargarse las selecciones personales previas del participante.
- Si se reduce `Numero de seleccionables` por debajo de selecciones ya registradas: no eliminar datos existentes; impedir nuevas selecciones hasta que el participante quede por debajo del limite.
- Si un concepto desaparece del resumen por cambios futuros de estado de respuestas, las selecciones historicas pueden conservarse, pero no debe permitirse seleccionarlo de nuevo si ya no existe en la nube activa.

## 22. Recomendacion de implementacion por partes

### Parte A. Base de datos y APIs administrativas

- Crear tablas.
- CRUD de preguntas por evento.
- Estados de pregunta.
- Slugs de participante y presentador.
- Edicion parcial de preguntas con bloqueo de campos de identidad cuando existan respuestas.
- Campo `Numero de seleccionables`.
- Tabla de selecciones personales por participante.
- APIs para seleccionar y desseleccionar conceptos.

### Parte B. Flujo publico del participante

- Identificacion por documento.
- Validacion de asistencia en evento.
- Redireccion al formulario de asistencia.
- Registro de respuesta.
- Carga de respuestas previas del participante.
- Carga de selecciones previas del participante.
- Seleccion y desseleccion de conceptos desde la nube.

### Parte C. Vista presentador

- Endpoint de resumen.
- Nube visual.
- Polling dinamico.

### Parte D. Integracion administrativa

- Panel dentro del evento.
- Botones copiar/abrir enlaces.
- Conteo de respuestas.
- Control para ver u ocultar nube participante.
- Configuracion de numero de seleccionables.

### Parte E. Mejoras posteriores

- QR por pregunta.
- Exportacion de respuestas.
- Moderacion.
- SSE o Durable Objects para tiempo real mas fluido.
- Nuevos tipos de interaccion.

## 23. Decision funcional recomendada

La funcionalidad debe llamarse en el sistema:

`Preguntas interactivas`

El primer tipo de pregunta debe llamarse:

`Nube de palabras`

Esto deja espacio para que el modulo crezca sin quedar limitado solo a nubes.

## 24. Pendientes de aprobacion antes de desarrollo

Antes de iniciar implementacion se debe confirmar:

1. Si el enlace de presentador sera publico con token secreto o exigira login administrativo.
2. Si una pregunta puede asociarse a una sesion especifica o solo al evento.
3. Si en MVP una respuesta unica puede editarse o queda bloqueada luego del primer envio.
4. Longitud maxima inicial de respuesta.
5. Intervalo de actualizacion de la nube: recomendado 3 segundos.
6. Si se generara QR tambien para cada pregunta desde la primera version.
