# Especificacion de visibilidad y acceso a recursos del tablero

## 1. Objetivo

Permitir que la informacion publicada en el tablero del evento tenga control de visibilidad por recurso, diferenciando recursos de acceso publico inmediato y recursos privados disponibles solo para personas registradas en la base general de participantes.

La funcionalidad busca convertir recursos valiosos del evento en un incentivo amable para el registro: la persona puede acceder al contenido si ya forma parte de la comunidad o si completa su registro, sin que esto implique registrar asistencia a una sesion.

## 2. Alcance funcional

Aplica a:

- Informacion general del evento configurada en el tablero.
- Informacion adicional de cada sesion configurada desde el cronograma.
- Items cuyo tipo sea `link`.

No aplica inicialmente a:

- Items tipo `text`, porque no abren una URL externa.
- Pizarras interactivas publicas de notas libres.
- Preguntas interactivas, que ya tienen su propio flujo de validacion por asistencia al evento.

## 3. Conceptos

### 3.1 Participante

Persona existente en la base general del aplicativo, identificada principalmente por tipo y numero de documento.

Un participante puede existir por:

- Haber registrado asistencia a una sesion.
- Haber completado un registro sin asistencia para acceder a recursos privados.

### 3.2 Asistencia

Registro de presencia de un participante en una sesion abierta de un evento.

La asistencia siempre requiere:

- Evento.
- Sesion.
- Participante.
- Fecha y hora de registro.

### 3.3 Registro sin asistencia

Registro de datos del participante usando el modelo de formulario asociado al evento, pero sin crear un registro en `attendance_records`.

Este flujo sirve para que una persona quede incorporada a la base general de participantes y pueda acceder a recursos privados del tablero.

Debe quedar claro en codigo, base de datos y mensajes de interfaz que este flujo no equivale a haber asistido a una sesion.

### 3.4 Usuario registrado para recursos

Persona que existe en la base general de participantes y, opcionalmente, tiene una marca de relacion con el evento como persona registrada/interesada.

Esta relacion permite diferenciar:

- Participante global ya existente.
- Participante que se registro especificamente desde el tablero de un evento.
- Participante que asistio a una o varias sesiones.

## 4. Nuevo control: visibilidad

Tanto en la informacion del evento como en la informacion de sesiones se debe agregar el campo `Visibilidad`.

Opciones:

- `public`: Publico.
- `private`: Privado.

Reglas:

- Por defecto todo item nuevo debe iniciar como `public`.
- El campo debe mostrarse al crear y editar informacion.
- El campo es funcional principalmente cuando `value_type = link`.
- Si `value_type = text`, la visibilidad puede guardarse pero no debe cambiar el comportamiento publico porque el texto ya se muestra directamente.
- Si un item tipo `link` es publico, todo el control del tablero abre la URL directamente.
- Si un item tipo `link` es privado, el control no debe abrir la URL directamente; debe iniciar el flujo de identificacion y acceso.

## 5. Comportamiento publico del tablero

### 5.1 Recurso publico

Cuando el item es `link` y `visibility = public`:

- Todo el control funciona como hipervinculo.
- Al hacer clic sobre el icono, nombre o fondo del control, se abre la URL del valor.
- Se abre en nueva pestana con `target="_blank"` y `rel="noopener noreferrer"`.
- No se solicita identificacion.

### 5.2 Recurso privado

Cuando el item es `link` y `visibility = private`:

- El control debe verse clickeable igual que un recurso publico.
- Al hacer clic, no debe abrir directamente la URL.
- Debe mostrar una interfaz de acceso al recurso.
- La interfaz debe solicitar tipo y numero de documento.
- Debe usar textos amables, orientados a invitacion y no a bloqueo.

Mensaje sugerido inicial:

`Este recurso es para personas registradas en la comunidad del evento. Identifiquese para abrirlo.`

Si la persona no existe:

`Aun no encontramos su registro. Puede registrarse en un momento y acceder a este y otros contenidos del evento.`

Boton sugerido:

`Registrarme y acceder`

