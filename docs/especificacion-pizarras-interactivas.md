# Especificacion funcional: pizarras interactivas de eventos

## 1. Objetivo

Agregar al sistema **Asistencia** una nueva funcionalidad de participacion denominada **pizarras interactivas**.

Una pizarra interactiva permite que el organizador de un evento publique una instruccion o consigna y que los participantes dejen notas libres relacionadas con esa instruccion. Las notas se visualizan en una vista de administrador/presentador con estilo de pizarra, usando tarjetas tipo post-it.

Esta funcionalidad es hermana de las preguntas interactivas, pero no reemplaza la nube de palabras. La diferencia principal es:

- Pregunta interactiva: busca respuestas breves que se agregan como nube.
- Pizarra interactiva: busca notas abiertas, posiblemente mas largas, enriquecidas y visibles como tarjetas.

## 2. Principios de diseno

- Cada pizarra pertenece a un evento.
- Una pizarra puede estar asociada a todo el evento o a una sesion especifica.
- Cada pizarra genera dos enlaces:
  - Enlace para participante.
  - Enlace para administrador/presentador.
- El enlace de participante es publico y no exige login ni documento.
- La pizarra puede usarse en canales externos como WhatsApp, por lo que debe permitir participacion de personas que aun no registraron asistencia.
- El participante debe registrar al menos:
  - nombre;
  - apellido;
  - pais;
  - nota.
- El pais debe reutilizar el catalogo/control de pais ya existente.
- Las instrucciones y las notas deben aceptar texto enriquecido.
- El texto enriquecido debe conservar formato basico al copiar desde Word u otro procesador, pero debe ser sanitizado antes de guardarse o mostrarse.
- La vista del presentador debe estar optimizada para pantalla grande, proyector y navegacion con muchos registros.
- La experiencia debe ser movil primero para participantes.

## 3. Alcance funcional inicial

### Incluido

- Crear pizarras interactivas dentro de un evento.
- Editar pizarras interactivas.
- Abrir, cerrar y archivar pizarras.
- Asociar una pizarra a todo el evento o a una sesion.
- Configurar titulo.
- Configurar instrucciones en una o varias tarjetas.
- Configurar enlace corto de participante.
- Generar enlace de administrador/presentador.
- Configurar maximo de caracteres por nota.
- Configurar si se permite mas de una nota por participante.
- Configurar maximo de notas por participante cuando aplique.
- Registrar notas desde enlace publico.
- Registrar pais del participante.
- Mostrar notas en vista de administrador como tarjetas tipo post-it.
- Mostrar bandera del pais seleccionado cuando sea tecnicamente viable.
- Permitir expandir y contraer una nota.
- Mostrar paginacion o carga por paginas para pizarras con muchas notas.
- Guardar notas individuales para reportes y usos futuros.

### No incluido en la primera version

- Validacion de identidad por documento.
- Requerir asistencia registrada.
- Moderacion avanzada con aprobacion previa.
- Comentarios o respuestas a notas.
- Votacion de notas.
- Arrastrar y soltar notas libremente.
- Agrupacion automatica por temas o IA.
- Traduccion automatica.
- Mapa geografico interactivo.

Estas funciones pueden agregarse como fases posteriores.

## 4. Conceptos principales

### 4.1 Pizarra interactiva

Entidad configurada por un administrador o supervisor dentro de un evento.

Campos funcionales:

- Evento.
- Sesion asociada opcional.
- Titulo.
- Estado.
- Enlace corto de participante.
- Enlace de presentador.
- Maximo de caracteres por nota.
- Permite multiples notas por participante.
- Maximo de notas por participante.
- Fecha de creacion.
- Usuario creador.
- Fecha de actualizacion.

Estados sugeridos:

- `draft`: configurada pero no publicada.
- `open`: acepta notas.
- `closed`: no acepta nuevas notas, pero mantiene visible la pizarra.
- `archived`: oculta de la gestion operativa habitual.

### 4.2 Instruccion

Una pizarra puede tener una o varias instrucciones.

El caso principal es usar varias instrucciones para mostrar el mismo mensaje en diferentes idiomas.

Cada instruccion debe guardar:

- Pizarra.
- Orden visual.
- Titulo opcional o etiqueta de idioma.
- Contenido enriquecido.
- Estado.

Ejemplo de etiquetas:

- Espanol.
- Portugues.
- Ingles.

