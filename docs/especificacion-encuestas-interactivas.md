# Especificacion funcional: encuestas interactivas

## 1. Objetivo

Agregar al sistema **Asistencia** una nueva dinamica denominada **Encuesta Interactiva**.

La encuesta interactiva permite que el organizador configure una serie de preguntas cerradas, principalmente de eleccion unica, para que los participantes voten desde celular, tablet o computadora y vean en tiempo real la tendencia de respuestas mediante graficos de barras o graficos circulares.

El objetivo es apoyar dinamicas en vivo durante eventos, talleres, sesiones o comunidades de practica, permitiendo identificar rapidamente:

- alternativas mas votadas;
- alternativas menos votadas;
- distribucion general de opinion;
- tendencias por pregunta;
- participacion total por pregunta.

Esta funcionalidad es hermana de:

- **Preguntas interactivas / nube de palabras:** respuestas abiertas breves y agregacion textual.
- **Pizarras interactivas:** notas libres tipo post-it.
- **Encuestas interactivas:** preguntas cerradas con alternativas y resultados graficos.

## 2. Principios de diseno

- Cada encuesta pertenece a un evento.
- Una encuesta puede asociarse a todo el evento o a una sesion especifica.
- Una encuesta contiene una o muchas preguntas.
- Cada pregunta contiene dos o mas opciones de respuesta.
- Cada pregunta muestra sus resultados de forma independiente.
- El enlace publico de la encuesta debe permitir navegar entre preguntas.
- La vista publica debe mantener el estilo visual ya usado en pizarras y preguntas:
  - fondo claro/blanco;
  - nombre del evento arriba;
  - titulo principal destacado;
  - contenido centrado;
  - componentes amplios y responsivos;
  - botones claros y consistentes.
- La experiencia debe ser **movil primero**, porque la participacion ocurrira principalmente desde celulares.
- Las votaciones deben guardarse de forma individual y agregada para reportes posteriores.
- Los resultados deben actualizarse en vivo o por refresco periodico automatico.

## 3. Alcance funcional inicial

### Incluido

- Crear encuestas interactivas dentro de un evento.
- Editar encuestas interactivas.
- Asociar una encuesta a todo el evento o a una sesion.
- Configurar titulo de encuesta.
- Configurar nombre del navegador.
- Configurar enlace corto de encuesta.
- Configurar estado de encuesta.
- Agregar preguntas a la encuesta.
- Editar preguntas de la encuesta.
- Ordenar preguntas.
- Agregar, editar, ordenar, activar e inactivar opciones de respuesta.
- Configurar para cada pregunta:
  - pregunta;
  - descripcion;
  - si permite una o mas respuestas;
  - maximo de respuestas seleccionables cuando aplique;
  - tipo de grafico;
  - estado;
  - orden.
- Publicar un enlace unico para participantes.
- Mostrar una pregunta a la vez con sus resultados.
- Permitir registrar respuesta desde una vista o panel de formulario.
- Mostrar resultados en grafico de barras o circular.
- Navegar a la pregunta anterior y siguiente.
- Actualizar resultados dinamicamente.
- Guardar votos individuales.
- Calcular resultados por pregunta y opcion.

### No incluido en la primera version

- Preguntas abiertas dentro de encuestas.
- Preguntas con escala numerica o rating.
- Quiz con respuestas correctas.
- Puntajes por participante.
- Resultados segmentados por pais, organizacion u otros datos del participante.
- Login obligatorio para participantes.
- Control avanzado contra multiples dispositivos.
- Exportacion detallada de resultados.
- Temporizador por pregunta.
- Modo presentador separado.

Estas capacidades pueden agregarse en versiones posteriores.

## 4. Conceptos principales

### 4.1 Encuesta interactiva

Entidad principal que agrupa una dinamica de una o varias preguntas cerradas.

Campos funcionales:

- Evento.
- Sesion asociada opcional.
- Titulo de encuesta.
- Nombre navegador.
- Enlace corto de encuesta.
- Estado.
- Fecha de creacion.
- Usuario creador.
- Fecha de actualizacion.

