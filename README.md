# Asistencia

Aplicación para gestionar eventos, módulos, sesiones, formularios públicos de asistencia, participantes y reportes exportables.

## Estructura

- `apps/api`: Cloudflare Worker con API y acceso a D1.
- `apps/web`: frontend React/Vite para panel administrativo y formulario público.
- `migrations`: migraciones SQLite/D1.
- `seeds`: configuraciones semilla extraídas desde Excel.
- `docs`: contexto y especificaciones funcionales.

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Ejecutar API local:

```bash
npm run dev:api
```

Ejecutar frontend local:

```bash
npm run dev:web
```

El frontend queda en `http://localhost:5173` y proxy hacia el Worker local en `http://127.0.0.1:8787`.

## Base de datos

Aplicar migraciones locales:

```bash
npm run db:migrate:local
```

Antes de desplegar en Cloudflare se debe:

1. Crear la base D1 `asistencia-db`.
2. Reemplazar `database_id` en `apps/api/wrangler.toml`.
3. Ejecutar migraciones remotas con `npm run db:migrate:remote`.

## Despliegue

Build frontend:

```bash
npm run build
```

Desplegar API:

```bash
npm run deploy:api
```

Desplegar Pages:

```bash
npm run deploy:web
```

Despliegue completo:

```bash
npm run deploy
```

## Estado

Primera base técnica creada para iniciar desarrollo incremental:

- Worker API con healthcheck y formulario público por slug.
- Frontend React/Vite responsivo inicial.
- Migraciones iniciales para eventos, módulos, sesiones, formularios, participantes, catálogos y asistencias.
