ALTER TABLE event_dashboard_items ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';

CREATE TABLE IF NOT EXISTS event_participant_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'resource_registration',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, participant_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_participant_registrations_event
ON event_participant_registrations(event_id, source);

CREATE INDEX IF NOT EXISTS idx_event_participant_registrations_participant
ON event_participant_registrations(participant_id);
