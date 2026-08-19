-- Migration: separa modelos reutilizables de formulario y publicaciones por evento

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS form_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source_form_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_template_sections (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE CASCADE,
  UNIQUE (template_id, section_key)
);

CREATE TABLE IF NOT EXISTS form_template_fields (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  catalog_key TEXT,
  is_required INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES form_template_sections(id) ON DELETE CASCADE,
  UNIQUE (template_id, field_key)
);

CREATE TABLE IF NOT EXISTS event_form_publications (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  form_template_id TEXT NOT NULL,
  published_form_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (form_template_id) REFERENCES form_templates(id) ON DELETE RESTRICT,
  FOREIGN KEY (published_form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE (event_id, status)
);

ALTER TABLE forms ADD COLUMN form_template_id TEXT;

INSERT OR IGNORE INTO form_templates (id, name, description, status, source_form_id)
SELECT
  'tpl_' || f.id,
  f.name,
  'Modelo creado desde formulario existente',
  CASE WHEN f.status = 'inactive' THEN 'archived' ELSE 'active' END,
  f.id
FROM forms f;

INSERT OR IGNORE INTO form_template_sections (id, template_id, section_key, title, order_index)
SELECT
  'tplsec_' || fs.id,
  'tpl_' || fs.form_id,
  fs.section_key,
  fs.title,
  fs.order_index
FROM form_sections fs;

INSERT OR IGNORE INTO form_template_fields (
  id,
  template_id,
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
  'tplfield_' || ff.id,
  'tpl_' || ff.form_id,
  'tplsec_' || ff.section_id,
  ff.field_key,
  ff.label,
  ff.field_type,
  ff.catalog_key,
  ff.is_required,
  ff.order_index,
  ff.config
FROM form_fields ff;

UPDATE forms
SET form_template_id = 'tpl_' || id
WHERE form_template_id IS NULL;

INSERT OR IGNORE INTO event_form_publications (id, event_id, form_template_id, published_form_id, status)
SELECT
  'pub_' || e.id,
  e.id,
  f.form_template_id,
  f.id,
  'active'
FROM events e
INNER JOIN forms f ON f.event_id = e.id AND f.short_link_slug = e.short_link_slug AND f.status = 'active'
WHERE f.form_template_id IS NOT NULL;
