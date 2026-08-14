# Migraciones

Esta carpeta contiene migraciones SQL preparadas para Cloudflare D1 / SQLite.

Archivos actuales:

- `0001_configuracion_evento_inauguracion_otca.sql`: crea las tablas mínimas de eventos, módulos y sesiones, y carga la configuración del primer evento de prueba.

La migración está preparada como base inicial. Cuando se implemente la aplicación, deberá integrarse con `wrangler d1 migrations` y alinearse con el esquema definitivo del proyecto.
