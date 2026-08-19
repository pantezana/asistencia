-- Migration: paleta de secciones y controles para editor dinamico de modelos

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS form_section_definitions (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_control_definitions (
  id TEXT PRIMARY KEY,
  control_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  catalog_key TEXT,
  default_required INTEGER NOT NULL DEFAULT 1,
  validation_rules TEXT NOT NULL DEFAULT '{}',
  default_config TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_control_definitions_status
ON form_control_definitions(status, label);

CREATE INDEX IF NOT EXISTS idx_form_section_definitions_status
ON form_section_definitions(status, title);

INSERT OR IGNORE INTO form_section_definitions (id, section_key, title, status)
SELECT
  'secdef_' || section_key,
  section_key,
  MIN(title),
  'active'
FROM form_template_sections
GROUP BY section_key;

INSERT OR IGNORE INTO form_control_definitions (
  id,
  control_key,
  label,
  field_type,
  catalog_key,
  default_required,
  default_config,
  status
)
SELECT
  'ctrldef_' || field_key,
  field_key,
  MIN(label),
  MIN(field_type),
  MIN(catalog_key),
  MAX(is_required),
  COALESCE(MIN(config), '{}'),
  'active'
FROM form_template_fields
GROUP BY field_key;

INSERT INTO system_catalogs (id, catalog_key, name, description, status)
VALUES ('cat_rangoedad', 'rangoedad', 'Rango de edad', 'Rangos de edad para formularios de asistencia', 'active')
ON CONFLICT(catalog_key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  status = 'active',
  updated_at = CURRENT_TIMESTAMP;

INSERT OR IGNORE INTO system_catalog_items (id, catalog_id, source_id, name, description, status)
VALUES
  ('catitem_rangoedad_menos_18', 'cat_rangoedad', 'menos_18', 'menos de 18 años', 'menos de 18 años', 'active'),
  ('catitem_rangoedad_18_30', 'cat_rangoedad', '18_30', '18 a 30 años', '18 a 30 años', 'active'),
  ('catitem_rangoedad_31_55', 'cat_rangoedad', '31_55', '31 a 55 años', '31 a 55 años', 'active'),
  ('catitem_rangoedad_56_mas', 'cat_rangoedad', '56_mas', '56 años a más', '56 años a más', 'active');

INSERT OR IGNORE INTO form_control_definitions (
  id,
  control_key,
  label,
  field_type,
  catalog_key,
  default_required,
  validation_rules,
  default_config,
  status
)
VALUES (
  'ctrldef_rango_edad',
  'rango_edad',
  'Rango de edad',
  'select',
  'rangoedad',
  1,
  '{}',
  '{}',
  'active'
);
