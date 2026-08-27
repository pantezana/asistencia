CREATE TABLE IF NOT EXISTS event_dashboards (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  browser_title TEXT,
  short_link_slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_event_dashboards_slug ON event_dashboards(short_link_slug);
CREATE INDEX IF NOT EXISTS idx_event_dashboards_event ON event_dashboards(event_id, status);

CREATE TABLE IF NOT EXISTS event_dashboard_instructions (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  language_label TEXT,
  content_html TEXT NOT NULL,
  content_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dashboard_id) REFERENCES event_dashboards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_dashboard_instructions_dashboard
ON event_dashboard_instructions(dashboard_id, status, sort_order);

CREATE TABLE IF NOT EXISTS event_dashboard_items (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  session_id TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('event', 'session')),
  name TEXT NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('text', 'link')),
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dashboard_id) REFERENCES event_dashboards(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_dashboard_items_dashboard
ON event_dashboard_items(dashboard_id, scope, status, sort_order);

CREATE INDEX IF NOT EXISTS idx_event_dashboard_items_session
ON event_dashboard_items(session_id, status, sort_order);
