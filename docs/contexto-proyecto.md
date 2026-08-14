# Contexto del Proyecto: Asistencia

## 1. Nombre del proyecto

**Asistencia** es un sistema para gestionar eventos, cronogramas, formularios de registro/asistencia y reportes de participación.

El proyecto nace para permitir que una institución u organización pueda crear eventos con una o varias fechas, compartir formularios mediante enlace corto o código QR, registrar participantes y controlar la asistencia por cada fecha del evento.

## 2. Objetivo general

Construir una aplicación web que permita:

- Crear y administrar eventos.
- Definir el cronograma de cada evento, organizado por módulos y sesiones, indicando tema, fecha, horario y estado de cada sesión.
- Generar formularios de asistencia asociados a cada evento.
- Permitir que los asistentes registren sus datos generales si aún no existen en la base de datos.
- Permitir que asistentes ya registrados marquen asistencia ingresando su número de documento.
- Controlar la apertura y cierre de cada fecha del cronograma para evitar registros fuera del periodo válido.
- Generar enlaces cortos y códigos QR para compartir formularios.
- Emitir reportes de participantes, eventos y asistencias individuales por evento y por fecha.
- Proteger el panel de administración mediante usuario, contraseña, roles y permisos.

## 3. Ecosistema técnico previsto

El proyecto se desarrollará usando el ecosistema definido para los proyectos actuales:

- Desarrollo local en `D:\PROYECTOS\asistencia`.
- Control de versiones con Git.
- Repositorio remoto en GitHub: `https://github.com/pantezana/asistencia.git`.
- Despliegue en Cloudflare.
- Frontend en Cloudflare Pages.
- Backend/API en Cloudflare Workers.
- Base de datos SQLite mediante Cloudflare D1.

Las tecnologías concretas del frontend y backend se definirán durante la fase inicial de arquitectura, priorizando simplicidad, mantenibilidad, seguridad y compatibilidad con Cloudflare.

## 4. Acceso administrativo

La aplicación tendrá un panel administrativo protegido por login.

El ingreso al sistema de gestión debe realizarse con:

- Usuario o correo electrónico.
- Contraseña.
- Sesión segura.
- Roles y permisos.

Los formularios públicos de asistencia serán accesibles mediante enlace corto y QR sin login administrativo, pero solo permitirán registrar asistencia cuando la fecha correspondiente del cronograma esté abierta.

## 5. Roles iniciales

### Administrador

Usuario con acceso general al sistema.

Puede:

- Ver todos los eventos.
- Crear, actualizar, activar y desactivar eventos.
- Administrar cronogramas de todos los eventos.
- Abrir y cerrar fechas del cronograma.
- Crear, clonar y administrar formularios.
- Generar enlaces cortos y códigos QR.
- Ver reportes de todos los eventos.
- Administrar catálogos.
- Administrar parámetros.
- Administrar roles.
- Crear y administrar usuarios del sistema.

### Supervisor

Usuario operativo que administra únicamente sus propios eventos.

Puede:

- Crear eventos.
- Ver solo los eventos que él mismo creó.
- Actualizar, activar y desactivar sus propios eventos.
- Administrar cronogramas de sus propios eventos.
- Abrir y cerrar fechas de sus propios eventos.
- Crear, clonar y administrar formularios de sus propios eventos.
- Generar enlaces cortos y códigos QR de sus propios eventos.
- Ver reportes de sus propios eventos.

No puede:

- Crear usuarios del sistema.
- Ver eventos de otros supervisores.
- Modificar eventos de otros supervisores.
- Administrar roles, usuarios o parámetros globales.

## 6. Interfaz esperada

Luego del login, la pantalla principal debe ser responsiva y con estilo tipo Bootstrap.

Debe incluir:

- Menú lateral responsivo.
- Área central para mostrar el contenido de cada sección.
- Barra superior o encabezado compacto.
- Información del usuario autenticado.
- Opción de cierre de sesión.

La aplicación debe funcionar correctamente en:

- PC.
- Tablet.
- Celulares.

Los formularios públicos de asistencia deben ser especialmente cómodos en dispositivos móviles.

## 7. Menús iniciales

### Configuración

Sección para administración interna del sistema.

Debe contener:

- **Catálogo:** tablas maestras del sistema.
- **Parámetros:** reglas de negocio y valores configurables.
- **Roles:** roles y permisos del sistema.
- **Usuarios:** registro y administración de usuarios para inicio de sesión.

### Eventos

Sección para la gestión completa de eventos.

Debe permitir:

- Crear eventos.
- Ver eventos.
- Actualizar eventos.
- Activar y desactivar eventos.
- Crear y gestionar cronogramas.
- Crear y gestionar módulos del evento.
- Crear, clonar y gestionar formularios de asistencia.
- Abrir y cerrar fechas del cronograma.
- Generar enlace corto y QR.

### Reportes

Sección para consultar resultados y asistencias.

El primer reporte relevante será:

- Lista de asistencia por evento y por fecha del cronograma.

