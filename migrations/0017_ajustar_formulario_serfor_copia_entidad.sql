-- Migration: ajusta el formulario clonado de SERFOR Educa para registro simplificado
-- Alcance: solo Formulario de asistencia - SERFOR Educa - copia

PRAGMA foreign_keys = ON;

INSERT INTO system_catalogs (id, catalog_key, name, description, status)
VALUES ('cat_entidad', 'entidad', 'Entidad', 'Entidades para formularios de asistencia', 'active')
ON CONFLICT(catalog_key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  status = 'active',
  updated_at = CURRENT_TIMESTAMP;

INSERT OR IGNORE INTO system_catalog_items (id, catalog_id, source_id, name, description, status, metadata) VALUES
  ('catitem_entidad_01_cna', 'cat_entidad', '1', 'CNA', 'CNA', 'active', '{"order":1}'),
  ('catitem_entidad_02_conap', 'cat_entidad', '2', 'CONAP', 'CONAP', 'active', '{"order":2}'),
  ('catitem_entidad_03_envol_vert_peru', 'cat_entidad', '3', 'ENVOL VERT PERU', 'ENVOL VERT PERU', 'active', '{"order":3}'),
  ('catitem_entidad_04_jica', 'cat_entidad', '4', 'JICA', 'JICA', 'active', '{"order":4}'),
  ('catitem_entidad_05_mincetur', 'cat_entidad', '5', 'MINCETUR', 'MINCETUR', 'active', '{"order":5}'),
  ('catitem_entidad_06_minedu', 'cat_entidad', '6', 'MINEDU', 'MINEDU', 'active', '{"order":6}'),
  ('catitem_entidad_07_mininter', 'cat_entidad', '7', 'MININTER', 'MININTER', 'active', '{"order":7}'),
  ('catitem_entidad_08_osinfor', 'cat_entidad', '8', 'OSINFOR', 'OSINFOR', 'active', '{"order":8}'),
  ('catitem_entidad_09_produce', 'cat_entidad', '9', 'PRODUCE', 'PRODUCE', 'active', '{"order":9}'),
  ('catitem_entidad_10_profonanpe', 'cat_entidad', '10', 'PROFONANPE', 'PROFONANPE', 'active', '{"order":10}'),
  ('catitem_entidad_11_serfor', 'cat_entidad', '11', 'SERFOR', 'SERFOR', 'active', '{"order":11}'),
  ('catitem_entidad_12_unesco', 'cat_entidad', '12', 'UNESCO', 'UNESCO', 'active', '{"order":12}'),
  ('catitem_entidad_13_otro', 'cat_entidad', '13', 'OTRO', 'OTRO', 'active', '{"order":13}');

UPDATE system_catalog_items
SET status = 'active', updated_at = CURRENT_TIMESTAMP
WHERE catalog_id = 'cat_entidad';

UPDATE form_fields
SET order_index = 12, updated_at = CURRENT_TIMESTAMP
WHERE form_id = 'form_clone_f4c2cbe9'
  AND field_key = 'datos_generales_etnia';

INSERT OR IGNORE INTO form_fields (
  id,
  form_id,
  section_id,
  field_key,
  label,
  field_type,
  catalog_key,
  is_required,
  order_index,
  config
)
SELECT
  'field_datos_generales_entidad_f4c2cbe9',
  'form_clone_f4c2cbe9',
  fs.id,
  'datos_generales_entidad',
  'Entidad',
  'select',
  'entidad',
  1,
  11,
  '{}'
FROM form_sections fs
WHERE fs.form_id = 'form_clone_f4c2cbe9'
  AND fs.section_key = 'datos_generales';

DELETE FROM form_fields
WHERE form_id = 'form_clone_f4c2cbe9'
  AND section_id IN (
    SELECT id
    FROM form_sections
    WHERE form_id = 'form_clone_f4c2cbe9'
      AND section_key IN ('ubicacion', 'actividad', 'organizacion')
  );

DELETE FROM form_sections
WHERE form_id = 'form_clone_f4c2cbe9'
  AND section_key IN ('ubicacion', 'actividad', 'organizacion');
