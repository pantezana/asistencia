-- Migration: renombra etiqueta de actividad en formularios

UPDATE form_fields
SET label = 'Cuál es su actividad',
    updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'actividad_actividad_del_productor';
