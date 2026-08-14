-- Migration: ajusta reglas y etiquetas de organizacion

UPDATE form_fields
SET label = 'Pertenece a una organización',
    updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'organizacion_pertenece_a_organizacion';

UPDATE form_fields
SET is_required = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE field_key = 'organizacion_ruc';
