-- Migration: ajusta etiqueta de actividad en formulario OTCA

UPDATE form_fields
SET label = 'Actividad',
    updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'actividad_actividad_del_productor';
