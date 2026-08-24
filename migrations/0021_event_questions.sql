CREATE TABLE IF NOT EXISTS event_questions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_id TEXT,
  question_text TEXT NOT NULL,
  description TEXT,
  interaction_type TEXT NOT NULL DEFAULT 'word_cloud',
  status TEXT NOT NULL DEFAULT 'draft',
  allow_multiple_responses INTEGER NOT NULL DEFAULT 0,
  allow_response_update INTEGER NOT NULL DEFAULT 0,
  max_responses_per_participant INTEGER,
  max_answer_length INTEGER NOT NULL DEFAULT 80,
  participant_slug TEXT NOT NULL UNIQUE,
  presenter_slug TEXT NOT NULL UNIQUE,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_questions_event ON event_questions(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_questions_participant_slug ON event_questions(participant_slug);
CREATE INDEX IF NOT EXISTS idx_event_questions_presenter_slug ON event_questions(presenter_slug);

CREATE TABLE IF NOT EXISTS event_question_responses (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  normalized_answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES event_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_responses_question ON event_question_responses(question_id, status);
CREATE INDEX IF NOT EXISTS idx_question_responses_participant ON event_question_responses(question_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_normalized ON event_question_responses(question_id, normalized_answer);
