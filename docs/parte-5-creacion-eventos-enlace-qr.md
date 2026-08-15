# Parte 5: Creacion de Eventos, Enlace Corto y QR

Estado: implementado inicialmente.

## Alcance

- Crear un evento desde el panel administrativo.
- Registrar los datos generales del evento.
- Crear el cronograma inicial con una o mas sesiones.
- Agrupar sesiones por modulo.
- Generar automaticamente un formulario activo para el evento.
- Clonar la estructura del formulario base `form_inauguracion_otca`.
- Generar enlace publico corto bajo `/f/{slug}`.
- Generar QR en formato SVG bajo `/api/public/forms/{slug}/qr`.

## Reglas

- Solo usuarios autenticados pueden crear eventos.
- El administrador puede ver todos los eventos.
- El supervisor solo ve los eventos que crea.
- Las sesiones nuevas se crean cerradas.
- El formulario publico solo permite registrar asistencia cuando exista una sesion abierta del evento.
- Se mantiene la regla de una sola sesion abierta por evento.

## Validacion realizada

- `npm run typecheck`
- `npm run build`
- `npm run build:worker`
- `npx wrangler deploy`
- Prueba remota de creacion de evento, formulario publico y QR.