Si la persona existe:

- Se muestra saludo breve con su nombre.
- Se abre el recurso solicitado.
- Opcionalmente se puede mostrar un mensaje corto: `Registro validado. Abriendo recurso...`

## 6. Flujo de acceso a recurso privado

1. La persona abre el tablero publico del evento.
2. Hace clic en un item tipo enlace privado.
3. El sistema muestra modal o panel centrado de identificacion.
4. La persona selecciona tipo de documento e ingresa numero.
5. El sistema busca el participante en la base general.
6. Si existe, permite acceso y abre la URL.
7. Si no existe, invita a registrarse usando el formulario asociado al evento.
8. La persona completa el formulario.
9. El sistema crea el participante en la base general.
10. El sistema registra una relacion de registro/interes con el evento, sin asistencia.
11. El sistema permite acceso y abre la URL.

## 7. Flujo de registro sin asistencia

El registro sin asistencia debe reutilizar el modelo de formulario asociado al evento.

Diferencias frente al formulario de asistencia:

- No requiere que exista una sesion abierta.
- No muestra modulo/sesion como destino de asistencia.
- No crea registro de asistencia.
- Usa las mismas secciones, campos, catalogos, validaciones y reglas del modelo asociado.
- Si la persona ya existe, no debe volver a pedir todos los datos; solo confirma identidad y permite acceso.
- Si la persona se registra aqui, luego al usar el formulario de asistencia del evento debe comportarse como participante existente.

Texto sugerido de cabecera:

`Registro para acceder a recursos del evento`

Texto sugerido:

`Complete sus datos una sola vez. Con este registro podra acceder a recursos privados del evento y registrar su asistencia cuando exista una sesion abierta.`

## 8. Relacion con formulario de asistencia

El formulario asociado al evento se reutiliza para dos propositos distintos:

- `attendance`: registro de asistencia a una sesion abierta.
- `registration`: registro general del participante para acceso a recursos, sin asistencia.

La diferencia no debe estar en el modelo de preguntas, sino en el contexto de ejecucion.

### 8.1 Modo asistencia

Ruta actual del evento:

- `/f/:slug`

Reglas:

- Requiere sesion abierta para registrar asistencia.
- Si no hay sesion abierta, no registra asistencia.
- Si el participante no existe, solicita completar datos.
- Al completar datos, crea participante y registra asistencia.

### 8.2 Modo registro

Ruta sugerida:

- `/r/:eventSlug`
- O modal interno desde `/t/:dashboardSlug` que use endpoints publicos de registro.

Reglas:

- No requiere sesion abierta.
- Si el participante no existe, solicita completar datos.
- Al completar datos, crea participante y registra relacion de registro con evento.
- No crea asistencia.
- Al terminar, devuelve al recurso privado solicitado.

Recomendacion inicial:

- Usar un modal o panel dentro del tablero para no sacar al usuario del contexto del recurso.
- Si se reutiliza una ruta `/r/:eventSlug`, aceptar un parametro `returnTo` o `resourceId` seguro para volver al recurso.

## 9. Modelo de datos sugerido

### 9.1 `event_dashboard_items`

Agregar campo:

- `visibility` TEXT NOT NULL DEFAULT `public`

Valores permitidos:

- `public`
- `private`

Reglas:

- Solo se aplica funcionalmente a items `value_type = link`.
- Los items existentes migran como `public`.

### 9.2 `event_participant_registrations`

Nueva tabla sugerida para registrar la relacion de una persona con un evento sin confundirla con asistencia.

Campos:

- `id`
- `event_id`
- `participant_id`
- `source`
- `created_at`
- `updated_at`

Valores sugeridos de `source`:

- `attendance`: creado o confirmado desde flujo de asistencia.
- `resource_registration`: creado desde acceso a recurso privado.
- `admin_import`: creado por carga futura administrativa.

Restricciones:

- Unico por `event_id` + `participant_id`.

Nota:

- Si una persona ya tiene asistencia en el evento, se considera registrada para efectos de acceso aunque no exista aun fila en esta tabla.
- La tabla ayuda a medir interesados registrados por evento aunque no hayan asistido todavia.

