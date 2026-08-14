-- Migration: normaliza caracteres fuera del alfabeto castellano en catalogos

UPDATE system_catalog_items
SET name = 'Cote d''Ivoire',
    description = 'Cote d''Ivoire',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'catitem_pais_48_cote_d_ivoire';
