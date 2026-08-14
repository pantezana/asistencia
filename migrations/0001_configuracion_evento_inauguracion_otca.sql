-- Migration: configuracion inicial del evento Inauguracion OTCA
-- Source: C:/Users/USUARIO/Downloads/SESIONES_EVENTO.xlsx
-- Target: Cloudflare D1 / SQLite

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_title TEXT,
  theme TEXT,
  start_date TEXT,
  end_date TEXT,
  start_time TEXT,
  end_time TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  short_link_slug TEXT UNIQUE,
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_modules (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE (event_id, order_index)
);

CREATE TABLE IF NOT EXISTS event_sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  session_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'closed',
  attendance_status TEXT NOT NULL DEFAULT 'closed',
  source_status TEXT,
  source_event_title TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES event_modules(id) ON DELETE CASCADE,
  UNIQUE (event_id, sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_sessions_one_open_attendance_per_event
ON event_sessions(event_id)
WHERE attendance_status = 'open';

INSERT INTO events (id, title, source_title, theme, start_date, end_date, start_time, end_time, status, short_link_slug) VALUES (
  'evt_inauguracion_otca', 'Inauguración: Comunidad de Práctica en Manejo Forestal Comunitario Amazónico, en el marco de la OTCA', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA', '2026-08-21', '2026-11-21', '08:00', '17:00', 'draft', 'inauguracion-otca'
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  source_title = excluded.source_title,
  theme = excluded.theme,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  status = excluded.status,
  short_link_slug = excluded.short_link_slug,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES ('mod_01_modulo_1_institucionalidad_gobernanza_y_marco_legal', 'evt_inauguracion_otca', 'Módulo 1. Institucionalidad, gobernanza y marco legal', 1, 'active')
ON CONFLICT(id) DO UPDATE SET title = excluded.title, order_index = excluded.order_index, status = excluded.status, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES ('mod_02_modulo_2_manejo_sostenible_de_los_recursos_forestales_y_de_fauna_silvestre', 'evt_inauguracion_otca', 'Módulo 2. Manejo sostenible de los recursos forestales y de fauna silvestre', 2, 'active')
ON CONFLICT(id) DO UPDATE SET title = excluded.title, order_index = excluded.order_index, status = excluded.status, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES ('mod_03_modulo_3_sistemas_productivos_innovadores', 'evt_inauguracion_otca', 'Módulo 3. Sistemas productivos innovadores', 3, 'active')
ON CONFLICT(id) DO UPDATE SET title = excluded.title, order_index = excluded.order_index, status = excluded.status, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES ('mod_04_modulo_4_cambio_climatico', 'evt_inauguracion_otca', 'Módulo 4. Cambio climático', 4, 'active')
ON CONFLICT(id) DO UPDATE SET title = excluded.title, order_index = excluded.order_index, status = excluded.status, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES ('mod_05_expo_mfc_encuentro_de_comunidad_de_practica_en_manejo_forestal_comunitario_intercambio_de_experiencias_exitosas', 'evt_inauguracion_otca', 'Expo MFC: Encuentro de Comunidad de Práctica en Manejo Forestal Comunitario, intercambio de experiencias exitosas', 5, 'active')
ON CONFLICT(id) DO UPDATE SET title = excluded.title, order_index = excluded.order_index, status = excluded.status, updated_at = CURRENT_TIMESTAMP;

INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_01', 'evt_inauguracion_otca', 'mod_01_modulo_1_institucionalidad_gobernanza_y_marco_legal', 1, 'Sesión 1', 'Institucionalidad, gobernanza y marco legal del sector forestal y de fauna silvestre I (3 países)', '2026-08-21', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_02', 'evt_inauguracion_otca', 'mod_01_modulo_1_institucionalidad_gobernanza_y_marco_legal', 2, 'Sesión 2', 'Institucionalidad, gobernanza y marco legal del sector forestal y de fauna silvestre II (3 países)', '2026-08-26', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_03', 'evt_inauguracion_otca', 'mod_02_modulo_2_manejo_sostenible_de_los_recursos_forestales_y_de_fauna_silvestre', 3, 'Sesión 3', 'Acceso, aprovechamiento y vigilancia comunitaria de los recursos forestales y de fauna silvestre I (3 países)', '2026-09-04', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_04', 'evt_inauguracion_otca', 'mod_02_modulo_2_manejo_sostenible_de_los_recursos_forestales_y_de_fauna_silvestre', 4, 'Sesión 4', 'Acceso, aprovechamiento y vigilancia comunitaria de los recursos forestales y de fauna silvestre II (3 países)', '2026-09-11', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_05', 'evt_inauguracion_otca', 'mod_03_modulo_3_sistemas_productivos_innovadores', 5, 'Sesión 5', 'Sistemas productivos sostenibles: Plantaciones forestales, Sistemas agroforestales y silvopastoriles I (3 países)', '2026-09-18', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_06', 'evt_inauguracion_otca', 'mod_03_modulo_3_sistemas_productivos_innovadores', 6, 'Sesión 6', 'Sistemas productivos sostenibles: Plantaciones forestales, Sistemas agroforestales y silvopastoriles II (3 países)', '2026-09-25', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_07', 'evt_inauguracion_otca', 'mod_03_modulo_3_sistemas_productivos_innovadores', 7, 'Sesión 7', 'Manejo Comunal de Fauna Silvestre (Caza, zoocriaderos, ecoturismo) I (3 países)', '2026-09-30', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_08', 'evt_inauguracion_otca', 'mod_03_modulo_3_sistemas_productivos_innovadores', 8, 'Sesión 8', 'Manejo Comunal de Fauna Silvestre (Caza, zoocriaderos, ecoturismo) II (3 países)', '2026-10-09', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_09', 'evt_inauguracion_otca', 'mod_04_modulo_4_cambio_climatico', 9, 'Sesión 9', 'Gestión comunitaria del fuego e incendios forestales: prevención, monitoreo y respuesta temprana I (3 países)', '2026-10-16', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_10', 'evt_inauguracion_otca', 'mod_04_modulo_4_cambio_climatico', 10, 'Sesión 10', 'Gestión comunitaria del fuego e incendios forestales: prevención, monitoreo y respuesta temprana II (3 países)', '2026-10-23', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_11', 'evt_inauguracion_otca', 'mod_04_modulo_4_cambio_climatico', 11, 'Sesión 11', 'Estrategias de mitigación y adaptación al cambio climático de los pueblos indígenas I (3 países)', '2026-10-30', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_12', 'evt_inauguracion_otca', 'mod_04_modulo_4_cambio_climatico', 12, 'Sesión 12', 'Estrategias de mitigación y adaptación al cambio climático de los pueblos indígenas II (3 países)', '2026-11-06', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_13', 'evt_inauguracion_otca', 'mod_05_expo_mfc_encuentro_de_comunidad_de_practica_en_manejo_forestal_comunitario_intercambio_de_experiencias_exitosas', 13, 'Sesión 13', '15 Casos de éxito de Manejo Forestal Comunitario (4 países)', '2026-11-20', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status, source_status, source_event_title) VALUES ('ses_inauguracion_otca_14', 'evt_inauguracion_otca', 'mod_05_expo_mfc_encuentro_de_comunidad_de_practica_en_manejo_forestal_comunitario_intercambio_de_experiencias_exitosas', 14, 'Sesión 14', '15 Casos de éxito de Manejo Forestal Comunitario (4 países)', '2026-11-21', '08:00', '17:00', 'closed', 'closed', 'Cerrado', 'Comunidad de Práctica en Manejo Forestal Comunitario Amazónico: Para la Cooperación Regional Amazónica, en el marco de la OTCA')
ON CONFLICT(event_id, sequence) DO UPDATE SET module_id = excluded.module_id, title = excluded.title, theme = excluded.theme, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status, attendance_status = excluded.attendance_status, source_status = excluded.source_status, source_event_title = excluded.source_event_title, updated_at = CURRENT_TIMESTAMP;
