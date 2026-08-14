import type { EventSummary, OpenSession } from "./types";

export async function getEventBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT id, title, source_title, start_date, end_date, start_time, end_time, status, short_link_slug
       FROM events
       WHERE short_link_slug = ?`
    )
    .bind(slug)
    .first<EventSummary>();
}

export async function getOpenSessionForEvent(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT
        s.id,
        s.event_id,
        s.module_id,
        m.title AS module_title,
        s.sequence,
        s.title,
        s.theme,
        s.session_date,
        s.start_time,
        s.end_time,
        s.status,
        s.attendance_status
       FROM event_sessions s
       INNER JOIN event_modules m ON m.id = s.module_id
       WHERE s.event_id = ? AND s.attendance_status = 'open'
       LIMIT 1`
    )
    .bind(eventId)
    .first<OpenSession>();
}

export async function listEventSessions(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT
        s.id,
        s.sequence,
        s.title,
        s.theme,
        s.session_date,
        s.start_time,
        s.end_time,
        s.status,
        s.attendance_status,
        m.title AS module_title
       FROM event_sessions s
       INNER JOIN event_modules m ON m.id = s.module_id
       WHERE s.event_id = ?
       ORDER BY s.sequence`
    )
    .bind(eventId)
    .all();
}
