# Especificacion funcional: tablero general del evento

## 1. Objetivo

Agregar al sistema **Asistencia** una funcionalidad de difusion denominada **Tablero general del evento**.

El tablero debe permitir agrupar, ordenar y publicar en un solo enlace la informacion relevante del evento y de sus sesiones. Su finalidad es que los participantes tengan un espacio unico, claro y estetico donde consultar:

- informacion general del evento;
- datos operativos de cada sesion;
- enlaces de Zoom;
- enlaces a presentaciones;
- enlaces a nubes interactivas;
- enlaces a pizarras interactivas;
- enlaces a grabaciones;
- otros recursos definidos por el organizador.

El tablero no registra informacion de participantes. Es una vista publica de consulta y difusion.

## 2. Principios de diseno

- Cada evento puede tener un tablero general.
- El tablero genera un unico enlace publico.
- El tablero se configura desde la gestion del evento.
- El tablero puede existir aunque no tenga instrucciones.
- Las instrucciones pueden repetirse por idioma y aceptar texto enriquecido.
- La informacion visible se administra por estado: solo los elementos activos aparecen en la vista publica.
- La informacion del evento y de las sesiones debe gestionarse de forma sencilla, sin exigir conocimientos tecnicos.
- La vista publica debe seguir el estilo visual usado en preguntas interactivas y pizarras:
  - fondo claro o blanco;
  - cabecera limpia;
  - tipografia grande y legible;
  - tarjetas/cajas sobrias;
  - colores suaves;
  - buena experiencia movil.

## 3. Alcance funcional inicial

### Incluido

- Configurar tablero dentro de un evento.
- Editar tablero.
- Configurar titulo del tablero.
- Configurar nombre del navegador.
- Configurar enlace corto.
- Configurar instrucciones enriquecidas, opcionales y multiples.
- Configurar informacion general del evento.
- Configurar informacion especifica por sesion.
- Activar o inactivar cada elemento informativo.
- Mostrar tablero publico por enlace corto.
- Mostrar informacion general del evento.
- Mostrar sesiones del cronograma como cajas organizadas.
- Mostrar informacion activa de cada sesion.
- Mostrar enlaces como hipervinculos que abren en otra pestana.
- Paginar sesiones si el evento tiene muchas sesiones.
- Diferenciar visualmente sesiones pertenecientes al mismo modulo.

### No incluido en la primera version

- Registro de interacciones del participante.
- Comentarios o respuestas dentro del tablero.
- Login para participantes.
- Permisos por participante.
- Estadisticas de clics.
- Busqueda avanzada dentro del tablero.
- Filtros por modulo.
- Generacion automatica de enlaces desde nubes o pizarras.
- Carga automatica de archivos de presentacion.

Estas funcionalidades pueden incorporarse luego.

## 4. Conceptos principales

### 4.1 Tablero del evento

Entidad publica asociada a un evento.

Campos funcionales:

- Evento.
- Titulo.
- Nombre navegador.
- Enlace corto.
- Estado.
- Usuario creador.
- Fecha de creacion.
- Fecha de actualizacion.

Estados sugeridos:

- `draft`: configurado pero no publicado.
- `active`: publicado y visible.
- `inactive`: no visible publicamente.
- `archived`: retirado de la operacion habitual.

Regla recomendada:

- Un evento debe tener como maximo un tablero activo.
- Si se permite crear mas de un tablero por evento en una fase futura, solo uno debe marcarse como principal.

### 4.2 Instruccion del tablero

Texto enriquecido opcional que permite explicar el uso del tablero o publicar mensajes generales.

Cada instruccion debe guardar:

- Tablero.
- Etiqueta o idioma opcional.
- Contenido enriquecido.
- Texto plano derivado.
- Orden.
- Estado.

Reglas:

- Puede no existir ninguna instruccion.
- Puede existir una sola instruccion.
- Puede existir mas de una instruccion, por ejemplo Espanol, Portugues e Ingles.
- En escritorio deben mostrarse como tarjetas en fila cuando exista espacio.
- En movil deben apilarse verticalmente.
- El HTML debe sanitizarse antes de guardar y antes de mostrar.

### 4.3 Informacion del evento

Elemento informativo general visible para todo el evento.

Campos:

- Tablero.
- Sesion: `null`.
- Nombre.
- Tipo: `text` o `link`.
- Valor.
- Estado.
- Orden.

Comportamiento publico:

- Si el tipo es `text`, se muestra el valor como texto.
- Si el tipo es `link`, se muestra la palabra `Enlace` como hipervinculo que abre el valor URL en otra pestana.
- Solo se muestran elementos activos.

Ejemplos:

- Nombre: `Enlace Zoom general`; tipo: `link`; valor: `https://...`
- Nombre: `Horario general`; tipo: `text`; valor: `08:00 a 17:00`
- Nombre: `Carpeta de materiales`; tipo: `link`; valor: `https://...`

### 4.4 Informacion de sesion

Elemento informativo adicional asociado a una sesion especifica del cronograma.

El tablero siempre debe traer automaticamente desde la estructura propia de la sesion:

- Modulo.
- Tema.
- Fecha.
- Horario.

Estos datos no se crean ni se administran como elementos informativos del tablero. Ya tienen su propio flujo de gestion en el evento, modulo y cronograma. Si el administrador edita el modulo, tema, fecha u horario desde la gestion normal de sesiones, el tablero debe reflejar automaticamente esos cambios.

Campos:

- Tablero.
- Sesion.
- Nombre.
- Tipo: `text` o `link`.
- Valor.
- Estado.
- Orden.

Comportamiento publico:

- Se muestra dentro de la caja de la sesion correspondiente.
- Si el tipo es `text`, se muestra el valor como texto.
- Si el tipo es `link`, se muestra la palabra `Enlace` como hipervinculo.
- Solo se muestran elementos activos.
- Complementa la informacion base de la sesion, pero no la reemplaza.

Ejemplos:

- Nombre: `Ponente`; tipo: `text`; valor: `Dra. Maria Perez`
- Nombre: `Zoom`; tipo: `link`; valor: `https://...`
- Nombre: `Presentacion`; tipo: `link`; valor: `https://...`
- Nombre: `Nube interactiva`; tipo: `link`; valor: `https://asistencia.../q/...`
- Nombre: `Pizarra de dinamica`; tipo: `link`; valor: `https://asistencia.../b/...`
- Nombre: `Grabacion`; tipo: `link`; valor: `https://...`

## 5. Administracion

### 5.1 Ubicacion en el sistema

La gestion debe integrarse dentro de la seccion **Eventos**.

Se recomienda incorporar:

- un bloque `Tablero` dentro del evento seleccionado;
- un bloque de informacion general del evento;
- un bloque de informacion por sesion dentro de la edicion de cada sesion del cronograma.

### 5.2 Configuracion del tablero

Campos administrativos:

- Titulo.
- Enlace corto.
- Nombre Navegador.
- Estado.
- Instrucciones.

Reglas:

- El titulo es obligatorio.
- El enlace corto es obligatorio para publicar.
- El enlace corto debe ser unico dentro de la ruta publica de tableros.
- El nombre navegador es opcional; si queda vacio, se usa el titulo.
- Las instrucciones son opcionales.
- El enlace corto debe normalizarse a minusculas, numeros y guiones.

Ruta publica sugerida:

`/t/{slug}`

Justificacion:

- `/f/...` ya se usa para formularios.
- `/q/...` ya se usa para preguntas/nubes.
- `/b/...` ya se usa para pizarras.
- `/t/...` identifica claramente tablero.

### 5.3 Gestion de informacion general del evento

Debe permitir:

- Agregar elemento.
- Editar elemento.
- Activar elemento.
- Inactivar elemento.
- Cambiar orden.

Campos:

- Nombre.
- Tipo.
- Valor.
- Estado.
- Orden.

Validaciones:

- Nombre obligatorio.
- Tipo obligatorio.
- Valor obligatorio.
- Si tipo es `link`, el valor debe ser una URL valida.
- Si tipo es `text`, el valor debe aceptar texto razonable y saltos de linea simples si se requiere.

### 5.4 Gestion de informacion de sesion

Debe integrarse en la edicion de sesiones.

Esta gestion solo corresponde a informacion adicional para el tablero. No debe duplicar ni recrear los campos propios de la sesion:

- Modulo.
- Tema.
- Fecha.
- Hora de inicio.
- Hora de fin.

Estos campos continuan administrandose en el CRUD normal de sesiones y modulos.

Cada sesion debe permitir:

- Agregar elemento informativo.
- Editar elemento informativo.
- Activar elemento.
- Inactivar elemento.
- Cambiar orden.

Campos:

- Nombre.
- Tipo.
- Valor.
- Estado.
- Orden.

Validaciones:

- Nombre obligatorio.
- Tipo obligatorio.
- Valor obligatorio.
- Si tipo es `link`, validar URL.
- Solo usuarios autorizados a administrar el evento pueden editar esta informacion.

### 5.5 Relacion con nubes y pizarras

En la primera version, los enlaces a nubes y pizarras se agregan como elementos tipo `link`.

Ejemplo:

- Nombre: `Nube de palabras de la sesion`
- Tipo: `link`
- Valor: `https://asistencia.anteru.workers.dev/q/...`

Fase futura recomendada:

- Permitir seleccionar una nube o pizarra existente desde un `select` y que el sistema complete la URL automaticamente.

## 6. Vista publica del tablero

### 6.1 Estructura visual

Orden sugerido:

1. Nombre del evento.
2. Titulo del tablero.
3. Instrucciones, si existen.
4. Informacion general del evento.
5. Sesiones del cronograma.

### 6.2 Cabecera

Debe mostrar:

- Nombre del evento como texto superior.
- Titulo del tablero como encabezado principal.

El nombre navegador debe actualizar la pestana del navegador.

### 6.3 Informacion general del evento

Debe mostrarse en un bloque visual limpio, por ejemplo:

- tarjeta unica con listado;
- grid de tarjetas pequenas;
- tabla visual simple sin apariencia pesada.

Formato publico de cada elemento:

- Nombre en negrita.
- Valor a la derecha o debajo segun ancho.
- Si es enlace, mostrar `Enlace` como hipervinculo.

### 6.4 Sesiones

Cada sesion debe mostrarse como una caja.

Contenido automatico obligatorio, leido directamente del cronograma:

- Modulo.
- Tema.
- Fecha.
- Horario.

Estos datos no dependen de `event_dashboard_items`. La caja de sesion debe consultarlos desde las tablas actuales de modulos y sesiones. Si se cambia el modulo, tema, fecha u horario en la administracion normal del cronograma, el tablero debe reflejar el cambio sin requerir mantenimiento adicional.

Contenido configurable adicional:

- Informacion activa de sesion.

Formato de informacion de sesion:

- Listado amigable.
- Nombre en negrita.
- Valor o `Enlace`.

### 6.5 Colores por modulo

Las sesiones pertenecientes a un mismo modulo deben compartir una senal visual.

Opciones recomendadas:

- borde izquierdo de color por modulo;
- fondo pastel suave por modulo;
- etiqueta del modulo con color consistente.

Recomendacion inicial:

- usar borde superior o izquierdo de color por modulo;
- mantener fondo blanco o pastel muy suave para preservar legibilidad.

Paleta sugerida:

- azul suave;
- verde suave;
- amarillo suave;
- lila suave;
- rosado suave;
- cyan suave.

### 6.6 Paginacion

Los eventos pueden tener una o muchas sesiones.

Regla inicial:

- Mostrar entre 16 y 20 sesiones por pagina.
- Recomendacion: 18 sesiones por pagina en escritorio.
- En movil, mantener la misma paginacion logica pero apilar tarjetas.

Controles:

- Anterior.
- Siguiente.
- Pagina actual / total.

Si el evento tiene pocas sesiones, no mostrar paginacion.

## 7. Modelo de datos sugerido

### 7.1 `event_dashboards`

Tabla principal del tablero.

Campos:

- `id`
- `event_id`
- `title`
- `browser_title`
- `short_link_slug`
- `status`
- `created_by_user_id`
- `created_at`
- `updated_at`

Indices:

- `event_id`
- `short_link_slug` unico
- `status`

Regla:

- Puede agregarse indice unico parcial o validacion de aplicacion para evitar mas de un tablero activo por evento.

### 7.2 `event_dashboard_instructions`

Instrucciones enriquecidas del tablero.

Campos:

- `id`
- `dashboard_id`
- `language_label`
- `content_html`
- `content_text`
- `sort_order`
- `status`
- `created_at`
- `updated_at`

Indices:

- `dashboard_id`
- `sort_order`
- `status`

### 7.3 `event_dashboard_items`

Tabla unica para informacion general del evento e informacion adicional de sesiones.

No debe almacenar ni duplicar la metadata propia de la sesion como modulo, tema, fecha, hora de inicio u hora de fin. Esos datos se consultan desde la estructura actual del cronograma.

Campos:

- `id`
- `dashboard_id`
- `event_id`
- `session_id`
- `scope`
- `name`
- `value_type`
- `value`
- `sort_order`
- `status`
- `created_at`
- `updated_at`

Valores de `scope`:

- `event`: informacion general del evento.
- `session`: informacion de una sesion.

Reglas:

- Si `scope = event`, `session_id` debe ser `null`.
- Si `scope = session`, `session_id` debe tener valor.
- `value_type` solo puede ser `text` o `link`.
- `status` define visibilidad publica.
- Los items con `scope = session` representan recursos o datos complementarios, por ejemplo Zoom, ponente, presentacion, nube, pizarra o grabacion.

Indices:

- `dashboard_id`
- `event_id`
- `session_id`
- `scope`
- `status`
- `sort_order`

## 8. API sugerida

### Administracion

- `GET /api/admin/events/:eventId/dashboard`
- `POST /api/admin/events/:eventId/dashboard`
- `PUT /api/admin/events/:eventId/dashboard`
- `POST /api/admin/events/:eventId/dashboard/status`
- `POST /api/admin/events/:eventId/dashboard/instructions`
- `PUT /api/admin/events/:eventId/dashboard/instructions/:instructionId`
- `POST /api/admin/events/:eventId/dashboard/items`
- `PUT /api/admin/events/:eventId/dashboard/items/:itemId`
- `POST /api/admin/events/:eventId/dashboard/items/:itemId/status`

Alternativa simplificada:

- Guardar tablero, instrucciones e items en una sola llamada `PUT`, similar a como se editan pizarras.

### Publico

- `GET /api/public/dashboards/:slug`

Ruta frontend:

- `/t/:slug`

## 9. Permisos

Administrador:

- Puede crear, editar, publicar, inactivar y archivar tableros de cualquier evento.

Supervisor:

- Puede crear, editar, publicar, inactivar y archivar tableros solo de sus propios eventos.

Publico:

- Solo puede ver tableros activos.
- No puede modificar informacion.
- No requiere login.

## 10. Seguridad

### 10.1 Texto enriquecido

Las instrucciones aceptan texto enriquecido, por lo que deben sanitizarse.

Debe bloquearse:

- scripts;
- iframes;
- formularios;
- eventos HTML como `onclick`;
- imagenes embebidas base64 en primera version;
- estilos inseguros.

### 10.2 Enlaces

Los valores tipo `link` deben validarse como URL.

Reglas:

- Permitir `https://`.
- Permitir `http://` solo si se decide aceptarlo para compatibilidad.
- Recomendacion: priorizar `https://`.
- Abrir enlaces publicos con `target="_blank"` y `rel="noopener noreferrer"`.

### 10.3 Exposicion publica

La API publica solo debe devolver:

- datos necesarios del evento;
- datos necesarios del tablero;
- instrucciones activas;
- items activos;
- sesiones visibles del cronograma.

No debe devolver:

- IDs internos innecesarios de usuarios;
- datos de participantes;
- datos administrativos sensibles.

## 11. Experiencia de administracion

### 11.1 Edicion del evento

En el evento seleccionado debe existir una seccion `Tablero`.

Componentes sugeridos:

- Formulario de datos generales del tablero.
- Editor de instrucciones.
- Lista editable de informacion general del evento.
- Vista resumida del enlace publico.
- Boton para abrir tablero.

### 11.2 Edicion de sesiones

En cada sesion del cronograma debe existir un bloque `Informacion para tablero`.

El administrador debe poder agregar N elementos complementarios.

El bloque no debe permitir editar modulo, tema, fecha u horario como si fueran items del tablero. Esos datos deben seguir editandose en los campos propios de la sesion.

Para no saturar la pantalla:

- usar un panel colapsable;
- mostrar resumen de cantidad de elementos activos;
- permitir edicion inline o modal simple.

### 11.3 Ordenamiento

Primera version:

- permitir subir/bajar elementos;
- o usar campo numerico `orden`.

Fase futura:

- drag and drop.

## 12. Experiencia publica movil

Requisitos:

- Cabecera legible sin ocupar demasiado alto.
- Instrucciones apiladas.
- Informacion general en tarjetas o listado.
- Sesiones apiladas una por una.
- Enlaces con area tactil amplia.
- Paginacion facil de tocar.
- Texto sin desbordes horizontales.

## 13. Casos borde

- Evento sin sesiones: mostrar informacion general y mensaje de que no hay sesiones publicadas.
- Tablero sin instrucciones: omitir el bloque de instrucciones.
- Tablero sin informacion general: omitir el bloque.
- Sesion sin informacion de sesion: mostrar solo modulo, tema, fecha y horario.
- Enlace invalido en administracion: bloquear guardado.
- Elemento inactivo: no aparece publicamente.
- Tablero inactivo o archivado: mostrar no disponible.
- Muchas sesiones: paginar.
- Muchas instrucciones: apilar y mantener orden.
- Titulo largo: debe partir lineas sin romper layout.
- Valor tipo texto largo: debe ajustarse multilinea.

## 14. Recomendacion de implementacion incremental

### Fase 1

- Crear modelo de datos.
- CRUD basico de tablero por evento.
- Instrucciones opcionales.
- Items generales del evento.
- Items por sesion.
- Vista publica `/t/:slug`.
- Titulo dinamico del navegador.
- Paginacion de sesiones.

### Fase 2

- Mejoras de administracion inline.
- Ordenamiento con subir/bajar.
- QR para tablero si se decide homologar con formularios.
- Select para enlazar automaticamente nubes y pizarras existentes.

### Fase 3

- Estadisticas de clics.
- Filtros por modulo.
- Busqueda en sesiones.
- Exportacion o impresion del tablero.

## 15. Decision recomendada

Implementar el tablero como una entidad propia del evento con una tabla unica de items para informacion general e informacion adicional de sesion.

Esta opcion es mas profesional y sostenible porque:

- evita duplicar tablas para informacion general del evento y recursos adicionales de sesion;
- evita duplicar la metadata propia del cronograma, porque modulo, tema, fecha y horario se leen desde las tablas actuales de sesiones;
- permite agregar cualquier tipo de dato futuro;
- simplifica la vista publica;
- facilita activar/inactivar elementos;
- permite reutilizar el mismo patron para enlaces a Zoom, presentaciones, nubes, pizarras y grabaciones;
- mantiene la administracion dentro del contexto natural del evento y del cronograma.