Visualmente, las instrucciones deben mostrarse como tarjetas en una misma fila cuando exista espacio. En pantallas moviles deben apilarse verticalmente.

### 4.3 Nota

Registro enviado por un participante desde el enlace publico.

Debe guardar:

- Pizarra.
- Evento.
- Sesion asociada si aplica.
- Nombre del participante.
- Apellido del participante.
- Pais seleccionado.
- Contenido enriquecido original sanitizado.
- Extracto de texto plano para vista resumida.
- Estado.
- Fecha y hora de envio.
- Informacion tecnica basica opcional: user agent, IP anonimizada o hash de dispositivo.

La nota no depende inicialmente de la tabla general de participantes, porque la pizarra es de uso libre.

## 5. Reglas de administracion

### 5.1 Creacion de pizarra

El formulario administrativo debe pedir:

- Evento.
- Sesion asociada opcional.
- Titulo.
- Enlace corto.
- Maximo de caracteres de nota.
- Permitir mas de una nota.
- Maximo de notas por participante, visible/obligatorio si se permite mas de una nota.
- Instrucciones.

Reglas:

- El enlace corto debe ser unico dentro del modulo de pizarras.
- Recomendado: validar unicidad global por tipo de enlace publico para evitar colisiones con preguntas o formularios si comparten rutas.
- Maximo de caracteres debe ser numerico y mayor a cero.
- Maximo de notas por participante debe ser numerico, mayor a cero y requerido si `permite multiples notas = si`.
- Debe existir al menos una instruccion activa.

### 5.2 Edicion de pizarra

Campos editables en cualquier momento:

- Sesion asociada.
- Titulo.
- Maximo de caracteres.
- Permitir mas de una nota.
- Maximo de notas por participante.
- Instrucciones.

Campos editables solo si no existen notas registradas:

- Enlace corto.

Justificacion:

- El enlace corto pudo haber sido distribuido por WhatsApp u otro canal.
- Cambiarlo luego de tener notas puede romper acceso y trazabilidad.

### 5.3 Estados

- `Abrir`: cambia estado a `open` y permite registrar notas.
- `Cerrar`: cambia estado a `closed` y bloquea nuevos registros.
- `Archivar`: cambia estado a `archived` y la retira de la operacion normal.

Una pizarra cerrada debe seguir pudiendo verse en el enlace de administrador.

## 6. Enlace del participante

Ruta sugerida:

`/b/{slug}`

Experiencia:

1. Muestra cabecera con nombre del evento.
2. Muestra titulo de la pizarra.
3. Muestra instrucciones como tarjetas enriquecidas.
4. Muestra formulario de nota.

Campos del formulario:

- Nombre.
- Apellido.
- Pais.
- Nota enriquecida.

Reglas:

- Nombre obligatorio.
- Apellido obligatorio.
- Pais obligatorio.
- Nota obligatoria.
- La nota no debe exceder el maximo configurado.
- Si la pizarra esta `closed`, se muestra mensaje: "La pizarra ya no recibe nuevas notas."
- Si la pizarra esta `draft` o `archived`, se muestra mensaje de no disponibilidad.
- Si no se permite mas de una nota, el sistema debe intentar evitar duplicados por una combinacion razonable:
  - nombre normalizado;
  - apellido normalizado;
  - pais;
  - hash de navegador o cookie publica temporal si existe.
- Si se permite mas de una nota, se respeta el maximo por participante usando la misma combinacion.

Nota importante:

Como no hay documento ni login, el control de multiples notas sera preventivo, no infalible. Esta es una decision funcional aceptada para priorizar facilidad de uso en dinamicas abiertas.

## 7. Editor de texto enriquecido

### 7.1 Alcance de formato permitido

Debe permitirse formato basico:

- Negrita.
- Cursiva.
- Subrayado.
- Listas.
- Saltos de linea.
- Parrafos.
- Enlaces.
- Emojis.
- Texto pegado desde Word conservando estructura basica.

No debe permitirse:

- Scripts.
- Iframes.
- Estilos inseguros.
- Eventos HTML como `onclick`.
- Formularios embebidos.
- Imagenes pegadas en base64 en la primera version.

### 7.2 Recomendacion tecnica

Usar un editor probado de texto enriquecido, por ejemplo:

- TipTap.
- ProseMirror.
- Lexical.
- Quill.

Recomendacion inicial:

- Para una primera version controlada, usar TipTap o Lexical si el tamano del bundle es aceptable.
- Guardar el contenido como HTML sanitizado o JSON estructurado del editor.
- Mostrar siempre contenido usando sanitizacion previa.