Estados sugeridos:

- `draft`: configurada, aun no visible publicamente.
- `open`: visible y acepta respuestas.
- `closed`: visible, muestra resultados, pero no acepta nuevas respuestas.
- `archived`: no aparece en la gestion operativa habitual ni en enlaces publicos.

Reglas:

- Solo las encuestas `open` aceptan respuestas.
- Las encuestas `closed` pueden seguir mostrando resultados.
- Las encuestas `draft` y `archived` deben mostrar mensaje de no disponibilidad en el enlace publico.
- El enlace corto debe ser unico dentro de las encuestas.
- El nombre navegador se usa como `document.title` para diferenciar pestanas.

### 4.2 Pregunta de encuesta

Pregunta cerrada perteneciente a una encuesta.

Campos funcionales:

- Encuesta.
- Pregunta.
- Descripcion opcional.
- Permitir mas de una respuesta.
- Maximo de respuestas seleccionables.
- Tipo de grafico.
- Orden de presentacion.
- Estado.
- Fecha de creacion.
- Fecha de actualizacion.

Tipos de grafico iniciales:

- `bar`: grafico de barras.
- `pie`: grafico circular.

Nota terminologica: aunque el usuario pueda escribir "pye", internamente se recomienda usar `pie`, que es el termino tecnico habitual para grafico circular.

Reglas:

- Una pregunta debe tener minimo dos opciones activas para poder publicarse correctamente.
- Si `permitir mas de una respuesta = NO`, el participante solo puede seleccionar una opcion.
- Si `permitir mas de una respuesta = SI`, debe configurarse `maximo de respuestas seleccionables`.
- El maximo de respuestas seleccionables no puede ser mayor que la cantidad de opciones activas.
- Las preguntas inactivas no se muestran en el enlace publico.
- El orden de navegacion publica se basa en `sort_order`.

### 4.3 Opcion de respuesta

Alternativa cerrada que el participante puede seleccionar.

Campos funcionales:

- Pregunta.
- Texto visible.
- Valor interno.
- Orden.
- Estado.

Reglas:

- El texto visible es lo que se muestra al participante y en los resultados.
- El valor interno puede generarse automaticamente desde el texto, pero debe mantenerse estable para reportes.
- Las opciones inactivas no deben mostrarse para nuevas respuestas.
- Si una opcion ya tiene votos, puede inactivarse, pero no eliminarse fisicamente.
- Si se edita el texto de una opcion con votos, debe conservarse historico de votos asociados al mismo `option_id`.

### 4.4 Respuesta o voto

Registro individual enviado por un participante para una pregunta.

Debe guardar:

- Encuesta.
- Pregunta.
- Opcion seleccionada.
- Identificador de participante si existiera.
- Identificador anonimo o de sesion si no existe participante.
- Documento si en el futuro se habilita validacion documental.
- Fecha y hora de envio.
- Informacion tecnica basica opcional: user agent, hash de dispositivo o IP anonimizada.

Para la primera version se recomienda permitir participacion publica sin documento, igual que la pizarra, salvo que el negocio indique que una encuesta concreta debe restringirse a participantes registrados.

Justificacion:

- Las encuestas son dinamicas de participacion rapida.
- Pedir documento puede reducir participacion en vivo.
- En una etapa posterior se puede agregar configuracion de acceso:
  - libre;
  - registrado en base general;
  - asistente del evento.

## 5. Reglas de participacion

### 5.1 Participacion publica inicial

La primera version debe operar como enlace publico simple:

1. El participante abre el enlace de encuesta.
2. Ve el nombre del evento.
3. Ve el titulo de la encuesta.
4. Ve la pregunta actual y sus resultados.
5. Usa el boton `Registrar respuesta`.
6. El sistema muestra el formulario de opciones.
7. El participante selecciona una o mas opciones, segun regla de la pregunta.
8. Registra su respuesta.
9. El sistema vuelve a la vista de resultados de esa pregunta.
10. El participante puede avanzar a la siguiente pregunta.

### 5.2 Control de respuestas por participante

