# Especificaciones Funcionales Iniciales: Asistencia

## 1. Propósito del documento

Este documento registra las especificaciones funcionales iniciales del sistema **Asistencia**. Su objetivo es servir como base para el diseño de arquitectura, base de datos, pantallas, permisos y desarrollo incremental.

## 2. Acceso al sistema

La administración de la aplicación debe estar protegida mediante autenticación con usuario y contraseña.

El sistema debe contar con:

- Pantalla de login.
- Base de datos de usuarios.
- Roles de usuario.
- Validación de permisos por rol.
- Sesiones seguras.
- Cierre de sesión.
- Protección de rutas administrativas.

Los formularios públicos de asistencia no requerirán login administrativo, pero estarán protegidos por reglas de negocio: solo podrán registrar asistencia si la fecha del cronograma está abierta.

## 3. Seguridad inicial requerida

La implementación debe seguir prácticas modernas de seguridad:

- Nunca guardar contraseñas en texto plano.
- Guardar contraseñas usando hash seguro con sal.
- Usar cookies de sesión `HttpOnly`, `Secure` y `SameSite`.
- Validar permisos en el backend, no solo en el frontend.
- Aplicar control de acceso por rol.
- Evitar que un supervisor acceda a eventos de otro supervisor.
- Registrar fechas de creación, actualización y último acceso cuando corresponda.
- Proteger formularios administrativos contra CSRF cuando aplique.
- Validar y sanear entradas del usuario.
- Evitar exponer datos sensibles en respuestas públicas o logs.
- Implementar límites básicos contra intentos repetidos de login.

## 4. Roles iniciales

### Administrador

El administrador general tiene acceso completo al sistema.

Permisos iniciales:

- Ver todos los eventos.
- Crear eventos.
- Actualizar eventos.
- Activar o desactivar eventos.
- Gestionar cronogramas de todos los eventos.
- Abrir y cerrar fechas del cronograma.
- Crear, clonar y administrar formularios.
- Generar enlaces cortos y QR.
- Ver reportes de todos los eventos.
- Gestionar catálogos.
- Gestionar parámetros.
- Gestionar roles.
- Crear y administrar usuarios del sistema.

### Supervisor

El supervisor gestiona únicamente los eventos que él mismo crea.

Permisos iniciales:

- Ver solo sus propios eventos.
- Crear eventos propios.
- Actualizar sus propios eventos.
- Activar o desactivar sus propios eventos.
- Gestionar cronogramas de sus propios eventos.
- Abrir y cerrar fechas de sus propios eventos.
- Crear, clonar y administrar formularios de sus propios eventos.
- Generar enlaces cortos y QR de sus propios eventos.
- Ver reportes de sus propios eventos.

Restricciones:

- No puede crear usuarios del sistema.
- No puede ver eventos creados por otros supervisores.
- No puede modificar eventos creados por otros supervisores.
- No puede administrar roles, usuarios ni parámetros globales.

## 5. Pantalla de login

La pantalla de login debe permitir el ingreso de usuarios autorizados.

Campos iniciales:

- Usuario o correo electrónico.
- Contraseña.

Acciones:

- Iniciar sesión.
- Mostrar errores de credenciales inválidas.
- Bloquear o limitar intentos repetidos según regla de seguridad definida.

Luego de iniciar sesión correctamente, el usuario debe ser dirigido a la pantalla principal.

## 6. Pantalla principal

Después del login, el sistema debe mostrar una interfaz responsiva estilo Bootstrap.

Estructura inicial:

- Barra superior o encabezado compacto.
- Menú lateral responsivo.
- Área central de contenido.
- Información del usuario autenticado.
- Opción de cierre de sesión.

El diseño debe funcionar correctamente en:

- PC de escritorio.
- Tablet.
- Celular.

En dispositivos pequeños, el menú lateral debe poder colapsarse o abrirse como panel móvil.

## 7. Menús principales

### Configuración

El menú **Configuración** debe agrupar las opciones administrativas del sistema.

Secciones iniciales:

- **Catálogo:** tablas maestras del sistema.
- **Parámetros:** reglas de negocio y valores configurables del sistema.
- **Roles:** roles y permisos del sistema.
- **Usuarios:** usuarios que pueden iniciar sesión y sus roles.