### 9.3 Auditoria de acceso a recursos

Tabla futura recomendada:

- `event_dashboard_resource_access`

Campos sugeridos:

- `id`
- `event_id`
- `dashboard_item_id`
- `participant_id`
- `accessed_at`
- `access_status`
- `user_agent_hash`

Esta tabla no es obligatoria para la primera version, pero permitiria medir interes en recursos privados.

## 10. API sugerida

### 10.1 Administracion

Extender payloads existentes de informacion de tablero:

- `visibility`

Endpoints actuales a extender:

- `PUT /api/admin/events/:eventId/dashboard`
- `PUT /api/admin/events/:eventId/sessions/:sessionId/dashboard-items`
- `POST /api/admin/events`

Validaciones:

- `visibility` solo acepta `public` o `private`.
- Si no se envia, usar `public`.
- Mantener compatibilidad con items existentes.

### 10.2 Publico

Endpoint para validar acceso:

- `POST /api/public/dashboards/:dashboardSlug/resources/:itemId/access`

Body:

- `documentType`
- `documentNumber`

Respuesta si existe:

- `ok: true`
- `participant`
- `resourceUrl`
- `access: granted`

Respuesta si no existe:

- `ok: false`
- `access: registration_required`
- `message`
- `registrationContext`

Endpoint para obtener formulario de registro sin asistencia:

- `GET /api/public/events/:eventSlug/registration-form`

Endpoint para registrar participante sin asistencia:

- `POST /api/public/events/:eventSlug/register`

Body:

- tipo y numero de documento;
- campos del formulario asociado;
- `dashboardItemId` opcional para retornar al recurso.

Respuesta:

- `ok: true`
- `participant`
- `resourceUrl` opcional si venia de recurso privado.

## 11. Seguridad

### 11.1 No exponer URLs privadas antes de validar

En una primera version simple, la API publica del tablero podria seguir enviando el valor del enlace privado y el frontend bloquearia por interfaz. Sin embargo, esto no protege realmente la URL.

Recomendacion profesional:

- Para items privados, la API publica del tablero no debe devolver `value` directamente.
- Debe devolver un indicador como `is_private: true`.
- La URL real solo se entrega despues de validar o registrar al participante.

Esto evita que alguien inspeccione el navegador y copie el enlace sin registrarse.

### 11.2 Validacion de redireccion

Si se usa `returnTo`, no debe aceptar URLs arbitrarias sin control.

Reglas:

- Preferir `dashboardItemId` en vez de URL directa.
- Buscar la URL real en base de datos.
- Abrir solo URLs guardadas por administradores.

### 11.3 Rate limiting y abuso

Para evitar busquedas masivas de documentos:

- Limitar intentos por IP o fingerprint suave en endpoints publicos de acceso.
- Mensaje generico cuando no se encuentre una persona.
- No revelar datos completos del participante antes de validacion suficiente.

Primera version puede implementar validacion basica y dejar rate limiting como mejora prioritaria.

### 11.4 Sesiones y cookies

No se requiere crear login publico para participantes.

Se puede usar estado local temporal en frontend para recordar el documento validado durante la sesion de navegador, pero el backend debe validar cada acceso privado.

## 12. Experiencia de usuario

### 12.1 En tablero

Los recursos privados deben verse como parte natural del tablero.

Recomendaciones visuales:

- Mostrar el mismo estilo de boton que los recursos publicos.
- Agregar una senal discreta de privado, por ejemplo icono de candado pequeno.
- Evitar textos prohibidos como `Acceso denegado`.
- Usar mensajes de invitacion.

Ejemplos:

- `Contenido para personas registradas`
- `Identifiquese para abrir este recurso`
- `Registre sus datos una sola vez y acceda a los contenidos del evento`

### 12.2 Modal de acceso

Contenido recomendado:

- Nombre del recurso.
- Mensaje breve.
- Tipo de documento.
- Numero de documento.
- Boton principal `Continuar`.
- Boton secundario `Cancelar`.