En la primera version se recomienda controlar duplicados por una combinacion pragmatica:

- `survey_id`;
- `question_id`;
- identificador anonimo persistido en `localStorage`;
- opcionalmente hash tecnico de navegador.

Reglas:

- Si la pregunta es de respuesta unica, un mismo identificador anonimo solo puede tener una respuesta activa por pregunta.
- Si la pregunta permite multiples respuestas, el mismo identificador anonimo puede seleccionar hasta el maximo configurado.
- Si el participante cambia de equipo o borra datos del navegador, el sistema no puede garantizar bloqueo perfecto sin login o documento.

Este comportamiento debe comunicarse como una limitacion aceptada de dinamicas publicas en vivo.

### 5.3 Edicion de encuesta y preguntas

Campos de encuesta editables en cualquier momento:

- Titulo.
- Nombre navegador.
- Sesion asociada.
- Estado.

Campo editable solo si no existen respuestas en toda la encuesta:

- Enlace corto de encuesta.

Campos de pregunta editables en cualquier momento:

- Descripcion.
- Tipo de grafico.
- Orden.
- Estado.

Campos editables solo si la pregunta no tiene respuestas:

- Texto de pregunta.
- Permitir mas de una respuesta.
- Maximo de respuestas seleccionables.

Justificacion:

- Cambiar la pregunta despues de recibir votos puede alterar el significado historico de resultados.
- Cambiar de respuesta unica a multiple despues de recibir votos puede hacer inconsistentes los resultados.
- Cambiar el tipo de grafico no altera los datos, solo la visualizacion.

Campos de opcion editables con cautela:

- Texto visible puede editarse, pero debe conservarse `option_id`.
- Estado puede cambiarse en cualquier momento.
- Orden puede cambiarse en cualquier momento.

Si una opcion ya tiene votos, no debe eliminarse fisicamente. Debe inactivarse.

## 6. Experiencia de usuario publica

### 6.1 Vista principal de encuesta

Ruta sugerida:

- `/s/:participantSlug`

Estructura visual:

1. Nombre del evento como texto superior pequeno.
2. Titulo de la encuesta como encabezado principal.
3. Indicador de progreso: `Pregunta 1 de N`.
4. Pregunta actual destacada.
5. Descripcion de pregunta si existe.
6. Boton principal `Registrar respuesta`.
7. Grafico de resultados, amplio y centrado.
8. Resumen numerico:
   - total de votos;
   - total de participantes estimados.
9. Navegacion:
   - `Pregunta anterior`;
   - `Siguiente pregunta`;
   - en la ultima pregunta: `Finalizar encuesta` o `Volver al inicio`.

### 6.2 Vista de registro de respuesta

Al presionar `Registrar respuesta`, se muestra un formulario en la misma pagina o en un panel modal ligero.

Debe mostrar:

- Pregunta.
- Descripcion.
- Opciones de respuesta.
- Boton `Guardar respuesta`.
- Boton `Regresar a resultados`.

Comportamiento:

- Si la pregunta es de eleccion unica, las opciones se presentan como radio buttons o tarjetas seleccionables exclusivas.
- Si la pregunta permite mas de una respuesta, las opciones se presentan como checkboxes o tarjetas multiseleccion.
- Debe mostrarse contador cuando aplique: `Seleccionadas 0 / 3`.
- El boton `Guardar respuesta` se habilita solo cuando se cumpla la seleccion minima.
- Despues de guardar, se vuelve a resultados.

### 6.3 Graficos

#### Grafico de barras

Recomendado para:

- muchas opciones;
- comparar claramente alternativas mas y menos votadas;
- pantallas moviles.

Debe mostrar:

- etiqueta de opcion;
- barra proporcional;
- cantidad de votos;
- porcentaje.

#### Grafico circular

Recomendado para:

- pocas opciones;
- vista general de distribucion;
- preguntas con 2 a 5 alternativas.

Debe mostrar:

- leyenda visible;
- porcentaje;
- cantidad de votos;
- colores distinguibles.

### 6.4 Actualizacion en vivo

