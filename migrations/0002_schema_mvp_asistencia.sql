-- Migration: esquema MVP para formularios, participantes y asistencia
-- Target: Cloudflare D1 / SQLite

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  paternal_last_name TEXT,
  maternal_last_name TEXT,
  email TEXT,
  phone TEXT,
  profile_data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (document_type, document_number)
);

CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  short_link_slug TEXT NOT NULL UNIQUE,
  welcome_title_template TEXT NOT NULL,
  cloned_from_form_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (cloned_from_form_id) REFERENCES forms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS form_sections (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE (form_id, section_key)
);

CREATE TABLE IF NOT EXISTS form_fields (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
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
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES form_sections(id) ON DELETE CASCADE,
  UNIQUE (form_id, field_key)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  form_id TEXT,
  registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registration_channel TEXT NOT NULL DEFAULT 'public_form',
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES event_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL,
  UNIQUE (session_id, participant_id)
);

CREATE TABLE IF NOT EXISTS system_catalogs (
  id TEXT PRIMARY KEY,
  catalog_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_catalog_items (
  id TEXT PRIMARY KEY,
  catalog_id TEXT NOT NULL,
  parent_item_id TEXT,
  source_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (catalog_id) REFERENCES system_catalogs(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_item_id) REFERENCES system_catalog_items(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_participants_document ON participants(document_type, document_number);
CREATE INDEX IF NOT EXISTS idx_attendance_event_session ON attendance_records(event_id, session_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_catalog ON system_catalog_items(catalog_id, status);
