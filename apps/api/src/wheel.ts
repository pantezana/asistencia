import { createEventBoard, getEventBoardById, normalizePublicSlug, updateEventBoard, updateEventBoardStatus } from "./db";
import type { SessionUser } from "./types";

export type WheelInput = { id?: string; title?: string; durationSeconds?: number; options?: string[] };
export type WheelActivityInput = {
  title?: string;
  browserTitle?: string;
  sessionId?: string | null;
  participantSlug?: string;
  question?: string;
  instructions?: Array<{ languageLabel?: string; contentHtml?: string; sortOrder?: number }>;
  maxNoteLength?: number;
  allowMultipleNotes?: boolean;
  maxNotesPerParticipant?: number;
  wheels?: WheelInput[];
};

type WheelRow = {
  id: string;
  activity_id: string;
  title: string;
  duration_seconds: number;
  options_json: string;
  sort_order: number;
  spin_status: string;
  spin_started_at: number | null;
  spin_ends_at: number | null;
  start_angle: number;
  end_angle: number;
  selected_index: number | null;
  selected_value: string | null;
};

type ActivityRow = {
  id: string;
  event_id: string;
  session_id: string | null;
  board_id: string;
  title: string;
  browser_title: string | null;
  participant_slug: string;
  presenter_slug: string;
  status: string;
  event_title?: string;
  note_count?: number;
};

function normalizeWheels(input: WheelInput[] | undefined) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100) return null;
  const wheels = input.map((wheel, index) => ({
    id: wheel.id,
    title: String(wheel.title ?? "").trim(),
    durationSeconds: Number(wheel.durationSeconds),
    options: Array.isArray(wheel.options) ? wheel.options.map((option) => String(option).trim()) : [],
    sortOrder: index + 1
  }));
  if (wheels.some((wheel) =>
    !wheel.title || wheel.title.length > 120 ||
    !Number.isInteger(wheel.durationSeconds) || wheel.durationSeconds < 3 || wheel.durationSeconds > 60 ||
    wheel.options.length < 2 || wheel.options.length > 24 ||
    wheel.options.some((option) => !option || option.length > 80)
  )) return null;
  return wheels;
}

async function loadWheels(db: D1Database, activityId: string) {
  const now = Date.now();
  const rows = await db.prepare("SELECT * FROM event_wheels WHERE activity_id = ? ORDER BY sort_order ASC")
    .bind(activityId).all<WheelRow>();
  if (rows.results.some((row) => row.spin_status === "spinning" && Number(row.spin_ends_at) <= now)) {
    await db.prepare(
      "UPDATE event_wheels SET spin_status = 'selected' WHERE activity_id = ? AND spin_status = 'spinning' AND spin_ends_at <= ?"
    ).bind(activityId, now).run();
  }
  return rows.results.map((row) => {
    const selected = row.spin_status === "selected" || row.spin_status === "spinning" && Number(row.spin_ends_at) <= now;
    return {
      id: row.id,
      title: row.title,
      duration_seconds: row.duration_seconds,
      options: JSON.parse(row.options_json) as string[],
      sort_order: row.sort_order,
      spin_status: selected ? "selected" : row.spin_status,
      spin_started_at: row.spin_started_at,
      spin_ends_at: row.spin_ends_at,
      start_angle: row.start_angle,
      end_angle: row.end_angle,
      selected_index: selected ? row.selected_index : null,
      selected_value: selected ? row.selected_value : null
    };
  });
}

async function enrichActivity(db: D1Database, row: ActivityRow) {
  const board = await getEventBoardById(db, row.board_id);
  const wheels = await loadWheels(db, row.id);
  return {
    ...row,
    board_participant_slug: board?.participant_slug ?? "",
    question: board?.title ?? "",
    instructions: board?.instructions ?? [],
    max_note_length: board?.max_note_length ?? 800,
    allow_multiple_notes: board?.allow_multiple_notes ?? 0,
    max_notes_per_participant: board?.max_notes_per_participant ?? 1,
    wheels
  };
}