La primera version puede implementar refresco automatico cada 2 a 5 segundos.

Reglas:

- La actualizacion no debe borrar seleccion actual del usuario mientras esta llenando el formulario.
- El grafico debe actualizarse sin recargar toda la pagina.
- Si la encuesta se cierra mientras el usuario esta respondiendo, al intentar guardar debe mostrarse:

`La encuesta ya fue cerrada. Puede revisar los resultados, pero ya no se reciben nuevas respuestas.`

## 7. Experiencia de administracion

La administracion debe ubicarse dentro del evento, junto a preguntas interactivas, pizarras y tablero.

### 7.1 Listado de encuestas

Por cada encuesta mostrar:

- Titulo.
- Sesion asociada o `Todo el evento`.
- Estado.
- Numero de preguntas.
- Total de votos.
- Enlace publico.
- Acciones:
  - Editar.
  - Abrir.
  - Cerrar.
  - Archivar.
  - Abrir enlace publico.

### 7.2 Creacion de encuesta

Campos:

- Titulo de encuesta.
- Nombre navegador.
- Sesion asociada:
  - `Todo el evento`;
  - lista de sesiones activas/cerradas, no inactivas.
- Enlace corto de encuesta.
- Estado inicial recomendado: `draft`.

### 7.3 Gestion de preguntas

Dentro de la encuesta debe existir un editor de preguntas.

Por pregunta:

- Pregunta.
- Descripcion.
- Permitir mas de una respuesta.
- Maximo de respuestas seleccionables.
- Tipo de grafico.
- Orden.
- Estado.
- Lista de opciones.

Por opcion:

- Texto de opcion.
- Valor interno.
- Orden.
- Estado.

El administrador debe poder:

- agregar pregunta;
- editar pregunta;
- inactivar pregunta;
- cambiar orden;
- agregar opcion;
- editar opcion;
- inactivar opcion;
- cambiar orden de opciones.

## 8. Modelo de datos propuesto

### 8.1 `event_surveys`

Tabla principal de encuestas.

Campos:

- `id`
- `event_id`
- `session_id`
- `title`
- `browser_title`
- `participant_slug`
- `status`
- `created_by_user_id`
- `created_at`
- `updated_at`

Indices:

- unico por `participant_slug`;
- indice por `event_id`;
- indice por `session_id`;
- indice por `status`.

### 8.2 `event_survey_questions`

Preguntas de una encuesta.

Campos:

- `id`
- `survey_id`
- `question_text`
- `description`
- `allow_multiple_answers`
- `max_answers_per_participant`
- `chart_type`
- `sort_order`
- `status`
- `created_at`
- `updated_at`

Indices:

- indice por `survey_id`;
- indice por `status`;
- indice por `sort_order`.

### 8.3 `event_survey_options`

Opciones de respuesta.

Campos:

- `id`
- `question_id`
- `option_text`
- `option_value`
- `sort_order`
- `status`
- `created_at`
- `updated_at`

Indices:

- indice por `question_id`;
- indice por `status`;
- indice por `sort_order`.

### 8.4 `event_survey_votes`

Votos o respuestas individuales.

Campos:

- `id`
- `survey_id`
- `question_id`
- `option_id`
- `participant_id` nullable
- `anonymous_participant_key`
- `status`
- `created_at`
- `updated_at`

Restricciones recomendadas:

- Para pregunta de respuesta unica, validar en aplicacion que solo exista un voto activo por `question_id` y `anonymous_participant_key`.
- Para pregunta multiple, validar en aplicacion que no se supere `max_answers_per_participant`.
- Evitar voto duplicado sobre la misma opcion por la misma persona: `question_id + option_id + anonymous_participant_key`.

## 9. API propuesta

### 9.1 Administracion

