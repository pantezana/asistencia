CREATE TABLE IF NOT EXISTS event_boards (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  participant_slug TEXT NOT NULL UNIQUE,
  presenter_slug TEXT NOT NULL UNIQUE,
  max_note_length INTEGER NOT NULL DEFAULT 800,
  allow_multiple_notes INTEGER NOT NULL DEFAULT 0,
  max_notes_per_participant INTEGER,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_event_boards_event ON event_boards(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_boards_session ON event_boards(session_id);
CREATE INDEX IF NOT EXISTS idx_event_boards_participant_slug ON event_boards(participant_slug);
CREATE INDEX IF NOT EXISTS idx_event_boards_presenter_slug ON event_boards(presenter_slug);

CREATE TABLE IF NOT EXISTS event_board_instructions (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  language_label TEXT,
  content_html TEXT NOT NULL,
  content_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES event_boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_board_instructions_board ON event_board_instructions(board_id, sort_order);

CREATE TABLE IF NOT EXISTS event_board_notes (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  session_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  country_id TEXT,
  country_name TEXT NOT NULL,
  country_iso2 TEXT,
  note_html TEXT NOT NULL,
  note_text TEXT NOT NULL,
  note_excerpt TEXT NOT NULL,
  participant_fingerprint TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES event_boards(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_board_notes_board ON event_board_notes(board_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_event_board_notes_event ON event_board_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_board_notes_fingerprint ON event_board_notes(board_id, participant_fingerprint, status);
