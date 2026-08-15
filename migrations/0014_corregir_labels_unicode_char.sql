-- Migration: correccion de labels con caracteres Unicode via char()
-- Evita depender de la codificacion del archivo SQL.

UPDATE form_fields
SET label = 'N' || char(250) || 'mero Documento',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_numero_documento';

UPDATE form_fields
SET label = 'Fecha de Nacimiento',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_fecha_nac';

UPDATE form_fields
SET label = 'Correo Electr' || char(243) || 'nico',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_correo_electronico';

UPDATE form_fields
SET label = 'Cu' || char(225) || 'l es su actividad',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'actividad_actividad_del_productor';

UPDATE form_fields
SET label = 'Pertenece a una organizaci' || char(243) || 'n',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'organizacion_pertenece_a_organizacion';