- `GET /api/admin/events/:eventId/surveys`
- `POST /api/admin/events/:eventId/surveys`
- `PUT /api/admin/events/:eventId/surveys/:surveyId`
- `POST /api/admin/events/:eventId/surveys/:surveyId/status`
- `POST /api/admin/events/:eventId/surveys/:surveyId/questions`
- `PUT /api/admin/events/:eventId/surveys/:surveyId/questions/:questionId`
- `POST /api/admin/events/:eventId/surveys/:surveyId/questions/:questionId/status`
- `POST /api/admin/events/:eventId/surveys/:surveyId/questions/:questionId/options`
- `PUT /api/admin/events/:eventId/surveys/:surveyId/questions/:questionId/options/:optionId`
- `POST /api/admin/events/:eventId/surveys/:surveyId/questions/:questionId/options/:optionId/status`

### 9.2 Publico

- `GET /api/public/surveys/:slug`
- `GET /api/public/surveys/:slug/results`
- `POST /api/public/surveys/:slug/questions/:questionId/votes`

El endpoint publico de encuesta debe devolver:

- datos de encuesta;
- evento;
- preguntas activas;
- opciones activas;
- resultados agregados por pregunta;
- voto previo del participante anonimo si existe y se puede identificar desde `anonymous_participant_key`.

## 10. Seguridad y validaciones

- Sanitizar todos los textos administrativos.
- Validar unicidad de enlace corto.
- No aceptar votos en encuestas que no esten `open`.
- No aceptar votos en preguntas inactivas.
- No aceptar votos en opciones inactivas.
- Validar que una pregunta tenga minimo dos opciones activas.
- Validar que `max_answers_per_participant` sea numerico positivo.
- Validar que `max_answers_per_participant` no supere opciones activas.
- Proteger endpoints administrativos con login y roles.
- Supervisores solo pueden administrar encuestas de sus propios eventos.
- Administradores pueden administrar todas las encuestas.

## 11. Diseno responsivo

### Movil

- Una pregunta por pantalla.
- Opciones como tarjetas grandes o controles tactiles.
- Grafico de barras como visualizacion preferida cuando hay muchas opciones.
- Botones de navegacion apilados si no caben en una fila.
- Texto sin desbordes horizontales.

### Escritorio/proyector

- Pregunta centrada y destacada.
- Grafico amplio.
- Barras con porcentajes legibles.
- Colores sobrios y diferenciados.
- Navegacion visible, pero secundaria frente al grafico.

## 12. Reportes futuros

En fases posteriores se recomienda agregar exportacion:

- resultados agregados por encuesta;
- resultados por pregunta;
- resultados por opcion;
- votos individuales anonimizados;
- resultados cruzados con datos de participantes cuando la encuesta use identificacion.

## 13. Criterios de aceptacion

1. El administrador puede crear una encuesta asociada a un evento.
2. El administrador puede agregar varias preguntas a la encuesta.
3. Cada pregunta puede tener varias opciones activas.
4. El enlace corto publico abre la encuesta.
5. La vista publica muestra una pregunta a la vez.
6. El participante puede registrar respuesta unica o multiple segun configuracion.
7. El sistema guarda votos individuales.
8. El grafico muestra resultados agregados.
9. El grafico se actualiza dinamicamente.
10. El participante puede navegar entre preguntas.
11. Una encuesta cerrada no acepta nuevos votos.
12. Una encuesta archivada no se muestra como disponible.
13. Los campos bloqueados por respuestas registradas quedan deshabilitados en edicion.
14. La interfaz es usable en celular y escritorio sin desbordes.

## 14. Recomendacion de implementacion

Implementar las encuestas como una entidad propia, no como extension directa de pizarras ni de preguntas de nube.

Razon:

- Las pizarras guardan notas abiertas.
- Las nubes agregan texto libre normalizado.
- Las encuestas requieren preguntas, opciones cerradas, votos y graficos.

La reutilizacion debe ocurrir en patrones, no en tablas:

- generacion de enlaces cortos;
- estados `draft`, `open`, `closed`, `archived`;
- asociacion opcional a sesion;
- nombre navegador;
- vistas publicas responsivas;
- refresco dinamico;
- permisos de administrador/supervisor.

Esta separacion mantiene el sistema claro, extensible y preparado para futuras dinamicas como quiz, ranking o evaluaciones.
