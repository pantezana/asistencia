CREATE TABLE IF NOT EXISTS event_wheel_activities (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_id TEXT,
  board_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  browser_title TEXT,
  participant_slug TEXT NOT NULL UNIQUE,
  presenter_slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open',
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (board_id) REFERENCES event_boards(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_event_wheel_activities_event ON event_wheel_activities(event_id, status);

CREATE TABLE IF NOT EXISTS event_wheels (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  options_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  spin_status TEXT NOT NULL DEFAULT 'initial',
  spin_started_at INTEGER,
  spin_ends_at INTEGER,
  start_angle REAL NOT NULL DEFAULT 0,
  end_angle REAL NOT NULL DEFAULT 0,
  selected_index INTEGER,
  selected_value TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES event_wheel_activities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_wheels_activity ON event_wheels(activity_id, sort_order);
