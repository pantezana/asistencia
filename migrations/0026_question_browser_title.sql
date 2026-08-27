ALTER TABLE event_questions ADD COLUMN browser_title TEXT;

UPDATE event_questions
SET browser_title = question_text
WHERE browser_title IS NULL OR trim(browser_title) = '';
