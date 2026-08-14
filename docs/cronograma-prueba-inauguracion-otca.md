# Cronograma de Prueba: Inauguración OTCA

## 1. Fuente de datos

El detalle de módulos y sesiones fue extraído del archivo:

`C:\Users\USUARIO\Downloads\SESIONES_EVENTO.xlsx`

Hoja utilizada:

- `SESIONES`

## 2. Evento

Nombre de evento usado en el sistema:

**Inauguración: Comunidad de Práctica en Manejo Forestal Comunitario Amazónico, en el marco de la OTCA**

Nombre de evento indicado en el cronograma fuente:

**Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA**

Periodo del cronograma:

- Fecha de inicio: `2026-08-21`
- Fecha de fin: `2026-11-21`
- Hora de inicio general: `08:00`
- Hora de fin general: `17:00`
- Estado inicial del evento en sistema: `draft`
- Estado inicial de asistencia de sesiones: `closed`

## 3. Jerarquía del cronograma

La estructura confirmada para eventos es:

1. Evento.
2. Módulos del evento.
3. Sesiones del módulo.

Relaciones:

- Un evento puede tener uno o muchos módulos.
- Un módulo pertenece a un evento.
- Un módulo puede tener una o muchas sesiones.
- Una sesión pertenece a un módulo y a un evento.

## 4. Módulos identificados

| Orden | Módulo |
| ---: | --- |
| 1 | Módulo 1. Institucionalidad, gobernanza y marco legal |
| 2 | Módulo 2. Manejo sostenible de los recursos forestales y de fauna silvestre |
| 3 | Módulo 3. Sistemas productivos innovadores |
| 4 | Módulo 4. Cambio climático |
| 5 | Expo MFC: Encuentro de Comunidad de Práctica en Manejo Forestal Comunitario, intercambio de experiencias exitosas |

## 5. Sesiones identificadas

| Sesión | Módulo | Tema | Fecha | Inicio | Fin | Estado |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Módulo 1. Institucionalidad, gobernanza y marco legal | Institucionalidad, gobernanza y marco legal del sector forestal y de fauna silvestre I (3 países) | 2026-08-21 | 08:00 | 17:00 | Cerrado |
| 2 | Módulo 1. Institucionalidad, gobernanza y marco legal | Institucionalidad, gobernanza y marco legal del sector forestal y de fauna silvestre II (3 países) | 2026-08-26 | 08:00 | 17:00 | Cerrado |
| 3 | Módulo 2. Manejo sostenible de los recursos forestales y de fauna silvestre | Acceso, aprovechamiento y vigilancia comunitaria de los recursos forestales y de fauna silvestre I (3 países) | 2026-09-04 | 08:00 | 17:00 | Cerrado |
| 4 | Módulo 2. Manejo sostenible de los recursos forestales y de fauna silvestre | Acceso, aprovechamiento y vigilancia comunitaria de los recursos forestales y de fauna silvestre II (3 países) | 2026-09-11 | 08:00 | 17:00 | Cerrado |
| 5 | Módulo 3. Sistemas productivos innovadores | Sistemas productivos sostenibles: Plantaciones forestales, Sistemas agroforestales y silvopastoriles I (3 países) | 2026-09-18 | 08:00 | 17:00 | Cerrado |
| 6 | Módulo 3. Sistemas productivos innovadores | Sistemas productivos sostenibles: Plantaciones forestales, Sistemas agroforestales y silvopastoriles II (3 países) | 2026-09-25 | 08:00 | 17:00 | Cerrado |
| 7 | Módulo 3. Sistemas productivos innovadores | Manejo Comunal de Fauna Silvestre (Caza, zoocriaderos, ecoturismo) I (3 países) | 2026-09-30 | 08:00 | 17:00 | Cerrado |
| 8 | Módulo 3. Sistemas productivos innovadores | Manejo Comunal de Fauna Silvestre (Caza, zoocriaderos, ecoturismo) II (3 países) | 2026-10-09 | 08:00 | 17:00 | Cerrado |
| 9 | Módulo 4. Cambio climático | Gestión comunitaria del fuego e incendios forestales: prevención, monitoreo y respuesta temprana I (3 países) | 2026-10-16 | 08:00 | 17:00 | Cerrado |
| 10 | Módulo 4. Cambio climático | Gestión comunitaria del fuego e incendios forestales: prevención, monitoreo y respuesta temprana II (3 países) | 2026-10-23 | 08:00 | 17:00 | Cerrado |
| 11 | Módulo 4. Cambio climático | Estrategias de mitigación y adaptación al cambio climático de los pueblos indígenas I (3 países) | 2026-10-30 | 08:00 | 17:00 | Cerrado |
| 12 | Módulo 4. Cambio climático | Estrategias de mitigación y adaptación al cambio climático de los pueblos indígenas II (3 países) | 2026-11-06 | 08:00 | 17:00 | Cerrado |
| 13 | Expo MFC: Encuentro de Comunidad de Práctica en Manejo Forestal Comunitario, intercambio de experiencias exitosas | 15 Casos de éxito de Manejo Forestal Comunitario (4 países) | 2026-11-20 | 08:00 | 17:00 | Cerrado |
| 14 | Expo MFC: Encuentro de Comunidad de Práctica en Manejo Forestal Comunitario, intercambio de experiencias exitosas | 15 Casos de éxito de Manejo Forestal Comunitario (4 países) | 2026-11-21 | 08:00 | 17:00 | Cerrado |

## 6. Reglas de gestión

- Cada módulo debe poder crearse, verse, actualizarse, activarse y desactivarse.
- Cada sesión debe poder crearse, verse, actualizarse, activarse y desactivarse.
- Cada sesión debe tener tema, fecha, hora de inicio, hora de fin y estado.
- El estado de asistencia de cada sesión inicia como `closed`.
- Solo una sesión abierta debe aceptar registros de asistencia.
- El formulario público debe mostrar el título dinámico con el evento, la sesión y el tema.

## 7. Archivos relacionados

- `seeds/primer-evento-inauguracion-otca.json`
- `migrations/0001_configuracion_evento_inauguracion_otca.sql`
- `docs/formulario-prueba-inauguracion-otca.md`