## 8. Conceptos principales del dominio

### Evento

Representa una actividad general: curso, taller, charla, capacitación, reunión, feria u otro tipo de evento.

Datos esperados:

- Título del evento.
- Descripción.
- Estado del evento.
- Usuario creador.
- Datos de organización o responsable.
- Fechas de creación y actualización.

### Módulo del evento

Un evento puede tener uno o muchos módulos. Los módulos permiten agrupar sesiones por bloque temático, etapa, eje formativo o componente del evento.

Datos esperados:

- Evento asociado.
- Título del módulo.
- Orden dentro del evento.
- Estado administrativo.
- Fechas de creación y actualización.

### Sesión del evento

Cada módulo puede tener una o varias sesiones. Cada sesión representa una fecha concreta del cronograma y debe poder manejar su propio estado de apertura.

Datos esperados:

- Evento asociado.
- Módulo asociado.
- Título de sesión.
- Tema de la sesión.
- Fecha.
- Hora de inicio.
- Hora de fin.
- Estado administrativo.
- Estado de asistencia: abierto o cerrado.
- Orden dentro del evento.

Ejemplo:

- Evento: "Capacitación de Seguridad"
- Fecha 1: "Sesión 1 - Introducción"
- Fecha 2: "Sesión 2 - Práctica"
- Fecha 3: "Sesión 3 - Evaluación"

### Participante

Representa a una persona registrada en la base general de participantes.

Datos esperados:

- Tipo de documento.
- Número de documento.
- Nombres.
- Apellidos.
- Correo electrónico.
- Teléfono.
- Institución, área, cargo u otros datos configurables.
- Fechas de creación y actualización.

El número de documento será el dato principal para identificar si una persona ya existe.

### Formulario de asistencia

Cada evento tendrá un formulario público de registro/asistencia. El sistema debe permitir crear formularios nuevos y también clonar o copiar formularios existentes para reutilizar su estructura.

El formulario debe:

- Mostrar un título dinámico de bienvenida.
- Mostrar el título general del evento.
- Mostrar el título de la fecha o sesión activa.
- Permitir registro de datos generales si el participante no existe.
- Permitir marcar asistencia si el participante ya existe.
- Validar que la fecha del cronograma esté abierta antes de aceptar asistencia.

### Asistencia

Representa la marca de presencia de un participante en una fecha específica del cronograma de un evento.

Datos esperados:

- Evento.
- Fecha o sesión del cronograma.
- Participante.
- Fecha y hora exacta de registro.
- Canal de registro.
- Estado de la asistencia.

Debe evitarse el registro duplicado de un mismo participante en la misma fecha del cronograma.

### Enlace corto y QR

Cuando se genere un formulario, el sistema debe crear:

- Un enlace público corto para compartir.
- Un código QR que apunte al enlace público.

Estos elementos deben facilitar el registro de asistentes desde celulares durante el desarrollo del evento.

## 9. Estados clave

### Estado de fecha del cronograma

- **Abierto:** permite registrar asistencia.
- **Cerrado:** bloquea nuevos registros de asistencia.

Este estado se gestiona por cada fecha o sesión, no solo a nivel del evento completo.

### Estado del evento

Estados iniciales sugeridos:

- Borrador.
- Publicado.
- Activo.
- Inactivo.
- Finalizado.
- Archivado.

Estos estados se validarán durante el diseño funcional.

## 10. Flujos principales

### Flujo de acceso administrativo

1. El usuario ingresa a la pantalla de login.
2. Digita su usuario o correo y contraseña.
3. El sistema valida credenciales.
4. El sistema crea una sesión segura.
5. El sistema carga el panel según el rol del usuario.

### Flujo de creación de evento

1. El administrador o supervisor crea un evento.
2. El sistema registra al usuario creador.
3. Define uno o varios módulos.
4. Define una o varias sesiones por módulo.
5. Crea o clona el formulario de asistencia.
6. El sistema genera enlace corto y QR.
7. El usuario comparte el enlace o QR con los asistentes.

### Flujo de registro de participante nuevo

1. El asistente abre el formulario mediante enlace corto o QR.
2. Ingresa su número de documento.
3. El sistema verifica que no exista en la base general de participantes.
4. El asistente completa sus datos generales.
5. El sistema crea el participante.
6. Si la fecha está abierta, registra la asistencia.

### Flujo de asistencia de participante existente

1. El asistente abre el formulario.
2. Ingresa su número de documento.
3. El sistema encuentra al participante en la base de datos.
4. El sistema valida que la fecha del cronograma esté abierta.
5. El sistema registra la asistencia para esa fecha.
6. Si ya existe una asistencia previa para esa fecha, informa que ya fue registrada.

### Flujo de control de apertura y cierre

1. El usuario autorizado ingresa al evento.
2. Revisa el cronograma.
3. Abre la fecha activa cuando inicia la sesión.
4. Cierra la fecha cuando termina la sesión.
5. El formulario deja de aceptar nuevas asistencias para esa fecha cerrada.