El acceso a estas opciones debe depender del rol. Inicialmente, el administrador tendrá acceso completo y el supervisor tendrá acceso restringido o nulo según la sección.

### Eventos

El menú **Eventos** debe permitir gestionar el ciclo completo de un evento.

Funciones iniciales:

- Crear evento.
- Ver eventos.
- Actualizar evento.
- Activar o desactivar evento.
- Crear y administrar cronograma.
- Crear, clonar y administrar formulario de asistencia.
- Abrir y cerrar fechas del cronograma.
- Generar enlace corto.
- Generar código QR.

Los supervisores solo podrán operar sobre sus propios eventos.

### Reportes

El menú **Reportes** debe permitir consultar información de eventos y asistencias.

Primer reporte prioritario:

- **Lista de asistencia** por evento y por fecha del cronograma.

Filtros iniciales sugeridos:

- Evento.
- Fecha o sesión.
- Estado de asistencia.
- Documento del participante.
- Nombre del participante.

## 8. Gestión de eventos

El CRUD de eventos debe incluir:

- Crear.
- Ver.
- Actualizar.
- Activar.
- Desactivar.

Datos iniciales esperados:

- Título del evento.
- Descripción.
- Responsable o creador.
- Estado.
- Fecha de creación.
- Fecha de actualización.

Reglas:

- Todo evento debe pertenecer a un usuario creador.
- El administrador puede ver todos los eventos.
- El supervisor solo puede ver los eventos que creó.

## 9. Cronograma del evento

Cada evento puede tener una o varias fechas o sesiones.

El CRUD del cronograma debe incluir:

- Crear fecha.
- Ver fecha.
- Actualizar fecha.
- Activar o desactivar fecha.
- Abrir asistencia.
- Cerrar asistencia.

Datos iniciales:

- Evento asociado.
- Título de la fecha o sesión.
- Fecha.
- Hora de inicio.
- Hora de fin.
- Estado administrativo.
- Estado de asistencia: abierto o cerrado.
- Orden de presentación.

La apertura y cierre de asistencia debe controlarse por cada fecha del cronograma.

## 10. Formularios de asistencia

Cada evento debe poder tener un formulario de asistencia.

Funciones iniciales:

- Crear formulario.
- Ver formulario.
- Actualizar formulario.
- Activar o desactivar formulario.
- Clonar o copiar formularios existentes.
- Asociar formulario a evento.
- Asociar formulario a fecha o permitir seleccionar fecha activa.

El formulario debe mostrar un título de bienvenida dinámico que combine:

- Título general del evento.
- Título independiente de la fecha o sesión.

Ejemplo:

`Bienvenido a Capacitación de Seguridad - Sesión 2: Práctica`

## 11. Formulario público

El formulario público debe ser accesible mediante enlace corto y QR.

Debe ser responsivo y simple de usar desde celular.

Flujo esperado:

1. El asistente abre el enlace corto o escanea el QR.
2. El sistema identifica el evento y la fecha correspondiente.
3. El formulario muestra el título dinámico.
4. El asistente ingresa su tipo y número de documento.
5. Si existe en la base de participantes, el sistema registra su asistencia.
6. Si no existe, el sistema solicita sus datos generales.
7. Luego de completar datos, el sistema registra al participante y su asistencia.
8. Si la fecha está cerrada, el sistema no permite registrar asistencia.
9. Si ya registró asistencia para esa fecha, el sistema informa que ya existe un registro.

## 12. Enlace corto y QR

Cuando el formulario esté listo, el sistema debe generar:

- Enlace corto público.
- Código QR asociado al enlace corto.

Reglas:

- El enlace corto debe resolver al formulario público correcto.
- El QR debe apuntar al enlace corto.
- El enlace y el QR deben poder compartirse fuera del sistema.
- El acceso público no debe exponer funciones administrativas.

## 13. Gestión de catálogos

Los campos tipo `select` de los formularios deben obtener sus opciones desde catálogos mantenibles.

La sección **Configuración > Catálogo** debe permitir:

- Crear catálogos.
- Ver catálogos.
- Actualizar nombre y descripción de catálogos.
- Activar o desactivar catálogos.
- Agregar elementos a un catálogo.
- Actualizar elementos de un catálogo.
- Activar o desactivar elementos de un catálogo.

