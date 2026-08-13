# Contexto del Proyecto: Asistencia

## 1. Nombre del proyecto

**Asistencia** es un sistema para gestionar eventos, sus cronogramas, formularios de registro/asistencia y reportes de participación.

El proyecto nace para permitir que una institución u organización pueda crear eventos con una o varias fechas, compartir formularios mediante enlace corto o código QR, registrar participantes y controlar la asistencia por cada fecha del evento.

## 2. Objetivo general

Construir una aplicación web que permita:

- Crear y administrar eventos.
- Definir el cronograma de cada evento, indicando días, horarios y títulos independientes por fecha o sesión.
- Generar formularios de asistencia asociados a cada evento.
- Permitir que los asistentes registren sus datos generales si aún no existen en la base de datos.
- Permitir que asistentes ya registrados marquen asistencia ingresando su número de documento.
- Controlar la apertura y cierre de cada fecha del cronograma para evitar registros fuera del periodo válido.
- Generar enlaces cortos y códigos QR para compartir formularios.
- Emitir reportes de participantes, eventos y asistencias individuales por evento y por fecha.

## 3. Ecosistema técnico previsto

El proyecto se desarrollará usando el ecosistema definido para los proyectos actuales:

- Desarrollo local en `D:\PROYECTOS\asistencia`.
- Control de versiones con Git.
- Repositorio remoto en GitHub: `https://github.com/pantezana/asistencia.git`.
- Despliegue en Cloudflare.
- Frontend en Cloudflare Pages.
- Backend/API en Cloudflare Workers.
- Base de datos SQLite mediante Cloudflare D1.

Las tecnologías concretas del frontend y backend se definirán durante la fase inicial de arquitectura, priorizando simplicidad, mantenibilidad y compatibilidad con Cloudflare.

## 4. Conceptos principales del dominio

### Evento

Representa una actividad general: curso, taller, charla, capacitación, reunión, feria u otro tipo de evento.

Datos esperados:

- Título del evento.
- Descripción.
- Estado del evento.
- Datos de organización o responsable.
- Fechas de creación y actualización.

### Cronograma del evento

Cada evento puede tener una o varias fechas o sesiones. Cada fecha debe poder manejar su propio estado de apertura.

Datos esperados:

- Evento asociado.
- Título independiente de la fecha o sesión.
- Fecha.
- Hora de inicio.
- Hora de fin.
- Estado: abierto o cerrado.
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

## 5. Estados clave

### Estado de fecha del cronograma

- **Abierto:** permite registrar asistencia.
- **Cerrado:** bloquea nuevos registros de asistencia.

Este estado se gestiona por cada fecha o sesión, no solo a nivel del evento completo.

### Estado del evento

Estados iniciales sugeridos:

- Borrador.
- Publicado.
- Finalizado.
- Archivado.

Estos estados se validarán durante el diseño funcional.

## 6. Flujos principales

### Flujo de creación de evento

1. El administrador crea un evento.
2. Define el cronograma con una o varias fechas.
3. Crea o clona el formulario de asistencia.
4. El sistema genera enlace corto y QR.
5. El administrador comparte el enlace o QR con los asistentes.

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

1. El administrador ingresa al evento.
2. Revisa el cronograma.
3. Abre la fecha activa cuando inicia la sesión.
4. Cierra la fecha cuando termina la sesión.
5. El formulario deja de aceptar nuevas asistencias para esa fecha cerrada.

### Flujo de reportes

1. El administrador selecciona un evento.
2. Consulta participantes inscritos y asistencias.
3. Filtra por fecha, sesión o participante.
4. Exporta o visualiza reportes según la necesidad.

## 7. Reglas iniciales del negocio

- Un participante se identifica principalmente por su tipo y número de documento.
- Un participante puede asistir a múltiples eventos.
- Un evento puede tener múltiples fechas o sesiones.
- Una asistencia pertenece a un participante, a un evento y a una fecha específica del cronograma.
- No debe existir más de una asistencia del mismo participante para la misma fecha del cronograma.
- Si la fecha del cronograma está cerrada, el formulario no debe aceptar asistencias.
- El formulario debe poder mostrar información dinámica según el evento y la fecha seleccionada.
- La clonación de formularios debe reutilizar campos y configuración, pero generar una nueva instancia asociada al evento correspondiente.

## 8. Modelo de datos inicial sugerido

Tablas iniciales candidatas:

- `events`
- `event_sessions`
- `participants`
- `forms`
- `form_fields`
- `attendance_records`
- `short_links`

Este modelo es preliminar y deberá convertirse en migraciones reales cuando se defina la estructura del backend y la base de datos D1.

## 9. Módulos funcionales previstos

- Panel de administración.
- Gestión de eventos.
- Gestión de cronograma.
- Gestión de formularios.
- Clonación de formularios.
- Registro público de participantes.
- Registro público de asistencia.
- Generación de enlace corto.
- Generación de QR.
- Reportes.
- Exportación de datos.

## 10. Prioridades iniciales

Para una primera versión funcional se recomienda avanzar en este orden:

1. Base del proyecto y configuración del repositorio.
2. Definición de arquitectura para Cloudflare Workers, Pages y D1.
3. Modelo de datos y migraciones iniciales.
4. CRUD de eventos.
5. CRUD de fechas o sesiones del cronograma.
6. Formulario público básico.
7. Registro de participantes.
8. Registro de asistencia con validación de estado abierto/cerrado.
9. Generación de QR y enlace corto.
10. Reportes iniciales.

## 11. Decisiones pendientes

- Framework frontend a utilizar.
- Estructura final del Worker/API.
- Estrategia de autenticación para administradores.
- Campos obligatorios del participante.
- Campos personalizables por formulario.
- Formato de exportación de reportes.
- Estrategia de generación y persistencia de enlaces cortos.
- Diseño visual inicial del panel y del formulario público.

## 12. Estado actual

- Carpeta local creada: `D:\PROYECTOS\asistencia`.
- Repositorio GitHub creado: `https://github.com/pantezana/asistencia.git`.
- Proyecto en fase de inicialización y documentación base.

