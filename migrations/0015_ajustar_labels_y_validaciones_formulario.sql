-- Migration: labels finales para datos generales.

UPDATE form_fields
SET label = 'Apellido Paterno',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_paterno';

UPDATE form_fields
SET label = 'Apellido Materno',
  updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'datos_generales_materno';
