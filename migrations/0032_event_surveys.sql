CREATE TABLE IF NOT EXISTS event_surveys (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_id TEXT,
  title TEXT NOT NULL,
  browser_title TEXT,
  participant_slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_surveys_event ON event_surveys(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_surveys_session ON event_surveys(session_id);
CREATE INDEX IF NOT EXISTS idx_event_surveys_slug ON event_surveys(participant_slug);

CREATE TABLE IF NOT EXISTS event_survey_questions (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  description TEXT,
  allow_multiple_answers INTEGER NOT NULL DEFAULT 0,
  max_answers_per_participant INTEGER NOT NULL DEFAULT 1,
  chart_type TEXT NOT NULL DEFAULT 'bar',
  sort_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES event_surveys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_survey_questions_survey ON event_survey_questions(survey_id, status, sort_order);

CREATE TABLE IF NOT EXISTS event_survey_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  option_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES event_survey_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_survey_options_question ON event_survey_options(question_id, status, sort_order);

CREATE TABLE IF NOT EXISTS event_survey_votes (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  anonymous_participant_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES event_surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES event_survey_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES event_survey_options(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_survey_votes_survey ON event_survey_votes(survey_id, status);
CREATE INDEX IF NOT EXISTS idx_event_survey_votes_question ON event_survey_votes(question_id, status);
CREATE INDEX IF NOT EXISTS idx_event_survey_votes_participant ON event_survey_votes(question_id, anonymous_participant_key, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_survey_votes_unique_active
  ON event_survey_votes(question_id, option_id, anonymous_participant_key)
  WHERE status = 'active';