### Flujo de reportes

1. El usuario autorizado selecciona un evento.
2. Consulta participantes inscritos y asistencias.
3. Filtra por fecha, sesión o participante.
4. Visualiza la lista de asistencia.
5. Exporta resultados cuando esta funcionalidad esté implementada.

## 11. Reglas iniciales del negocio

- Un participante se identifica principalmente por su tipo y número de documento.
- Un participante puede asistir a múltiples eventos.
- Un evento puede tener múltiples módulos.
- Un módulo puede tener múltiples sesiones.
- Un evento pertenece a un usuario creador.
- Un administrador puede ver todos los eventos.
- Un supervisor solo puede ver eventos creados por él mismo.
- Una asistencia pertenece a un participante, a un evento y a una fecha específica del cronograma.
- No debe existir más de una asistencia del mismo participante para la misma fecha del cronograma.
- Si la fecha del cronograma está cerrada, el formulario no debe aceptar asistencias.
- El formulario debe poder mostrar información dinámica según el evento y la fecha seleccionada.
- La clonación de formularios debe reutilizar campos y configuración, pero generar una nueva instancia asociada al evento correspondiente.

## 12. Modelo de datos inicial sugerido

Tablas iniciales candidatas:

- `users`
- `roles`
- `user_roles`
- `auth_sessions`
- `events`
- `event_modules`
- `event_sessions`
- `participants`
- `forms`
- `form_fields`
- `attendance_records`
- `short_links`
- `system_catalogs`
- `system_catalog_items`
- `system_parameters`
- `audit_logs`

Este modelo es preliminar y deberá convertirse en migraciones reales cuando se defina la estructura del backend y la base de datos D1.

## 13. Módulos funcionales previstos

- Inicio de sesión.
- Panel de administración.
- Gestión de roles y permisos.
- Gestión de usuarios.
- Configuración.
- Catálogos.
- Parámetros.
- Gestión de eventos.
- Gestión de módulos.
- Gestión de cronograma.
- Gestión de formularios.
- Clonación de formularios.
- Registro público de participantes.
- Registro público de asistencia.
- Generación de enlace corto.
- Generación de QR.
- Reportes.
- Exportación de datos.

## 14. Prioridades iniciales

Para una primera versión funcional se recomienda avanzar en este orden:

1. Base del proyecto y configuración del repositorio.
2. Definición de arquitectura para Cloudflare Workers, Pages y D1.
3. Modelo de datos y migraciones iniciales.
4. Autenticación, sesiones, roles y permisos.
5. Layout administrativo responsivo.
6. CRUD de usuarios para administrador.
7. CRUD de eventos.
8. CRUD de módulos del evento.
9. CRUD de sesiones del cronograma.
10. Control de apertura y cierre de sesiones.
11. Mantenimiento de catálogos.
12. Configuración de formularios.
13. Formulario público básico.
14. Registro de participantes.
15. Registro de asistencia con validación de estado abierto/cerrado.
16. Generación de QR y enlace corto.
17. Reporte inicial de lista de asistencia.

## 15. Decisiones pendientes

- Framework frontend a utilizar.
- Estructura final del Worker/API.
- Estrategia de autenticación para administradores.
- Estrategia final de hash de contraseñas compatible con Cloudflare Workers.
- Duración de sesiones.
- Reglas de bloqueo por intentos fallidos de login.
- Campos obligatorios del participante.
- Campos personalizables por formulario.
- Reglas condicionales de campos por formulario.
- Formato de exportación de reportes.
- Estrategia de generación y persistencia de enlaces cortos.
- Diseño visual inicial del panel y del formulario público.

## 16. Primer evento de prueba

El primer evento de prueba identificado es:

**Inauguración: Comunidad de Práctica en Manejo Forestal Comunitario Amazónico, en el marco de la OTCA**

Características iniciales:

- 5 módulos.
- 14 sesiones.
- Periodo del cronograma: del `2026-08-21` al `2026-11-21`.
- Horario general de sesiones: `08:00` a `17:00`.
- Formulario con 4 secciones.
- Formulario con 28 campos.
- Catálogos iniciales extraídos desde Excel.
- Slug de enlace corto sugerido: `inauguracion-otca`.

Documentación y seeds:

- `docs/formulario-prueba-inauguracion-otca.md`
- `docs/cronograma-prueba-inauguracion-otca.md`
- `seeds/primer-evento-inauguracion-otca.json`
- `seeds/catalogos-formulario-asistencia.json`
- `migrations/0001_configuracion_evento_inauguracion_otca.sql`

## 17. Estado actual

- Carpeta local creada: `D:\PROYECTOS\asistencia`.
- Repositorio GitHub creado: `https://github.com/pantezana/asistencia.git`.
- Proyecto en fase de documentación funcional inicial.
- Especificaciones funcionales iniciales documentadas en `docs/especificaciones-funcionales.md`.
- Primer formulario de prueba documentado en `docs/formulario-prueba-inauguracion-otca.md`.
