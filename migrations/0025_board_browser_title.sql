ALTER TABLE event_boards ADD COLUMN browser_title TEXT;

UPDATE event_boards
SET browser_title = title
WHERE browser_title IS NULL OR trim(browser_title) = '';