Sanitizacion recomendada:

- En frontend antes de enviar.
- En backend antes de guardar.
- En backend o frontend antes de renderizar.

El backend debe ser la ultima barrera de seguridad.

## 8. Enlace del administrador/presentador

Ruta sugerida:

`/b/p/{presenterSlug}`

Experiencia:

1. Muestra nombre del evento.
2. Muestra titulo de la pizarra.
3. Muestra instrucciones como tarjetas.
4. Muestra pizarra de notas.

La pizarra de notas debe:

- Actualizarse automaticamente cada pocos segundos.
- Mostrar tarjetas tipo post-it.
- Tener estilo vistoso, sobrio y legible.
- Mostrar por tarjeta:
  - bandera del pais;
  - primer nombre y apellido;
  - extracto de las primeras 50 letras de la nota;
  - accion para ver mas.
- Permitir expandir una tarjeta.
- Permitir contraer una tarjeta expandida.
- Mantener paginacion cuando haya muchas notas.

### 8.1 Tarjetas tipo post-it

Contenido compacto:

- Bandera o indicador de pais.
- Nombre abreviado: primer nombre + apellido.
- Extracto de nota.
- Boton o accion `...` / `Ver mas`.

Al expandir:

- Mostrar contenido completo con formato enriquecido.
- Cambiar accion a `Ver menos`.

Regla de extracto:

- El extracto debe generarse como texto plano, sin HTML.
- Longitud inicial: 50 caracteres.
- Si la nota tiene menos de 50 caracteres, no se requiere `Ver mas`.

### 8.2 Paginacion

Se espera participacion de 200 a 300 personas, y potencialmente mas.

Recomendacion:

- Cargar notas paginadas desde backend.
- Tamano inicial: 48 notas por pagina en escritorio.
- En pantallas pequenas, mantener misma pagina logica pero adaptar columnas.
- Mostrar controles:
  - Anterior.
  - Siguiente.
  - Pagina actual / total.
  - Conteo total de notas.

Alternativa futura:

- Scroll infinito con virtualizacion si se supera el volumen esperado.

## 9. Pais y banderas

### 9.1 Fuente de paises

El campo pais debe reutilizar el catalogo o tabla ya existente de paises.

Debe guardar:

- Identificador del pais.
- Nombre del pais.
- Codigo ISO si esta disponible o puede agregarse.

### 9.2 Visualizacion de bandera

Mostrar banderas no es una funcionalidad dificil si se usa una estrategia simple.

Opciones:

1. Emoji de bandera usando codigo ISO de pais.
   - Muy liviano.
   - No consume recursos externos.
   - Depende de soporte del sistema operativo/navegador.
   - Recomendado para primera version si tenemos o agregamos codigo ISO alpha-2.

2. Libreria local de iconos SVG.
   - Mejor consistencia visual.
   - Aumenta peso del frontend si se incluyen todas las banderas.
   - Se puede limitar a America y paises principales de Asia/Europa.

3. Servicio externo de banderas.
   - Facil de implementar.
   - Depende de red externa.
   - No recomendado si queremos control y estabilidad.

Recomendacion:

- Primera version: usar emoji de bandera basado en codigo ISO alpha-2.
- Si no existe codigo ISO para algun pais, mostrar iniciales o icono generico de globo.
- No implementar mapas de pais en esta fase.

Evaluacion de dificultad:

- Banderas con emoji: baja dificultad y bajo consumo.
- Banderas con SVG local: dificultad media y consumo moderado.
- Mapas o siluetas de pais: dificultad alta, mayor peso visual y mas esfuerzo de mantenimiento.

Decision sugerida:

- Implementar banderas, no mapas.
- Dejar mapas/siluetas para una version futura si realmente aportan valor.

## 10. Modelo de datos sugerido

### `event_boards`

Tabla principal de pizarras.

Campos:

- `id`
- `event_id`
- `session_id`
- `title`
- `status`
- `participant_slug`
- `presenter_slug`
- `max_note_length`
- `allow_multiple_notes`
- `max_notes_per_participant`
- `created_by_user_id`
- `created_at`
- `updated_at`

Indices:

- `event_id`
- `session_id`
- `participant_slug` unico
- `presenter_slug` unico
- `status`

### `event_board_instructions`

Instrucciones de la pizarra.

Campos:

- `id`
- `board_id`
- `language_label`
- `content_html`
- `content_text`
- `sort_order`
- `status`
- `created_at`
- `updated_at`

Indices:

- `board_id`
- `sort_order`

### `event_board_notes`

Notas enviadas por participantes.

Campos:

- `id`
- `board_id`
- `event_id`
- `session_id`
- `first_name`
- `last_name`
- `country_id`
- `country_name`
- `country_iso2`
- `note_html`
- `note_text`
- `note_excerpt`
- `participant_fingerprint`
- `status`
- `created_at`
- `updated_at`

Indices:

- `board_id`
- `event_id`
- `session_id`
- `country_id`
- `status`
- `created_at`
- `participant_fingerprint`

## 11. API sugerida

### Administracion

- `GET /api/admin/events/:eventId/boards`
- `POST /api/admin/events/:eventId/boards`
- `PUT /api/admin/boards/:boardId`
- `POST /api/admin/boards/:boardId/status`
- `GET /api/admin/boards/:boardId/notes`

### Publico participante

- `GET /api/public/boards/:slug`
- `POST /api/public/boards/:slug/notes`

### Publico presentador

- `GET /api/public/board-presenter/:slug`
- `GET /api/public/board-presenter/:slug/notes?page=1&pageSize=48`

## 12. Seguridad

El texto enriquecido introduce riesgos importantes.

Requisitos:

- Sanitizar HTML en backend antes de guardar.
- Permitir solo etiquetas y atributos seguros.
- Bloquear scripts, iframes y eventos HTML.
- Limitar tamano del contenido.
- Aplicar rate limit basico por IP/fingerprint para evitar spam.
- Escapar o sanitizar nuevamente antes de renderizar.
- No guardar imagenes base64 pegadas en la primera version.
- No exponer datos internos del sistema en los enlaces publicos.

## 13. Experiencia visual

### Participante

- Fondo claro.
- Cabecera limpia con evento y titulo.
- Instrucciones en tarjetas.
- Formulario simple y responsivo.
- Editor enriquecido facil de usar en movil.
- Boton principal visible y consistente con el sistema.

### Administrador/presentador

- Vista amplia, sin menu administrativo.
- Cabecera compacta.
- Instrucciones visibles arriba.
- Pizarra con tarjetas tipo post-it.
- Tarjetas en colores suaves alternados.
- Expandir/contraer sin perder el contexto.
- Paginacion clara.
- Actualizacion periodica sin recargar pagina.

## 14. Reportes futuros

La informacion guardada debe permitir luego:

- Exportar notas por pizarra.
- Exportar por pais.
- Exportar por sesion.
- Analizar cantidad de notas por pais.
- Identificar participantes mas activos si se conserva fingerprint o datos declarados.
- Usar notas para dinamicas posteriores.

## 15. Casos borde

- Pizarra cerrada: no permite enviar notas, pero presentador puede ver resultados.
- Pizarra archivada: no disponible publicamente.
- Nota vacia: bloquear envio.
- Nota demasiado larga: bloquear envio.
- Pais sin bandera: mostrar icono generico.
- Participante pega contenido desde Word con estilos complejos: conservar estructura basica y descartar estilos inseguros.
- Participante intenta enviar muchas notas: aplicar limite configurado y rate limit.
- Presentador abre pagina con 500 notas: cargar pagina inicial y permitir navegacion.
- Se edita instruccion mientras participantes la ven: se actualiza en la siguiente carga o ciclo de refresco.

## 16. Recomendacion de desarrollo incremental

### Fase 1

- Modelo de datos.
- CRUD administrativo basico.
- Enlaces participante y presentador.
- Registro de notas con texto plano o HTML basico sanitizado.
- Pais y bandera con emoji.
- Paginacion de notas.

### Fase 2

- Editor enriquecido completo.
- Mejoras visuales de post-it.
- Rate limit mas fino.
- Exportacion de notas.

### Fase 3

- Moderacion.
- Agrupacion por pais.
- Filtros.
- Busqueda.
- Analisis de contenido.

## 17. Decision inicial recomendada

Implementar la primera version con:

- Banderas por emoji usando ISO alpha-2.
- Sin mapas ni siluetas de pais.
- Texto enriquecido sanitizado.
- Paginacion desde backend.
- Pizarra publica sin validacion documental.

Esto resuelve el objetivo principal con bajo consumo de recursos y deja espacio para evolucionar sin sobredisenar.