Reglas:

- Los elementos de catálogo deben tener estado activo/inactivo.
- Los formularios públicos solo deben mostrar elementos activos.
- No se debe eliminar físicamente un elemento usado por formularios, participantes o asistencias.
- Los catálogos jerárquicos deben soportar dependencias entre elementos.
- Para ubicación, inicialmente se requiere jerarquía país, departamento, provincia y distrito.

## 14. Formulario de prueba inicial

El primer formulario de prueba corresponde al evento:

**Inauguración: Comunidad de Práctica en Manejo Forestal Comunitario Amazónico, en el marco de la OTCA**

Características:

- 12 fechas o sesiones.
- 4 secciones de formulario.
- 28 campos.
- 13 catálogos iniciales extraídos desde Excel.
- Enlace corto sugerido: `inauguracion-otca`.
- Título dinámico sugerido: `Bienvenido a {{event.title}} - {{session.title}}`.

Documentación específica:

- `docs/formulario-prueba-inauguracion-otca.md`

Seeds creados:

- `seeds/primer-evento-inauguracion-otca.json`
- `seeds/catalogos-formulario-asistencia.json`

## 15. Participantes

El sistema debe mantener una base general de participantes.

Datos iniciales:

- Tipo de documento.
- Número de documento.
- Nombres.
- Apellidos.
- Correo electrónico.
- Teléfono.
- Institución.
- Área.
- Cargo.
- Fecha de creación.
- Fecha de actualización.

Reglas:

- El tipo y número de documento deben identificar de forma única a un participante.
- Si el participante ya existe, no debe duplicarse.
- Un participante puede asistir a varios eventos.

## 16. Asistencia

La asistencia se registra por participante, evento y fecha del cronograma.

Datos iniciales:

- Evento.
- Fecha o sesión.
- Participante.
- Fecha y hora del registro.
- Método de registro.
- Estado.

Reglas:

- Solo se puede registrar asistencia si la fecha está abierta.
- No debe permitirse doble asistencia del mismo participante en la misma fecha.
- El sistema debe responder claramente cuando la asistencia ya fue registrada.

## 17. Reporte: lista de asistencia

El primer reporte relevante será la **lista de asistencia**.

Debe permitir:

- Seleccionar evento.
- Seleccionar fecha o sesión.
- Ver participantes asistentes.
- Ver datos generales del participante.
- Ver fecha y hora de registro.
- Filtrar resultados.
- Exportar resultados en una fase posterior.

El administrador podrá consultar listas de cualquier evento. El supervisor solo podrá consultar listas de sus propios eventos.

## 18. Modelo de datos inicial ampliado

Tablas candidatas:

- `users`
- `roles`
- `user_roles`
- `auth_sessions`
- `events`
- `event_sessions`
- `forms`
- `form_fields`
- `participants`
- `attendance_records`
- `short_links`
- `system_catalogs`
- `system_catalog_items`
- `system_parameters`
- `audit_logs`

Este modelo todavía debe validarse antes de crear las migraciones de Cloudflare D1.

## 19. Prioridades de desarrollo actualizadas

Orden sugerido para iniciar el desarrollo:

1. Definir arquitectura base del proyecto.
2. Configurar Cloudflare Pages, Workers y D1.
3. Crear modelo de datos inicial.
4. Implementar autenticación.
5. Implementar roles y permisos.
6. Crear layout administrativo responsivo.
7. Implementar CRUD de usuarios para administrador.
8. Implementar CRUD de eventos.
9. Implementar cronograma con apertura y cierre.
10. Implementar mantenimiento de catálogos.
11. Implementar configuración de formularios.
12. Implementar formulario público.
13. Implementar registro de participantes.
14. Implementar registro de asistencia.
15. Generar enlace corto y QR.
16. Crear reporte de lista de asistencia.

## 20. Decisiones pendientes

- Framework frontend definitivo.
- Librería visual o implementación exacta estilo Bootstrap.
- Estrategia final de hash de contraseñas compatible con Cloudflare Workers.
- Duración de sesión.
- Reglas de bloqueo por intentos fallidos.
- Campos obligatorios finales para participantes.
- Campos configurables por formulario.
- Reglas condicionales del bloque organización.
- Diseño exacto del panel administrativo.
- Formato de exportación de reportes.