export async function listWheelActivities(db: D1Database, eventId: string) {
  const rows = await db.prepare(
    `SELECT a.*, (SELECT COUNT(*) FROM event_board_notes n WHERE n.board_id = a.board_id AND n.status = 'active') AS note_count
     FROM event_wheel_activities a WHERE a.event_id = ? ORDER BY a.created_at DESC`
  ).bind(eventId).all<ActivityRow>();
  return Promise.all(rows.results.map((row) => enrichActivity(db, row)));
}

export async function getWheelActivity(db: D1Database, slug: string, presenter: boolean) {
  const row = await db.prepare(
    `SELECT a.*, e.title AS event_title
     FROM event_wheel_activities a JOIN events e ON e.id = a.event_id
     WHERE a.${presenter ? "presenter_slug" : "participant_slug"} = ?`
  ).bind(slug).first<ActivityRow>();
  if (!row) return null;
  const activity = await enrichActivity(db, row);
  if (presenter) return activity;
  const { presenter_slug: _presenterSlug, ...publicActivity } = activity;
  return publicActivity;
}

function boardInstructions(input: WheelActivityInput, question: string) {
  const filled = (input.instructions ?? []).filter((instruction) =>
    String(instruction.contentHtml ?? "").replace(/<[^>]*>/g, "").trim()
  );
  const escapedQuestion = question.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return filled.length ? filled : [{ languageLabel: "Español", contentHtml: `<p>${escapedQuestion}</p>`, sortOrder: 1 }];
}

