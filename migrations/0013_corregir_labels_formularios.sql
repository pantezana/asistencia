-- Migration: correccion de labels visibles en formularios publicos
-- Target: Cloudflare D1 / SQLite

UPDATE form_sections
SET title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title,
  'Ã¡', 'á'), 'Ã©', 'é'), 'Ã­', 'í'), 'Ã³', 'ó'), 'Ãº', 'ú'), 'Ã±', 'ñ'), 'Ã‘', 'Ñ'),
  updated_at = CURRENT_TIMESTAMP
WHERE title LIKE '%Ã%';

UPDATE form_fields
SET label = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(label,
  'Ã¡', 'á'), 'Ã©', 'é'), 'Ã­', 'í'), 'Ã³', 'ó'), 'Ãº', 'ú'), 'Ã±', 'ñ'), 'Ã‘', 'Ñ'),
  updated_at = CURRENT_TIMESTAMP
WHERE label LIKE '%Ã%';

UPDATE form_fields
SET label = 'Número Documento',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_numero_documento';

UPDATE form_fields
SET label = 'Fecha de Nacimiento',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_fecha_nac';

UPDATE form_fields
SET label = 'Correo Electrónico',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_correo_electronico';

UPDATE form_fields
SET label = 'Cuál es su actividad',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'actividad_actividad_del_productor';

UPDATE form_fields
SET label = 'Pertenece a una organización',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'organizacion_pertenece_a_organizacion';
