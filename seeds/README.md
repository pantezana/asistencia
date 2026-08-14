# Seeds del Proyecto

Esta carpeta contiene configuraciones iniciales derivadas de documentos de análisis o archivos fuente.

Archivos actuales:

- `primer-evento-inauguracion-otca.json`: configuración semilla del primer evento de prueba, sus módulos, sus 14 sesiones y el formulario asociado.
- `catalogos-formulario-asistencia.json`: catálogos extraídos del Excel `FormularioAsistencia.xlsx`.

Notas:

- El evento de prueba fue actualizado con 5 módulos y 14 sesiones reales.
- La migración SQL inicial del evento está en `migrations/0001_configuracion_evento_inauguracion_otca.sql`.
- Los catálogos todavía se mantienen como seed JSON y se convertirán a migración cuando se cierre el modelo final de catálogos.
