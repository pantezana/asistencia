ALTER TABLE event_questions ADD COLUMN max_selectable_concepts INTEGER NOT NULL DEFAULT 5;

CREATE TABLE IF NOT EXISTS event_question_selections (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  normalized_answer TEXT NOT NULL,
  display_answer TEXT NOT NULL,
  selection_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES event_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_selections_question ON event_question_selections(question_id, status);
CREATE INDEX IF NOT EXISTS idx_question_selections_participant ON event_question_selections(question_id, participant_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_selections_unique_active
  ON event_question_selections(question_id, participant_id, normalized_answer)
  WHERE status = 'active';
