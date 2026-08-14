import type { AdminEvent, DbUserWithPassword, EventSummary, OpenSession, SessionUser } from "./types";

function canSeeAllEvents(user: SessionUser) {
  return user.roles.includes("administrador");
}

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

export async function listAdminEvents(db: D1Database, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "" : "WHERE e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      e.id,
      e.title,
      e.source_title,
      e.start_date,
      e.end_date,
      e.start_time,
      e.end_time,
      e.status,
      e.short_link_slug,
      COUNT(DISTINCT m.id) AS module_count,
      COUNT(DISTINCT s.id) AS session_count,
      COUNT(DISTINCT CASE WHEN s.attendance_status = 'open' THEN s.id END) AS open_session_count
     FROM events e
     LEFT JOIN event_modules m ON m.event_id = e.id
     LEFT JOIN event_sessions s ON s.event_id = e.id
     ${whereSql}
     GROUP BY e.id
     ORDER BY e.created_at DESC`
  );

  return canSeeAllEvents(user) ? statement.all<AdminEvent>() : statement.bind(user.id).all<AdminEvent>();
}

export async function userCanManageEvent(db: D1Database, eventId: string, user: SessionUser) {
  if (canSeeAllEvents(user)) {
    const event = await db.prepare("SELECT id FROM events WHERE id = ?").bind(eventId).first<{ id: string }>();
    return Boolean(event);
  }

  return db
    .prepare("SELECT id FROM events WHERE id = ? AND created_by_user_id = ?")
    .bind(eventId, user.id)
    .first<{ id: string }>()
    .then(Boolean);
}

export async function listEventModules(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT id, title, order_index, status
       FROM event_modules
       WHERE event_id = ?
       ORDER BY order_index`
    )
    .bind(eventId)
    .all();
}

export async function getSessionById(db: D1Database, sessionId: string) {
  return db
    .prepare(
      `SELECT id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status
       FROM event_sessions
       WHERE id = ?`
    )
    .bind(sessionId)
    .first<OpenSession>();
}

export async function openEventSession(db: D1Database, eventId: string, sessionId: string) {
  const existing = await getSessionById(db, sessionId);

  if (!existing || existing.event_id !== eventId) {
    return { ok: false, message: "Sesión no encontrada." };
  }

  await db.batch([
    db
      .prepare(
        `UPDATE event_sessions
         SET attendance_status = 'closed', status = 'closed', updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND attendance_status = 'open'`
      )
      .bind(eventId),
    db
      .prepare(
        `UPDATE event_sessions
         SET attendance_status = 'open', status = 'open', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND event_id = ?`
      )
      .bind(sessionId, eventId)
  ]);

  return { ok: true };
}

export async function closeEventSession(db: D1Database, eventId: string, sessionId: string) {
  const result = await db
    .prepare(
      `UPDATE event_sessions
       SET attendance_status = 'closed', status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND event_id = ?`
    )
    .bind(sessionId, eventId)
    .run();

  return result.meta.changes > 0;
}

export async function getUserForLogin(db: D1Database, login: string) {
  return db
    .prepare(
      `SELECT
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.password_hash,
        u.status,
        GROUP_CONCAT(r.role_key) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id AND r.status = 'active'
       WHERE (LOWER(u.username) = LOWER(?) OR LOWER(u.email) = LOWER(?))
         AND u.status = 'active'
       GROUP BY u.id`
    )
    .bind(login, login)
    .first<DbUserWithPassword>();
}
