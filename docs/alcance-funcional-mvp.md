# Alcance Funcional MVP: Asistencia

## 1. Objetivo principal

**Asistencia** permitirá a una organización saber quiénes asisten a cada evento y a cada sesión, manteniendo una base única de participantes y registros de asistencia por evento, módulo y sesión.

El objetivo operativo es:

- Registrar participantes mediante formularios de asistencia asociados a eventos.
- Reutilizar participantes ya registrados en la base general del aplicativo.
- Registrar asistencia únicamente en la sesión abierta del evento.
- Generar reportes exportables de listas de asistencia.

## 2. Componentes principales

El MVP debe cubrir:

- Login administrativo.
- Roles administrador y supervisor.
- Gestión de eventos.
- Gestión de módulos del evento.
- Gestión de sesiones por módulo.
- Gestión de formularios de asistencia.
- Clonación de formularios como plantillas.
- Enlace corto público del formulario.
- Código QR público del formulario.
- Registro público de participantes.
- Registro público de asistencia.
- Reporte exportable de lista de asistencia.

## 3. Base única de participantes

El sistema debe mantener una sola base general de participantes para todos los eventos.

Reglas:

- Un participante se identifica por tipo y número de documento.
- El número de documento permite reconocer si una persona ya está registrada.
- Un participante puede asistir a muchos eventos.
- Un participante puede asistir a muchas sesiones.
- No se debe duplicar un participante que ya exista.

## 4. Formularios de asistencia

Cada evento debe poder tener uno o más formularios de asistencia.

Funciones requeridas:

- Crear formulario desde cero.
- Clonar formulario existente.
- Editar formulario clonado.
- Usar formularios existentes como base o plantilla.
- Asociar formulario a un evento.
- Generar enlace corto.
- Generar QR.

La clonación debe copiar estructura, secciones, campos, catálogos y reglas del formulario origen, pero crear una nueva configuración editable para el evento destino.

## 5. Sesión abierta por evento

Cada evento puede tener muchas sesiones, pero solo una sesión puede estar abierta para asistencia en un momento dado.

Reglas:

- El estado funcional de asistencia de una sesión será `open` o `closed`.
- La interfaz debe mostrar los estados como **Abierto** y **Cerrado**.
- Solo una sesión por evento puede tener asistencia `open`.
- Si se abre una sesión, el sistema debe cerrar o impedir que exista otra sesión abierta del mismo evento.
- Si todas las sesiones están cerradas, el formulario público no debe registrar asistencia.

Mensaje esperado cuando no hay sesión abierta:

`No se puede registrar asistencia en este momento. Comuníquese con el organizador del evento.`

## 6. Flujo público del formulario

Cuando el asistente abre el enlace corto o escanea el QR:

1. El sistema identifica el evento.
2. El sistema busca la sesión abierta del evento.
3. Si no hay sesión abierta, muestra el mensaje de bloqueo.
4. Si hay sesión abierta, muestra el evento, la sesión y el tema.
5. El asistente ingresa tipo y número de documento.

## 7. Participante no registrado

Si el documento no existe en la base general:

1. El sistema solicita completar todos los campos requeridos del formulario.
2. El sistema crea el participante en la base general.
3. El sistema registra la asistencia en la sesión abierta.
4. El sistema muestra confirmación de asistencia registrada.

## 8. Participante registrado

Si el documento ya existe:

1. El sistema muestra los datos básicos de identificación, como nombres y apellidos.
2. El asistente confirma que es la persona identificada.
3. El sistema registra la asistencia en la sesión abierta.
4. El sistema muestra confirmación de asistencia registrada.

Si ya existe asistencia del participante en la misma sesión, el sistema debe informar que la asistencia ya fue registrada.

## 9. Información visible en el formulario

El formulario público debe mostrar claramente:

- Nombre del evento.
- Módulo, cuando corresponda.
- Número de sesión.
- Tema de la sesión.
- Fecha de la sesión.
- Estado de registro disponible o bloqueado.

Título dinámico sugerido:

`Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}`

## 10. Reportes

El primer reporte obligatorio será la **lista de asistencia**.

Debe permitir:

- Seleccionar evento.
- Seleccionar módulo.
- Seleccionar sesión.
- Ver participantes asistentes.
- Ver datos generales del participante.
- Ver fecha y hora de registro.
- Filtrar por documento o nombre.
- Exportar resultados.

El administrador podrá reportar todos los eventos. El supervisor solo podrá reportar sus propios eventos.

## 11. Criterios de listo para desarrollo

Para iniciar desarrollo, quedan definidos:

- Dominio principal.
- Roles iniciales.
- Estructura evento, módulo y sesión.
- Primer evento de prueba.
- Primer formulario de prueba.
- Catálogos iniciales.
- Regla de una sola sesión abierta por evento.
- Flujo público de participante nuevo y existente.
- Reporte inicial exportable.
- Migración inicial de eventos, módulos y sesiones.