export async function createWheelActivity(db: D1Database, eventId: string, user: SessionUser, input: WheelActivityInput) {
  const title = String(input.title ?? "").trim();
  const question = String(input.question ?? "").trim();
  const wheels = normalizeWheels(input.wheels);
  if (!title || !question || !wheels) return { ok: false, message: "Complete el título, la pregunta y las ruletas con al menos dos opciones cada una." };
  const event = await db.prepare("SELECT short_link_slug FROM events WHERE id = ?")
    .bind(eventId).first<{ short_link_slug: string }>();
  if (!event) return { ok: false, message: "Evento no encontrado." };
  const slug = normalizePublicSlug(input.participantSlug || `${event.short_link_slug}-ruleta-${crypto.randomUUID().slice(0, 6)}`);
  if (!slug) return { ok: false, message: "Ingrese un enlace corto válido." };
  if (await db.prepare("SELECT id FROM event_wheel_activities WHERE participant_slug = ?").bind(slug).first()) {
    return { ok: false, message: "El enlace corto ya está en uso." };
  }
  const boardResult = await createEventBoard(db, eventId, user, {
    title: question,
    browserTitle: input.browserTitle || title,
    sessionId: input.sessionId,
    maxNoteLength: input.maxNoteLength,
    allowMultipleNotes: input.allowMultipleNotes,
    maxNotesPerParticipant: input.maxNotesPerParticipant,
    instructions: boardInstructions(input, question)
  });
  if (!boardResult.ok || !boardResult.board) return { ok: false, message: boardResult.message ?? "No se pudo crear la pizarra." };
  const board = boardResult.board;
  const id = `wheel_activity_${crypto.randomUUID().slice(0, 12)}`;
  const presenterSlug = `${slug}-presentador-${crypto.randomUUID().slice(0, 12)}`;
  await db.batch([
    db.prepare(
      `INSERT INTO event_wheel_activities
       (id, event_id, session_id, board_id, title, browser_title, participant_slug, presenter_slug, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, eventId, input.sessionId || null, board.id, title, input.browserTitle?.trim() || title, slug, presenterSlug, user.id),
    ...wheels.map((wheel) => db.prepare(
      `INSERT INTO event_wheels (id, activity_id, title, duration_seconds, options_json, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(`wheel_${crypto.randomUUID().slice(0, 12)}`, id, wheel.title, wheel.durationSeconds, JSON.stringify(wheel.options), wheel.sortOrder))
  ]);
  await updateEventBoardStatus(db, eventId, board.id, "open");
  return { ok: true, activity: await getWheelActivity(db, slug, false) };
}

export async function updateWheelActivity(db: D1Database, eventId: string, activityId: string, input: WheelActivityInput) {
  const current = await db.prepare("SELECT * FROM event_wheel_activities WHERE id = ? AND event_id = ?")
    .bind(activityId, eventId).first<ActivityRow>();
  if (!current) return { ok: false, message: "Ruleta no encontrada." };
  const title = String(input.title ?? "").trim();
  const question = String(input.question ?? "").trim();
  const wheels = normalizeWheels(input.wheels);
  if (!title || !question || !wheels) return { ok: false, message: "Complete el título, la pregunta y las ruletas con sus opciones." };
  const slug = normalizePublicSlug(input.participantSlug || current.participant_slug);
  if (!slug) return { ok: false, message: "Ingrese un enlace corto válido." };
  if (slug !== current.participant_slug) {
    if (await db.prepare("SELECT id FROM event_wheel_activities WHERE participant_slug = ? AND id <> ?")
      .bind(slug, activityId).first()) return { ok: false, message: "El enlace corto ya está en uso." };
    const count = await db.prepare("SELECT COUNT(*) AS total FROM event_board_notes WHERE board_id = ? AND status = 'active'")
      .bind(current.board_id).first<{ total: number }>();
    if (Number(count?.total || 0) > 0) return { ok: false, message: "No se puede cambiar el enlace después de recibir respuestas." };
  }
  const existing = await db.prepare("SELECT * FROM event_wheels WHERE activity_id = ?")
    .bind(activityId).all<WheelRow>();
  if (existing.results.some((wheel) => wheel.spin_status === "spinning" && Number(wheel.spin_ends_at) > Date.now())) {
    return { ok: false, message: "Espere a que termine el giro antes de editar las ruletas." };
  }
  const existingIds = new Set(existing.results.map((wheel) => wheel.id));
  if (wheels.some((wheel) => wheel.id && !existingIds.has(wheel.id))) {
    return { ok: false, message: "Una ruleta ya no pertenece a esta dinámica. Actualice la página." };
  }
  const board = await getEventBoardById(db, current.board_id);
  if (!board) return { ok: false, message: "Pizarra no encontrada." };
  const boardResult = await updateEventBoard(db, eventId, board.id, {
    title: question,
    browserTitle: input.browserTitle || title,
    sessionId: input.sessionId,
    participantSlug: board.participant_slug,
    maxNoteLength: input.maxNoteLength,
    allowMultipleNotes: input.allowMultipleNotes,
    maxNotesPerParticipant: input.maxNotesPerParticipant,
    instructions: boardInstructions(input, question)
  });
  if (!boardResult.ok) return { ok: false, message: boardResult.message ?? "No se pudo actualizar la pizarra." };
  const retainedIds = wheels.map((wheel) => wheel.id).filter(Boolean) as string[];
  const statements: D1PreparedStatement[] = [
    db.prepare(
      `UPDATE event_wheel_activities SET title = ?, browser_title = ?, session_id = ?, participant_slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(title, input.browserTitle?.trim() || title, input.sessionId || null, slug, activityId)
  ];
  for (const wheel of wheels) {
    if (wheel.id) {
      const previous = existing.results.find((item) => item.id === wheel.id)!;
      const changedOptions = previous.options_json !== JSON.stringify(wheel.options);
      statements.push(db.prepare(
        `UPDATE event_wheels SET title = ?, duration_seconds = ?, options_json = ?, sort_order = ?,
         spin_status = CASE WHEN ? THEN 'initial' ELSE spin_status END,
         spin_started_at = CASE WHEN ? THEN NULL ELSE spin_started_at END,
         spin_ends_at = CASE WHEN ? THEN NULL ELSE spin_ends_at END,
         start_angle = CASE WHEN ? THEN 0 ELSE start_angle END,
         end_angle = CASE WHEN ? THEN 0 ELSE end_angle END,
         selected_index = CASE WHEN ? THEN NULL ELSE selected_index END,
         selected_value = CASE WHEN ? THEN NULL ELSE selected_value END,
         updated_at = CURRENT_TIMESTAMP WHERE id = ? AND activity_id = ?`
      ).bind(wheel.title, wheel.durationSeconds, JSON.stringify(wheel.options), wheel.sortOrder,
        ...Array(7).fill(changedOptions ? 1 : 0), wheel.id, activityId));
    } else {
      statements.push(db.prepare(
        `INSERT INTO event_wheels (id, activity_id, title, duration_seconds, options_json, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(`wheel_${crypto.randomUUID().slice(0, 12)}`, activityId, wheel.title, wheel.durationSeconds, JSON.stringify(wheel.options), wheel.sortOrder));
    }
  }
  for (const previous of existing.results) {
    if (!retainedIds.includes(previous.id)) statements.push(db.prepare("DELETE FROM event_wheels WHERE id = ? AND activity_id = ?").bind(previous.id, activityId));
  }
  await db.batch(statements);
  return { ok: true, activity: await getWheelActivity(db, slug, false) };
}

export async function changeWheelActivityStatus(db: D1Database, eventId: string, activityId: string, status: string) {
  if (!["open", "closed", "archived"].includes(status)) return false;
  const row = await db.prepare("SELECT board_id FROM event_wheel_activities WHERE id = ? AND event_id = ?")
    .bind(activityId, eventId).first<{ board_id: string }>();
  if (!row) return false;
  await db.prepare("UPDATE event_wheel_activities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, activityId).run();
  await updateEventBoardStatus(db, eventId, row.board_id, status);
  return true;
}

function randomIndex(length: number) {
  const range = 0x100000000;
  const limit = Math.floor(range / length) * length;
  const bytes = new Uint32Array(1);
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % length;
}

export async function spinWheel(db: D1Database, presenterSlug: string, wheelId: string) {
  const activity = await db.prepare("SELECT id, status FROM event_wheel_activities WHERE presenter_slug = ?")
    .bind(presenterSlug).first<{ id: string; status: string }>();
  if (!activity || activity.status !== "open") return { ok: false, message: "La dinámica no está abierta." };
  const wheel = await db.prepare("SELECT * FROM event_wheels WHERE id = ? AND activity_id = ?")
    .bind(wheelId, activity.id).first<WheelRow>();
  if (!wheel) return { ok: false, message: "Ruleta no encontrada." };
  const now = Date.now();
  if (wheel.spin_status === "spinning" && Number(wheel.spin_ends_at) > now) {
    return { ok: false, message: "La ruleta ya está girando." };
  }
  const options = JSON.parse(wheel.options_json) as string[];
  const selectedIndex = randomIndex(options.length);
  const startAngle = wheel.spin_status === "initial" ? 0 : ((wheel.end_angle % 360) + 360) % 360;
  const targetAngle = (selectedIndex + 0.5) * (360 / options.length);
  const delta = ((targetAngle - startAngle) % 360 + 360) % 360;
  const endAngle = startAngle + (5 + randomIndex(4)) * 360 + delta;
  const endsAt = now + wheel.duration_seconds * 1000;
  const result = await db.prepare(
    `UPDATE event_wheels SET spin_status = 'spinning', spin_started_at = ?, spin_ends_at = ?,
     start_angle = ?, end_angle = ?, selected_index = ?, selected_value = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND activity_id = ? AND (spin_status <> 'spinning' OR spin_ends_at <= ?)`
  ).bind(now, endsAt, startAngle, endAngle, selectedIndex, options[selectedIndex], wheelId, activity.id, now).run();
  if (!result.meta.changes) return { ok: false, message: "La ruleta ya está girando." };
  return { ok: true, activity: await getWheelActivity(db, presenterSlug, true), server_now: Date.now() };
}