Si requiere registro:

- Mostrar formulario por secciones, reutilizando experiencia del formulario publico.
- Mantener botones `Atras`, `Siguiente`, `Registrarme y acceder`.
- Al finalizar, abrir recurso automaticamente.

### 12.3 Participante ya registrado

Si el documento existe:

- Mostrar saludo breve.
- Abrir recurso.
- Evitar pedir datos nuevamente.

### 12.4 Participante no registrado

Si el documento no existe:

- Explicar que el registro es gratuito y rapido.
- Mostrar el formulario asociado al evento.
- No mencionar asistencia si el flujo es solo registro.

## 13. Reportes y analitica futura

Esta funcionalidad permite ampliar reportes:

- Personas registradas por evento sin asistencia.
- Personas que accedieron a recursos privados.
- Recursos mas consultados.
- Conversion: clic en recurso privado -> registro completado.
- Comparacion registrados vs asistentes.

## 14. Casos borde

- Evento sin modelo de formulario asociado: no se puede registrar; mostrar mensaje para comunicarse con organizador.
- Recurso privado inactivo: no aparece en tablero.
- Recurso privado eliminado o cambiado mientras el usuario se registra: mostrar mensaje y volver al tablero.
- Persona registrada globalmente pero sin relacion con el evento: permitir acceso y crear relacion `resource_registration` con el evento.
- Persona con asistencia previa al evento: permitir acceso.
- Persona que inicia registro y cancela: no abrir recurso.
- Sesiones inactivas: no se muestran en tablero ni sus recursos.
- Item tipo texto con visibilidad privada: en primera version se muestra como texto normal o se bloquea administrativamente para evitar confusion. Recomendacion: permitir visibilidad privada solo cuando `value_type = link`.

## 15. Criterios de aceptacion

- El administrador puede elegir `Publico` o `Privado` al crear/editar informacion de evento.
- El administrador puede elegir `Publico` o `Privado` al crear/editar informacion de sesion.
- Los recursos publicos abren directamente.
- Los recursos privados solicitan identificacion antes de abrir.
- Si el participante existe, el recurso se abre.
- Si el participante no existe, se muestra flujo de registro sin asistencia.
- El registro sin asistencia crea/actualiza participante, pero no crea asistencia.
- Luego de registrarse, el recurso se abre.
- Un participante registrado sin asistencia luego puede usar el formulario de asistencia sin volver a llenar todos sus datos.
- La API publica no expone URLs privadas antes de validar acceso.
- Las interfaces mantienen el estilo visual del tablero y formularios publicos.

## 16. Implementacion incremental recomendada

### Fase 1

- Agregar `visibility` a `event_dashboard_items`.
- Mostrar selector de visibilidad en administracion.
- Ajustar API publica para ocultar URL de links privados.
- Implementar modal de identificacion para recursos privados.
- Validar participante por tipo y numero de documento.
- Si existe, entregar URL.

### Fase 2

- Implementar registro sin asistencia reutilizando el modelo de formulario del evento.
- Crear tabla `event_participant_registrations`.
- Al registrar, guardar relacion con evento y abrir recurso.
- Integrar esta condicion con el formulario de asistencia para tratarlo como participante existente.

### Fase 3

- Auditoria de accesos.
- Estadisticas de conversion.
- Rate limiting mas robusto.
- Sesion temporal de participante validado para no pedir documento en cada recurso durante la misma visita.

## 17. Decision recomendada

Implementar la visibilidad en los items del tablero y resolver los recursos privados desde el backend mediante un endpoint de acceso, no solo desde el frontend.

Esta opcion es mas solida porque:

- no expone URLs privadas en la carga inicial del tablero;
- separa correctamente registro de asistencia;
- reutiliza el formulario asociado al evento sin duplicar modelos;
- permite crecer hacia reportes de interesados y consumo de recursos;
- mantiene una experiencia amable para el participante;
- evita llenar el tablero con barreras visuales, conservando el recurso como una invitacion a registrarse.
