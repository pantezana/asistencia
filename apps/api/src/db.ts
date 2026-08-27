import type {
  AdminEvent,
  AdminForm,
  Catalog,
  CatalogItem,
  DbUserWithPassword,
  EventBoard,
  EventBoardInstruction,
  EventBoardNote,
  EventDashboard,
  EventDashboardInstruction,
  EventDashboardItem,
  EventDashboardSession,
  EventSummary,
  EventQuestion,
  EventQuestionResponseItem,
  EventQuestionSelectionGroup,
  EventQuestionSelectionItem,
  EventQuestionSummaryItem,
  FormControlDefinition,
  FormField,
  FormSectionDefinition,
  FormSection,
  FormTemplate,
  LocationOption,
  OpenSession,
  Participant,
  SessionUser
} from "./types";

function normalizeIdentity(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toFieldKey(label: string, fallback: string) {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function applyTextValidationConfig(config: Record<string, unknown>, fieldType: string, textValidation?: string) {
  const next = { ...config };
  delete next.textValidation;

  if (fieldType !== "text") {
    return next;
  }

  if (textValidation === "letters" || textValidation === "numbers" || textValidation === "none") {
    next.textValidation = textValidation;
  }

  return next;
}

function catalogOrderSql() {
  return `
    CASE
      WHEN c.catalog_key = 'rangoedad' THEN
        CASE i.source_id
          WHEN 'menos_18' THEN 1
          WHEN '18_30' THEN 2
          WHEN '31_55' THEN 3
          WHEN '56_mas' THEN 4
          ELSE 99
        END
      ELSE CASE WHEN UPPER(i.name) LIKE 'OTRO%' THEN 1 ELSE 0 END
    END,
    CASE WHEN c.catalog_key = 'rangoedad' THEN 0 ELSE i.name END,
    i.name`;
}

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function uniqueQuestionSlug(db: D1Database, base: string, column: "participant_slug" | "presenter_slug") {
  let slug = normalizePublicSlug(base);
  if (!slug) slug = crypto.randomUUID().slice(0, 10);
  let finalSlug = slug;
  let counter = 2;
  while (await db.prepare(`SELECT id FROM event_questions WHERE ${column} = ?`).bind(finalSlug).first()) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }
  return finalSlug;
}

async function uniqueBoardSlug(db: D1Database, base: string, column: "participant_slug" | "presenter_slug", currentId?: string) {
  let slug = normalizePublicSlug(base);
  if (!slug) slug = crypto.randomUUID().slice(0, 10);
  let finalSlug = slug;
  let counter = 2;
  while (
    await db
      .prepare(`SELECT id FROM event_boards WHERE ${column} = ?${currentId ? " AND id <> ?" : ""}`)
      .bind(...(currentId ? [finalSlug, currentId] : [finalSlug]))
      .first()
  ) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }
  return finalSlug;
}

async function uniqueDashboardSlug(db: D1Database, base: string, currentId?: string) {
  let slug = normalizePublicSlug(base);
  if (!slug) slug = crypto.randomUUID().slice(0, 10);
  let finalSlug = slug;
  let counter = 2;
  while (
    await db
      .prepare(`SELECT id FROM event_dashboards WHERE short_link_slug = ?${currentId ? " AND id <> ?" : ""}`)
      .bind(...(currentId ? [finalSlug, currentId] : [finalSlug]))
      .first()
  ) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }
  return finalSlug;
}

function textFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeRichHtml(value: string) {
  const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "span"]);
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sstyle='[^']*'/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tagName, attrs) => {
      const tag = String(tagName).toLowerCase();
      if (!allowedTags.has(tag)) return "";
      if (tag === "a" && !match.startsWith("</")) {
        const href = String(attrs).match(/\shref=["']([^"']+)["']/i)?.[1] ?? "";
        if (/^https?:\/\//i.test(href)) return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`;
        return "<a>";
      }
      return match.startsWith("</") ? `</${tag}>` : `<${tag}>`;
    })
    .trim();
}

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

export async function getActiveFormBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT id, event_id, name, status, short_link_slug, welcome_title_template
       FROM forms
       WHERE short_link_slug = ? AND status = 'active'
       LIMIT 1`
    )
    .bind(slug)
    .first<{ id: string; event_id: string; name: string; status: string; short_link_slug: string; welcome_title_template: string }>();
}

export async function getPublicFormContextBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT
        f.id AS form_id,
        f.event_id,
        f.name AS form_name,
        f.status AS form_status,
        f.short_link_slug AS form_short_link_slug,
        f.form_template_id,
        f.welcome_title_template,
        e.id AS event_id,
        e.title AS event_title,
        e.source_title,
        e.start_date,
        e.end_date,
        e.start_time,
        e.end_time,
        e.status AS event_status,
        e.short_link_slug AS event_short_link_slug
       FROM forms f
       INNER JOIN events e ON e.id = f.event_id
       WHERE f.short_link_slug = ? AND f.status = 'active'
       LIMIT 1`
    )
    .bind(slug)
    .first<{
      form_id: string;
      event_id: string;
      form_name: string;
      form_status: string;
      form_short_link_slug: string;
      form_template_id: string | null;
      welcome_title_template: string;
      event_title: string;
      source_title: string | null;
      start_date: string | null;
      end_date: string | null;
      start_time: string | null;
      end_time: string | null;
      event_status: string;
      event_short_link_slug: string | null;
    }>();
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
  const sessions = await db
    .prepare(
      `SELECT
        s.id,
        s.module_id,
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
  const dashboard = await getEventDashboard(db, eventId);
  const sessionItems = dashboard?.sessionItems ?? [];
  return {
    ...sessions,
    results: sessions.results.map((session: any) => ({
      ...session,
      dashboard_items: sessionItems.filter((item) => item.session_id === session.id)
    }))
  };
}

export async function listAdminEvents(db: D1Database, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "" : "WHERE e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      e.id,
      e.title,
      e.source_title,
      e.theme,
      e.start_date,
      e.end_date,
      e.start_time,
      e.end_time,
      e.status,
      e.short_link_slug,
      COUNT(DISTINCT m.id) AS module_count,
      COUNT(DISTINCT s.id) AS session_count,
      COUNT(DISTINCT CASE WHEN s.attendance_status = 'open' THEN s.id END) AS open_session_count,
      af.id AS associated_form_id,
      af.name AS associated_form_name,
      ft.id AS associated_template_id,
      ft.name AS associated_template_name
     FROM events e
     LEFT JOIN event_modules m ON m.event_id = e.id
     LEFT JOIN event_sessions s ON s.event_id = e.id
     LEFT JOIN forms af ON af.event_id = e.id AND af.short_link_slug = e.short_link_slug AND af.status = 'active'
     LEFT JOIN form_templates ft ON ft.id = af.form_template_id
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

export async function listEventQuestions(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT
        q.*,
        COUNT(r.id) AS response_count,
        COUNT(DISTINCT r.participant_id) AS unique_participant_count
       FROM event_questions q
       LEFT JOIN event_question_responses r ON r.question_id = q.id AND r.status = 'active'
       WHERE q.event_id = ?
       GROUP BY q.id
       ORDER BY q.created_at DESC`
    )
    .bind(eventId)
    .all<EventQuestion>();
}

export async function createEventQuestion(db: D1Database, eventId: string, user: SessionUser, input: {
  questionText: string;
  browserTitle?: string;
  description?: string;
  sessionId?: string | null;
  allowMultipleResponses?: boolean;
  maxResponsesPerParticipant?: number | null;
  maxAnswerLength?: number;
  maxSelectableConcepts?: number;
  participantSlug?: string;
}) {
  const questionText = input.questionText.trim();
  if (!questionText) return { ok: false, message: "Ingrese la pregunta." };
  const browserTitle = input.browserTitle?.trim() || questionText;

  const event = await db
    .prepare("SELECT id, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; short_link_slug: string }>();
  if (!event) return { ok: false, message: "Evento no encontrado." };

  if (input.sessionId) {
    const session = await db
      .prepare("SELECT id FROM event_sessions WHERE id = ? AND event_id = ?")
      .bind(input.sessionId, eventId)
      .first<{ id: string }>();
    if (!session) return { ok: false, message: "Seleccione una sesion valida." };
  }

  const questionId = `question_${crypto.randomUUID().slice(0, 12)}`;
  const baseSlug = input.participantSlug || `${event.short_link_slug}-pregunta-${crypto.randomUUID().slice(0, 6)}`;
  const participantSlug = await uniqueQuestionSlug(db, baseSlug, "participant_slug");
  const presenterSlug = await uniqueQuestionSlug(db, `${participantSlug}-presentador-${crypto.randomUUID().slice(0, 8)}`, "presenter_slug");
  const maxAnswerLength = Math.min(Math.max(input.maxAnswerLength || 80, 10), 500);
  const maxSelectableConcepts = Math.max(Math.floor(input.maxSelectableConcepts || 5), 1);

  await db
    .prepare(
      `INSERT INTO event_questions (
        id, event_id, session_id, question_text, browser_title, description, interaction_type, status,
        allow_multiple_responses, allow_response_update, max_responses_per_participant,
        max_answer_length, max_selectable_concepts, participant_slug, presenter_slug, created_by_user_id
       )
       VALUES (?, ?, ?, ?, ?, ?, 'word_cloud', 'draft', ?, 0, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      questionId,
      eventId,
      input.sessionId || null,
      questionText,
      browserTitle,
      input.description?.trim() || null,
      input.allowMultipleResponses ? 1 : 0,
      input.maxResponsesPerParticipant ?? null,
      maxAnswerLength,
      maxSelectableConcepts,
      participantSlug,
      presenterSlug,
      user.id
    )
    .run();

  return { ok: true, question: await getEventQuestionById(db, questionId) };
}

export async function getEventQuestionById(db: D1Database, questionId: string) {
  return db
    .prepare(
      `SELECT
        q.*,
        COUNT(r.id) AS response_count,
        COUNT(DISTINCT r.participant_id) AS unique_participant_count
       FROM event_questions q
       LEFT JOIN event_question_responses r ON r.question_id = q.id AND r.status = 'active'
       WHERE q.id = ?
       GROUP BY q.id`
    )
    .bind(questionId)
    .first<EventQuestion>();
}

export async function updateEventQuestion(db: D1Database, eventId: string, questionId: string, input: {
  questionText: string;
  browserTitle?: string;
  description?: string;
  sessionId?: string | null;
  status?: string;
  allowMultipleResponses?: boolean;
  maxResponsesPerParticipant?: number | null;
  maxAnswerLength?: number;
  maxSelectableConcepts?: number;
  participantSlug?: string;
}) {
  const current = await db
    .prepare(
      `SELECT q.id, q.event_id, q.status, q.question_text, q.participant_slug, COUNT(r.id) AS response_count
       FROM event_questions q
       LEFT JOIN event_question_responses r ON r.question_id = q.id AND r.status = 'active'
       WHERE q.id = ? AND q.event_id = ?
       GROUP BY q.id`
    )
    .bind(questionId, eventId)
    .first<{ id: string; event_id: string; status: string; question_text: string; participant_slug: string; response_count: number }>();
  if (!current) return { ok: false, message: "Pregunta no encontrada." };

  const questionText = input.questionText.trim();
  if (!questionText) return { ok: false, message: "Ingrese la pregunta." };
  const browserTitle = input.browserTitle?.trim() || questionText;
  const responseCount = Number(current.response_count || 0);
  const participantSlug = normalizePublicSlug(input.participantSlug || current.participant_slug);
  if (!participantSlug) return { ok: false, message: "Ingrese un enlace corto valido." };

  if (responseCount > 0 && (questionText !== current.question_text || participantSlug !== current.participant_slug)) {
    return {
      ok: false,
      message: "No se puede modificar la pregunta ni el enlace corto porque ya existen respuestas registradas."
    };
  }

  if (participantSlug !== current.participant_slug) {
    const duplicated = await db
      .prepare("SELECT id FROM event_questions WHERE participant_slug = ? AND id <> ?")
      .bind(participantSlug, questionId)
      .first<{ id: string }>();
    if (duplicated) return { ok: false, message: "El enlace corto de pregunta ya existe." };
  }

  if (input.sessionId) {
    const session = await db
      .prepare("SELECT id FROM event_sessions WHERE id = ? AND event_id = ?")
      .bind(input.sessionId, current.event_id)
      .first<{ id: string }>();
    if (!session) return { ok: false, message: "Seleccione una sesion valida." };
  }

  const status = input.status && ["draft", "open", "closed", "archived"].includes(input.status) ? input.status : current.status;
  const maxAnswerLength = Math.min(Math.max(input.maxAnswerLength || 80, 10), 500);
  const maxSelectableConcepts = Math.max(Math.floor(input.maxSelectableConcepts || 5), 1);

  await db
    .prepare(
      `UPDATE event_questions
       SET session_id = ?, question_text = ?, description = ?, status = ?, allow_multiple_responses = ?,
           max_responses_per_participant = ?, max_answer_length = ?, max_selectable_concepts = ?,
           participant_slug = ?, browser_title = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.sessionId || null,
      questionText,
      input.description?.trim() || null,
      status,
      input.allowMultipleResponses ? 1 : 0,
      input.maxResponsesPerParticipant ?? null,
      maxAnswerLength,
      maxSelectableConcepts,
      participantSlug,
      browserTitle,
      questionId
    )
    .run();

  return { ok: true, question: await getEventQuestionById(db, questionId) };
}

export async function updateEventQuestionStatus(db: D1Database, eventId: string, questionId: string, status: string) {
  const nextStatus = ["draft", "open", "closed", "archived"].includes(status) ? status : "draft";
  const result = await db
    .prepare("UPDATE event_questions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND event_id = ?")
    .bind(nextStatus, questionId, eventId)
    .run();
  return result.meta.changes > 0;
}

export async function updateEventQuestionParticipantCloud(db: D1Database, eventId: string, questionId: string, show: boolean) {
  const result = await db
    .prepare("UPDATE event_questions SET show_participant_cloud = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND event_id = ?")
    .bind(show ? 1 : 0, questionId, eventId)
    .run();
  return result.meta.changes > 0;
}

export async function listEventBoards(db: D1Database, eventId: string) {
  const boards = await db
    .prepare(
      `SELECT b.*, COUNT(n.id) AS note_count
       FROM event_boards b
       LEFT JOIN event_board_notes n ON n.board_id = b.id AND n.status = 'active'
       WHERE b.event_id = ?
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    )
    .bind(eventId)
    .all<EventBoard>();
  const enrichedBoards = await Promise.all(
    boards.results.map(async (board) => {
      const instructions = await listBoardInstructions(db, board.id);
      return { ...board, instructions: instructions.results };
    })
  );
  return { ...boards, results: enrichedBoards };
}

export async function listBoardInstructions(db: D1Database, boardId: string) {
  return db
    .prepare(
      `SELECT id, board_id, language_label, content_html, content_text, sort_order, status
       FROM event_board_instructions
       WHERE board_id = ? AND status = 'active'
       ORDER BY sort_order ASC`
    )
    .bind(boardId)
    .all<EventBoardInstruction>();
}

export async function getEventBoardById(db: D1Database, boardId: string) {
  const board = await db
    .prepare(
      `SELECT b.*, COUNT(n.id) AS note_count
       FROM event_boards b
       LEFT JOIN event_board_notes n ON n.board_id = b.id AND n.status = 'active'
       WHERE b.id = ?
       GROUP BY b.id`
    )
    .bind(boardId)
    .first<EventBoard>();
  if (!board) return null;
  const instructions = await listBoardInstructions(db, board.id);
  return { ...board, instructions: instructions.results };
}

type BoardInstructionInput = {
  languageLabel?: string | null;
  contentHtml?: string;
  sortOrder?: number;
};

function normalizeBoardInstructions(instructions: BoardInstructionInput[] | undefined) {
  return (instructions ?? [])
    .map((instruction, index) => {
      const contentHtml = sanitizeRichHtml(instruction.contentHtml ?? "");
      const contentText = textFromHtml(contentHtml);
      return {
        languageLabel: instruction.languageLabel?.trim() || null,
        contentHtml,
        contentText,
        sortOrder: Math.max(Math.floor(instruction.sortOrder || index + 1), 1)
      };
    })
    .filter((instruction) => instruction.contentText);
}

export async function createEventBoard(db: D1Database, eventId: string, user: SessionUser, input: {
  title: string;
  browserTitle?: string;
  sessionId?: string | null;
  participantSlug?: string;
  maxNoteLength?: number;
  allowMultipleNotes?: boolean;
  maxNotesPerParticipant?: number | null;
  instructions?: BoardInstructionInput[];
}) {
  const title = input.title.trim();
  if (!title) return { ok: false, message: "Ingrese el titulo de la pizarra." };
  const browserTitle = input.browserTitle?.trim() || title;

  const event = await db.prepare("SELECT id, short_link_slug FROM events WHERE id = ?").bind(eventId).first<{ id: string; short_link_slug: string }>();
  if (!event) return { ok: false, message: "Evento no encontrado." };

  if (input.sessionId) {
    const session = await db.prepare("SELECT id FROM event_sessions WHERE id = ? AND event_id = ?").bind(input.sessionId, eventId).first<{ id: string }>();
    if (!session) return { ok: false, message: "Seleccione una sesion valida." };
  }

  const instructions = normalizeBoardInstructions(input.instructions);
  if (instructions.length === 0) return { ok: false, message: "Ingrese al menos una instruccion." };

  const boardId = `board_${crypto.randomUUID().slice(0, 12)}`;
  const baseSlug = input.participantSlug || `${event.short_link_slug}-pizarra-${crypto.randomUUID().slice(0, 6)}`;
  const participantSlug = await uniqueBoardSlug(db, baseSlug, "participant_slug");
  const presenterSlug = await uniqueBoardSlug(db, `${participantSlug}-presentador-${crypto.randomUUID().slice(0, 8)}`, "presenter_slug");
  const maxNoteLength = Math.min(Math.max(input.maxNoteLength || 800, 20), 5000);
  const maxNotesPerParticipant = input.allowMultipleNotes ? Math.max(Math.floor(input.maxNotesPerParticipant || 1), 1) : 1;

  await db
    .prepare(
      `INSERT INTO event_boards (
        id, event_id, session_id, title, browser_title, status, participant_slug, presenter_slug, max_note_length,
        allow_multiple_notes, max_notes_per_participant, created_by_user_id
       )
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      boardId,
      eventId,
      input.sessionId || null,
      title,
      browserTitle,
      participantSlug,
      presenterSlug,
      maxNoteLength,
      input.allowMultipleNotes ? 1 : 0,
      maxNotesPerParticipant,
      user.id
    )
    .run();

  for (const instruction of instructions) {
    await db
      .prepare(
        `INSERT INTO event_board_instructions (id, board_id, language_label, content_html, content_text, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(`board_instruction_${crypto.randomUUID().slice(0, 12)}`, boardId, instruction.languageLabel, instruction.contentHtml, instruction.contentText, instruction.sortOrder)
      .run();
  }

  return { ok: true, board: await getEventBoardById(db, boardId) };
}

export async function updateEventBoard(db: D1Database, eventId: string, boardId: string, input: {
  title: string;
  browserTitle?: string;
  sessionId?: string | null;
  participantSlug?: string;
  maxNoteLength?: number;
  allowMultipleNotes?: boolean;
  maxNotesPerParticipant?: number | null;
  instructions?: BoardInstructionInput[];
}) {
  const current = await db
    .prepare(
      `SELECT b.*, COUNT(n.id) AS note_count
       FROM event_boards b
       LEFT JOIN event_board_notes n ON n.board_id = b.id AND n.status = 'active'
       WHERE b.id = ? AND b.event_id = ?
       GROUP BY b.id`
    )
    .bind(boardId, eventId)
    .first<EventBoard>();
  if (!current) return { ok: false, message: "Pizarra no encontrada." };

  const title = input.title.trim();
  if (!title) return { ok: false, message: "Ingrese el titulo de la pizarra." };
  const browserTitle = input.browserTitle?.trim() || title;
  if (input.sessionId) {
    const session = await db.prepare("SELECT id FROM event_sessions WHERE id = ? AND event_id = ?").bind(input.sessionId, eventId).first<{ id: string }>();
    if (!session) return { ok: false, message: "Seleccione una sesion valida." };
  }

  const noteCount = Number(current.note_count || 0);
  const participantSlug = normalizePublicSlug(input.participantSlug || current.participant_slug);
  if (!participantSlug) return { ok: false, message: "Ingrese un enlace corto valido." };
  if (noteCount > 0 && participantSlug !== current.participant_slug) {
    return { ok: false, message: "No se puede modificar el enlace corto porque ya existen notas registradas." };
  }
  if (participantSlug !== current.participant_slug) {
    const duplicated = await db.prepare("SELECT id FROM event_boards WHERE participant_slug = ? AND id <> ?").bind(participantSlug, boardId).first<{ id: string }>();
    if (duplicated) return { ok: false, message: "El enlace corto de pizarra ya existe." };
  }

  const instructions = normalizeBoardInstructions(input.instructions);
  if (instructions.length === 0) return { ok: false, message: "Ingrese al menos una instruccion." };
  const maxNoteLength = Math.min(Math.max(input.maxNoteLength || 800, 20), 5000);
  const maxNotesPerParticipant = input.allowMultipleNotes ? Math.max(Math.floor(input.maxNotesPerParticipant || 1), 1) : 1;

  await db
    .prepare(
      `UPDATE event_boards
       SET session_id = ?, title = ?, browser_title = ?, participant_slug = ?, max_note_length = ?,
           allow_multiple_notes = ?, max_notes_per_participant = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND event_id = ?`
    )
    .bind(input.sessionId || null, title, browserTitle, participantSlug, maxNoteLength, input.allowMultipleNotes ? 1 : 0, maxNotesPerParticipant, boardId, eventId)
    .run();

  await db.prepare("UPDATE event_board_instructions SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE board_id = ?").bind(boardId).run();
  for (const instruction of instructions) {
    await db
      .prepare(
        `INSERT INTO event_board_instructions (id, board_id, language_label, content_html, content_text, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(`board_instruction_${crypto.randomUUID().slice(0, 12)}`, boardId, instruction.languageLabel, instruction.contentHtml, instruction.contentText, instruction.sortOrder)
      .run();
  }

  return { ok: true, board: await getEventBoardById(db, boardId) };
}

export async function updateEventBoardStatus(db: D1Database, eventId: string, boardId: string, status: string) {
  const nextStatus = ["draft", "open", "closed", "archived"].includes(status) ? status : "draft";
  const result = await db
    .prepare("UPDATE event_boards SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND event_id = ?")
    .bind(nextStatus, boardId, eventId)
    .run();
  return result.meta.changes > 0;
}

type DashboardInstructionInput = {
  languageLabel?: string | null;
  contentHtml?: string;
  sortOrder?: number;
  status?: string;
};

type DashboardItemInput = {
  id?: string;
  sessionId?: string | null;
  scope?: "event" | "session";
  name?: string;
  valueType?: "text" | "link";
  value?: string;
  sortOrder?: number;
  status?: string;
};

function normalizeDashboardInstructions(instructions: DashboardInstructionInput[] | undefined) {
  return (instructions ?? [])
    .map((instruction, index) => {
      const contentHtml = sanitizeRichHtml(instruction.contentHtml ?? "");
      const contentText = textFromHtml(contentHtml);
      return {
        languageLabel: instruction.languageLabel?.trim() || null,
        contentHtml,
        contentText,
        sortOrder: Math.max(Math.floor(instruction.sortOrder || index + 1), 1),
        status: instruction.status === "inactive" ? "inactive" : "active"
      };
    })
    .filter((instruction) => instruction.contentText);
}

function normalizeDashboardItems(items: DashboardItemInput[] | undefined, scope: "event" | "session") {
  return (items ?? [])
    .map((item, index) => ({
      sessionId: scope === "session" ? item.sessionId || null : null,
      scope,
      name: (item.name ?? "").trim(),
      valueType: item.valueType === "link" ? "link" : "text",
      value: (item.value ?? "").trim(),
      sortOrder: Math.max(Math.floor(item.sortOrder || index + 1), 1),
      status: item.status === "inactive" ? "inactive" : "active"
    }))
    .filter((item) => item.name && item.value);
}

async function listDashboardInstructions(db: D1Database, dashboardId: string, activeOnly = false) {
  return db
    .prepare(
      `SELECT id, dashboard_id, language_label, content_html, content_text, sort_order, status
       FROM event_dashboard_instructions
       WHERE dashboard_id = ?${activeOnly ? " AND status = 'active'" : ""}
       ORDER BY sort_order ASC, created_at ASC`
    )
    .bind(dashboardId)
    .all<EventDashboardInstruction>();
}

async function listDashboardItems(db: D1Database, dashboardId: string, activeOnly = false) {
  return db
    .prepare(
      `SELECT id, dashboard_id, event_id, session_id, scope, name, value_type, value, sort_order, status
       FROM event_dashboard_items
       WHERE dashboard_id = ?${activeOnly ? " AND status = 'active'" : ""}
       ORDER BY scope ASC, COALESCE(session_id, ''), sort_order ASC, created_at ASC`
    )
    .bind(dashboardId)
    .all<EventDashboardItem>();
}

export async function getEventDashboard(db: D1Database, eventId: string) {
  const dashboard = await db
    .prepare(
      `SELECT d.*, e.title AS event_title
       FROM event_dashboards d
       INNER JOIN events e ON e.id = d.event_id
       WHERE d.event_id = ?`
    )
    .bind(eventId)
    .first<EventDashboard>();
  if (!dashboard) return null;

  const [instructions, items] = await Promise.all([
    listDashboardInstructions(db, dashboard.id),
    listDashboardItems(db, dashboard.id)
  ]);

  return {
    ...dashboard,
    instructions: instructions.results,
    eventItems: items.results.filter((item) => item.scope === "event"),
    sessionItems: items.results.filter((item) => item.scope === "session")
  };
}

export async function upsertEventDashboard(db: D1Database, eventId: string, user: SessionUser, input: {
  title?: string;
  browserTitle?: string;
  shortLinkSlug?: string;
  status?: string;
  instructions?: DashboardInstructionInput[];
  eventItems?: DashboardItemInput[];
  sessionItems?: DashboardItemInput[];
}) {
  const event = await db.prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?").bind(eventId).first<{ id: string; title: string; short_link_slug: string }>();
  if (!event) return { ok: false, message: "Evento no encontrado." };

  const title = (input.title ?? "").trim();
  if (!title) return { ok: false, message: "Ingrese el titulo del tablero." };
  const browserTitle = input.browserTitle?.trim() || title;
  const nextStatus = ["draft", "active", "inactive", "archived"].includes(input.status ?? "") ? input.status! : "draft";
  const current = await db.prepare("SELECT * FROM event_dashboards WHERE event_id = ?").bind(eventId).first<EventDashboard>();
  const requestedSlug = input.shortLinkSlug?.trim() || current?.short_link_slug || `${event.short_link_slug}-tablero`;
  const shortLinkSlug = await uniqueDashboardSlug(db, requestedSlug, current?.id);

  const instructions = normalizeDashboardInstructions(input.instructions);
  const eventItems = normalizeDashboardItems(input.eventItems, "event");
  const sessionItems = normalizeDashboardItems(input.sessionItems, "session");

  const sessionIds = Array.from(new Set(sessionItems.map((item) => item.sessionId).filter(Boolean))) as string[];
  for (const sessionId of sessionIds) {
    const session = await db.prepare("SELECT id FROM event_sessions WHERE id = ? AND event_id = ?").bind(sessionId, eventId).first<{ id: string }>();
    if (!session) return { ok: false, message: "Una informacion de sesion tiene una sesion invalida." };
  }

  const dashboardId = current?.id ?? `dash_${crypto.randomUUID().slice(0, 12)}`;
  if (current) {
    await db
      .prepare(
        `UPDATE event_dashboards
         SET title = ?, browser_title = ?, short_link_slug = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND event_id = ?`
      )
      .bind(title, browserTitle, shortLinkSlug, nextStatus, dashboardId, eventId)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO event_dashboards (id, event_id, title, browser_title, short_link_slug, status, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(dashboardId, eventId, title, browserTitle, shortLinkSlug, nextStatus, user.id)
      .run();
  }

  if (input.instructions) {
    await db.prepare("DELETE FROM event_dashboard_instructions WHERE dashboard_id = ?").bind(dashboardId).run();
    for (const instruction of instructions) {
      await db
        .prepare(
          `INSERT INTO event_dashboard_instructions (id, dashboard_id, language_label, content_html, content_text, sort_order, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(`dash_instruction_${crypto.randomUUID().slice(0, 12)}`, dashboardId, instruction.languageLabel, instruction.contentHtml, instruction.contentText, instruction.sortOrder, instruction.status)
        .run();
    }
  }

  if (input.eventItems) {
    await db.prepare("DELETE FROM event_dashboard_items WHERE dashboard_id = ? AND scope = 'event'").bind(dashboardId).run();
    for (const item of eventItems) {
      await db
        .prepare(
          `INSERT INTO event_dashboard_items (id, dashboard_id, event_id, session_id, scope, name, value_type, value, sort_order, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(`dash_item_${crypto.randomUUID().slice(0, 12)}`, dashboardId, eventId, item.sessionId, item.scope, item.name, item.valueType, item.value, item.sortOrder, item.status)
        .run();
    }
  }

  if (input.sessionItems) {
    await db.prepare("DELETE FROM event_dashboard_items WHERE dashboard_id = ? AND scope = 'session'").bind(dashboardId).run();
    for (const item of sessionItems) {
      await db
        .prepare(
          `INSERT INTO event_dashboard_items (id, dashboard_id, event_id, session_id, scope, name, value_type, value, sort_order, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(`dash_item_${crypto.randomUUID().slice(0, 12)}`, dashboardId, eventId, item.sessionId, item.scope, item.name, item.valueType, item.value, item.sortOrder, item.status)
        .run();
    }
  }

  return { ok: true, dashboard: await getEventDashboard(db, eventId) };
}

export async function updateSessionDashboardItems(db: D1Database, eventId: string, sessionId: string, user: SessionUser, input: {
  items?: DashboardItemInput[];
}) {
  const event = await db.prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?").bind(eventId).first<{ id: string; title: string; short_link_slug: string }>();
  if (!event) return { ok: false, message: "Evento no encontrado." };

  const session = await db.prepare("SELECT id FROM event_sessions WHERE id = ? AND event_id = ?").bind(sessionId, eventId).first<{ id: string }>();
  if (!session) return { ok: false, message: "Sesion no encontrada." };

  let dashboard = await db.prepare("SELECT * FROM event_dashboards WHERE event_id = ?").bind(eventId).first<EventDashboard>();
  if (!dashboard) {
    const dashboardId = `dash_${crypto.randomUUID().slice(0, 12)}`;
    const shortLinkSlug = await uniqueDashboardSlug(db, `${event.short_link_slug}-tablero`);
    await db
      .prepare(
        `INSERT INTO event_dashboards (id, event_id, title, browser_title, short_link_slug, status, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, 'draft', ?)`
      )
      .bind(dashboardId, eventId, `Tablero - ${event.title}`, `Tablero - ${event.title}`, shortLinkSlug, user.id)
      .run();
    dashboard = await db.prepare("SELECT * FROM event_dashboards WHERE id = ?").bind(dashboardId).first<EventDashboard>();
  }

  if (!dashboard) return { ok: false, message: "No se pudo preparar el tablero del evento." };

  const items = normalizeDashboardItems(input.items, "session").map((item) => ({ ...item, sessionId }));
  await db.prepare("DELETE FROM event_dashboard_items WHERE dashboard_id = ? AND scope = 'session' AND session_id = ?").bind(dashboard.id, sessionId).run();
  for (const item of items) {
    await db
      .prepare(
        `INSERT INTO event_dashboard_items (id, dashboard_id, event_id, session_id, scope, name, value_type, value, sort_order, status)
         VALUES (?, ?, ?, ?, 'session', ?, ?, ?, ?, ?)`
      )
      .bind(`dash_item_${crypto.randomUUID().slice(0, 12)}`, dashboard.id, eventId, sessionId, item.name, item.valueType, item.value, item.sortOrder, item.status)
      .run();
  }

  const current = await getEventDashboard(db, eventId);
  return {
    ok: true,
    items: current?.sessionItems?.filter((item) => item.session_id === sessionId) ?? [],
    dashboard: current
  };
}

export async function getPublicDashboardBySlug(db: D1Database, slug: string) {
  const dashboard = await db
    .prepare(
      `SELECT d.*, e.title AS event_title
       FROM event_dashboards d
       INNER JOIN events e ON e.id = d.event_id
       WHERE d.short_link_slug = ?`
    )
    .bind(normalizePublicSlug(slug))
    .first<EventDashboard>();
  if (!dashboard) return null;

  const [instructions, items, sessions] = await Promise.all([
    listDashboardInstructions(db, dashboard.id, true),
    listDashboardItems(db, dashboard.id, true),
    db
      .prepare(
        `SELECT s.id, s.module_id, m.title AS module_title, m.order_index AS module_order,
                s.sequence, s.title, s.theme, s.session_date, s.start_time, s.end_time,
                s.status, s.attendance_status
         FROM event_sessions s
         INNER JOIN event_modules m ON m.id = s.module_id
         WHERE s.event_id = ? AND s.status <> 'archived'
         ORDER BY m.order_index ASC, s.sequence ASC, s.session_date ASC, s.start_time ASC`
      )
      .bind(dashboard.event_id)
      .all<EventDashboardSession>()
  ]);

  const sessionItems = items.results.filter((item) => item.scope === "session");
  const enrichedSessions = sessions.results.map((session) => ({
    ...session,
    items: sessionItems.filter((item) => item.session_id === session.id)
  }));

  return {
    ...dashboard,
    instructions: instructions.results,
    eventItems: items.results.filter((item) => item.scope === "event"),
    sessions: enrichedSessions
  };
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

export async function updateEventSessionDetails(db: D1Database, eventId: string, sessionId: string, input: {
  moduleTitle: string;
  title: string;
  theme: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
}) {
  const existing = await getSessionById(db, sessionId);

  if (!existing || existing.event_id !== eventId) {
    return { ok: false, message: "Sesion no encontrada." };
  }

  const moduleTitle = input.moduleTitle.trim() || "Modulo general";
  let module = await db
    .prepare("SELECT id FROM event_modules WHERE event_id = ? AND lower(title) = lower(?) LIMIT 1")
    .bind(eventId, moduleTitle)
    .first<{ id: string }>();

  if (!module) {
    const moduleId = `mod_${crypto.randomUUID().slice(0, 8)}`;
    const order = await db
      .prepare("SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order FROM event_modules WHERE event_id = ?")
      .bind(eventId)
      .first<{ next_order: number }>();

    await db
      .prepare("INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES (?, ?, ?, ?, 'active')")
      .bind(moduleId, eventId, moduleTitle, order?.next_order ?? 1)
      .run();
    module = { id: moduleId };
  }

  const attendanceStatus = input.status === "open" ? "open" : "closed";
  const statements: D1PreparedStatement[] = [];

  if (attendanceStatus === "open") {
    statements.push(
      db
        .prepare(
          `UPDATE event_sessions
           SET attendance_status = 'closed', status = 'closed', updated_at = CURRENT_TIMESTAMP
           WHERE event_id = ? AND id <> ? AND attendance_status = 'open'`
        )
        .bind(eventId, sessionId)
    );
  }

  statements.push(
    db
      .prepare(
        `UPDATE event_sessions
         SET module_id = ?, title = ?, theme = ?, session_date = ?, start_time = ?, end_time = ?, status = ?, attendance_status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND event_id = ?`
      )
      .bind(
        module.id,
        input.title,
        input.theme,
        input.sessionDate,
        input.startTime,
        input.endTime,
        attendanceStatus,
        attendanceStatus,
        sessionId,
        eventId
      )
  );

  await db.batch(statements);
  return { ok: true };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function normalizePublicSlug(value: string) {
  return slugify(value).slice(0, 48);
}

export async function isShortLinkAvailable(db: D1Database, slug: string, eventId?: string) {
  const event = await db
    .prepare("SELECT id FROM events WHERE short_link_slug = ? AND (? IS NULL OR id <> ?) LIMIT 1")
    .bind(slug, eventId ?? null, eventId ?? null)
    .first<{ id: string }>();

  if (event) return false;

  const form = await db
    .prepare(
      `SELECT f.id
       FROM forms f
       WHERE f.short_link_slug = ?
         AND (? IS NULL OR f.event_id <> ?)
       LIMIT 1`
    )
    .bind(slug, eventId ?? null, eventId ?? null)
    .first<{ id: string }>();

  return !form;
}

export async function createEventWithSchedule(db: D1Database, user: SessionUser, input: {
  title: string;
  shortLinkSlug: string;
  theme?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  sessions: Array<{
    moduleTitle: string;
    title: string;
    theme: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    dashboardItems?: DashboardItemInput[];
  }>;
}) {
  const suffix = crypto.randomUUID().slice(0, 8);
  const eventId = `evt_${suffix}`;
  const slug = normalizePublicSlug(input.shortLinkSlug);
  const formId = `form_${suffix}`;
  const dashboardId = `dash_${suffix}`;
  const moduleIds = new Map<string, string>();
  const hasSessionDashboardItems = input.sessions.some((session) => normalizeDashboardItems(session.dashboardItems, "session").length > 0);
  const dashboardSlug = hasSessionDashboardItems ? await uniqueDashboardSlug(db, `${slug}-tablero`) : "";
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `INSERT INTO events (id, title, source_title, theme, start_date, end_date, start_time, end_time, status, short_link_slug, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
      )
      .bind(
        eventId,
        input.title,
        input.title,
        input.theme ?? input.title,
        input.startDate,
        input.endDate,
        input.startTime,
        input.endTime,
        slug,
        user.id
      )
  ];

  if (hasSessionDashboardItems) {
    statements.push(
      db
        .prepare(
          `INSERT INTO event_dashboards (id, event_id, title, browser_title, short_link_slug, status, created_by_user_id)
           VALUES (?, ?, ?, ?, ?, 'draft', ?)`
        )
        .bind(dashboardId, eventId, `Tablero - ${input.title}`, `Tablero - ${input.title}`, dashboardSlug, user.id)
    );
  }

  input.sessions.forEach((session, index) => {
    const moduleKey = session.moduleTitle.trim() || "Modulo general";
    if (!moduleIds.has(moduleKey)) {
      const moduleId = `mod_${suffix}_${moduleIds.size + 1}`;
      moduleIds.set(moduleKey, moduleId);
      statements.push(
        db
          .prepare(
            `INSERT INTO event_modules (id, event_id, title, order_index, status)
             VALUES (?, ?, ?, ?, 'active')`
          )
          .bind(moduleId, eventId, moduleKey, moduleIds.size)
      );
    }

    const sessionId = `ses_${suffix}_${index + 1}`;
    statements.push(
      db
        .prepare(
          `INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'closed', 'closed')`
        )
        .bind(
          sessionId,
          eventId,
          moduleIds.get(moduleKey),
          index + 1,
          session.title || `Sesión ${index + 1}`,
          session.theme || session.title || `Sesión ${index + 1}`,
          session.sessionDate,
          session.startTime,
          session.endTime
        )
    );

    if (hasSessionDashboardItems) {
      for (const item of normalizeDashboardItems(session.dashboardItems, "session")) {
        statements.push(
          db
            .prepare(
              `INSERT INTO event_dashboard_items (id, dashboard_id, event_id, session_id, scope, name, value_type, value, sort_order, status)
               VALUES (?, ?, ?, ?, 'session', ?, ?, ?, ?, ?)`
            )
            .bind(`dash_item_${suffix}_${index + 1}_${crypto.randomUUID().slice(0, 6)}`, dashboardId, eventId, sessionId, item.name, item.valueType, item.value, item.sortOrder, item.status)
        );
      }
    }
  });

  const templateSections = await db
    .prepare("SELECT id, section_key, title, order_index FROM form_sections WHERE form_id = 'form_inauguracion_otca' ORDER BY order_index")
    .all<FormSection>();
  const templateFields = await db
    .prepare(
      "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_fields WHERE form_id = 'form_inauguracion_otca' ORDER BY order_index"
    )
    .all<FormField>();

  statements.push(
    db
      .prepare(
        `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id)
         VALUES (?, ?, ?, 'active', ?, ?, 'form_inauguracion_otca')`
      )
      .bind(
        formId,
        eventId,
        `Formulario de asistencia - ${input.title}`,
        slug,
        "Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}"
      )
  );

  for (const section of templateSections.results) {
    const sectionId = `${section.id}_${suffix}`;
    statements.push(
      db
        .prepare("INSERT INTO form_sections (id, form_id, section_key, title, order_index) VALUES (?, ?, ?, ?, ?)")
        .bind(sectionId, formId, section.section_key, section.title, section.order_index)
    );

    for (const field of templateFields.results.filter((item) => item.section_id === section.id)) {
      statements.push(
        db
          .prepare(
            `INSERT INTO form_fields (id, form_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            `${field.id}_${suffix}`,
            formId,
            sectionId,
            field.field_key,
            field.label,
            field.field_type,
            field.catalog_key,
            field.is_required,
            field.order_index,
            field.config
          )
      );
    }
  }

  await db.batch(statements);
  return { eventId, formId, slug };
}

export async function updateEventDetails(db: D1Database, eventId: string, input: {
  title: string;
  shortLinkSlug: string;
  theme?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
}) {
  const currentEvent = await db
    .prepare("SELECT short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ short_link_slug: string }>();
  const nextSlug = normalizePublicSlug(input.shortLinkSlug);
  const result = await db
    .prepare(
      `UPDATE events
       SET title = ?, source_title = ?, theme = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?, status = ?, short_link_slug = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.title,
      input.title,
      input.theme ?? input.title,
      input.startDate,
      input.endDate,
      input.startTime,
      input.endTime,
      input.status,
      nextSlug,
      eventId
    )
    .run();

  if (currentEvent) {
    await db
      .prepare(
        `UPDATE forms
         SET short_link_slug = ?, updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND status = 'active' AND short_link_slug = ?`
      )
      .bind(nextSlug, eventId, currentEvent.short_link_slug)
      .run();
  }

  return result.meta.changes > 0;
}

export async function associateEventForm(db: D1Database, eventId: string, formId: string, user: SessionUser) {
  const event = await db
    .prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; title: string; short_link_slug: string }>();
  const source = await getAdminForm(db, formId, user);

  if (!event || !source || source.status !== "active") {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const backupSlug = `${event.short_link_slug}-anterior-${suffix}`;
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `UPDATE forms
         SET short_link_slug = ?, status = 'inactive', updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND short_link_slug = ? AND id <> ?`
      )
      .bind(backupSlug, eventId, event.short_link_slug, formId)
  ];

  let associatedFormId = formId;

  if (source.event_id === eventId) {
    statements.push(
      db
        .prepare("UPDATE forms SET short_link_slug = ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(event.short_link_slug, formId)
    );
  } else {
    associatedFormId = `form_assoc_${suffix}`;
    const sections = await db
      .prepare("SELECT id, section_key, title, order_index FROM form_sections WHERE form_id = ? ORDER BY order_index")
      .bind(formId)
      .all<FormSection>();
    const fields = await db
      .prepare(
        "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_fields WHERE form_id = ? ORDER BY order_index"
      )
      .bind(formId)
      .all<FormField>();

    statements.push(
      db
        .prepare(
          `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id)
           VALUES (?, ?, ?, 'active', ?, ?, ?)`
        )
        .bind(
          associatedFormId,
          eventId,
          source.name,
          event.short_link_slug,
          source.welcome_title_template,
          source.id
        )
    );

    for (const section of sections.results) {
      const newSectionId = `${section.id}_${suffix}`;
      statements.push(
        db
          .prepare(
            `INSERT INTO form_sections (id, form_id, section_key, title, order_index)
             VALUES (?, ?, ?, ?, ?)`
          )
          .bind(newSectionId, associatedFormId, section.section_key, section.title, section.order_index)
      );

      for (const field of fields.results.filter((item) => item.section_id === section.id)) {
        statements.push(
          db
            .prepare(
              `INSERT INTO form_fields (id, form_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              `${field.id}_${suffix}`,
              associatedFormId,
              newSectionId,
              field.field_key,
              field.label,
              field.field_type,
              field.catalog_key,
              field.is_required,
              field.order_index,
              field.config
            )
        );
      }
    }
  }

  await db.batch(statements);
  return getAdminForm(db, associatedFormId, user);
}

export async function associateEventFormTemplate(db: D1Database, eventId: string, templateId: string) {
  const event = await db
    .prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; title: string; short_link_slug: string }>();
  const template = await db
    .prepare("SELECT id, name, status FROM form_templates WHERE id = ?")
    .bind(templateId)
    .first<{ id: string; name: string; status: string }>();

  if (!event || !template || template.status !== "active") {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const publishedFormId = `form_pub_${suffix}`;
  const publicationId = `pub_${suffix}`;
  const backupSlug = `${event.short_link_slug}-anterior-${suffix}`;
  const historicalStatus = `inactive_${suffix}`;
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `UPDATE forms
         SET short_link_slug = ?, status = 'inactive', updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND short_link_slug = ?`
      )
      .bind(backupSlug, eventId, event.short_link_slug),
    db
      .prepare(
        "UPDATE event_form_publications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND status = 'active'"
      )
      .bind(historicalStatus, eventId),
    db
      .prepare(
        `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id, form_template_id)
         VALUES (?, ?, ?, 'active', ?, ?, NULL, ?)`
      )
      .bind(
        publishedFormId,
        eventId,
        template.name,
        event.short_link_slug,
        "Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}",
        template.id
      ),
    db
      .prepare(
        `INSERT INTO event_form_publications (id, event_id, form_template_id, published_form_id, status)
         VALUES (?, ?, ?, ?, 'active')`
      )
      .bind(publicationId, eventId, template.id, publishedFormId)
  ];

  await db.batch(statements);
  return db
    .prepare(
      `SELECT
        f.id,
        f.event_id,
        e.title AS event_title,
        f.name,
        f.status,
        f.short_link_slug,
        f.welcome_title_template,
        f.cloned_from_form_id,
        f.form_template_id,
        COUNT(DISTINCT fts.id) AS section_count,
        COUNT(DISTINCT ftf.id) AS field_count
       FROM forms f
       INNER JOIN events e ON e.id = f.event_id
       LEFT JOIN form_template_sections fts ON fts.template_id = f.form_template_id
       LEFT JOIN form_template_fields ftf ON ftf.template_id = f.form_template_id
       WHERE f.id = ?
       GROUP BY f.id`
    )
    .bind(publishedFormId)
    .first<AdminForm>();
}

export async function listAdminForms(db: D1Database, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "" : "WHERE e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      f.id,
      f.event_id,
      e.title AS event_title,
      f.name,
      f.status,
      f.short_link_slug,
      f.welcome_title_template,
      f.cloned_from_form_id,
      f.form_template_id,
      ft.name AS template_name,
      CASE WHEN e.short_link_slug = f.short_link_slug AND f.status = 'active' THEN 1 ELSE 0 END AS is_event_publication,
      CASE WHEN e.short_link_slug = f.short_link_slug AND f.status = 'active' THEN e.id ELSE NULL END AS associated_event_id,
      CASE WHEN e.short_link_slug = f.short_link_slug AND f.status = 'active' THEN e.title ELSE NULL END AS associated_event_title,
      COUNT(DISTINCT COALESCE(fts.id, fs.id)) AS section_count,
      COUNT(DISTINCT COALESCE(ftf.id, ff.id)) AS field_count
     FROM forms f
     INNER JOIN events e ON e.id = f.event_id
     LEFT JOIN form_sections fs ON fs.form_id = f.id
     LEFT JOIN form_fields ff ON ff.form_id = f.id
     LEFT JOIN form_templates ft ON ft.id = f.form_template_id
     LEFT JOIN form_template_sections fts ON fts.template_id = f.form_template_id
     LEFT JOIN form_template_fields ftf ON ftf.template_id = f.form_template_id
     ${whereSql}
     GROUP BY f.id
     ORDER BY f.created_at DESC`
  );

  return canSeeAllEvents(user) ? statement.all<AdminForm>() : statement.bind(user.id).all<AdminForm>();
}

export async function listFormTemplates(db: D1Database) {
  return db
    .prepare(
      `SELECT
        ft.id,
        ft.name,
        ft.description,
        ft.status,
        ft.source_form_id,
        COUNT(DISTINCT fts.id) AS section_count,
        COUNT(DISTINCT ftf.id) AS field_count,
        COUNT(DISTINCT efp.event_id) AS event_count,
        COUNT(DISTINCT CASE WHEN efp.status = 'active' THEN efp.event_id END) AS active_publication_count
       FROM form_templates ft
       LEFT JOIN form_template_sections fts ON fts.template_id = ft.id
       LEFT JOIN form_template_fields ftf ON ftf.template_id = ft.id
       LEFT JOIN event_form_publications efp ON efp.form_template_id = ft.id
       GROUP BY ft.id
       ORDER BY ft.name`
    )
    .all<FormTemplate>();
}

export async function getFormTemplate(db: D1Database, templateId: string) {
  return db
    .prepare(
      `SELECT
        ft.id,
        ft.name,
        ft.description,
        ft.status,
        ft.source_form_id,
        COUNT(DISTINCT fts.id) AS section_count,
        COUNT(DISTINCT ftf.id) AS field_count,
        COUNT(DISTINCT efp.event_id) AS event_count,
        COUNT(DISTINCT CASE WHEN efp.status = 'active' THEN efp.event_id END) AS active_publication_count
       FROM form_templates ft
       LEFT JOIN form_template_sections fts ON fts.template_id = ft.id
       LEFT JOIN form_template_fields ftf ON ftf.template_id = ft.id
       LEFT JOIN event_form_publications efp ON efp.form_template_id = ft.id
       WHERE ft.id = ?
       GROUP BY ft.id`
    )
    .bind(templateId)
    .first<FormTemplate>();
}

export async function getFormTemplateStructure(db: D1Database, templateId: string) {
  const [sections, fields] = await Promise.all([
    db
      .prepare(
        `SELECT id, section_key, title, order_index
         FROM form_template_sections
         WHERE template_id = ?
         ORDER BY order_index`
      )
      .bind(templateId)
      .all<FormSection>(),
    db
      .prepare(
        `SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config
         FROM form_template_fields
         WHERE template_id = ?
         ORDER BY order_index`
      )
      .bind(templateId)
      .all<FormField>()
  ]);

  return {
    sections: sections.results.map((section) => ({
      ...section,
      fields: fields.results.filter((field) => field.section_id === section.id)
    }))
  };
}

export async function listFormSectionDefinitions(db: D1Database) {
  return db
    .prepare(
      `SELECT id, section_key, title, description, status
       FROM form_section_definitions
       WHERE status = 'active'
       ORDER BY title`
    )
    .all<FormSectionDefinition>();
}

export async function listFormControlDefinitions(db: D1Database) {
  return db
    .prepare(
      `SELECT fcd.id, fcd.control_key, fcd.label, fcd.field_type, fcd.catalog_key, fcd.default_required, fcd.validation_rules, fcd.default_config, fcd.status
       FROM form_control_definitions fcd
       LEFT JOIN system_catalogs c ON c.catalog_key = fcd.catalog_key
       WHERE fcd.status = 'active'
         AND (fcd.catalog_key IS NULL OR c.status = 'active')
       ORDER BY fcd.label`
    )
    .all<FormControlDefinition>();
}

async function normalizeTemplateSectionOrder(db: D1Database, templateId: string) {
  const sections = await db
    .prepare("SELECT id FROM form_template_sections WHERE template_id = ? ORDER BY order_index, title")
    .bind(templateId)
    .all<{ id: string }>();

  await db.batch(sections.results.map((section, index) =>
    db.prepare("UPDATE form_template_sections SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind((index + 1) * 10, section.id)
  ));
}

async function normalizeTemplateFieldOrder(db: D1Database, sectionId: string) {
  const fields = await db
    .prepare("SELECT id FROM form_template_fields WHERE section_id = ? ORDER BY order_index, label")
    .bind(sectionId)
    .all<{ id: string }>();

  await db.batch(fields.results.map((field, index) =>
    db.prepare("UPDATE form_template_fields SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind((index + 1) * 10, field.id)
  ));
}

async function nextSectionOrder(db: D1Database, templateId: string, position: string, targetSectionId?: string | null) {
  if ((position === "before" || position === "after") && targetSectionId) {
    const target = await db
      .prepare("SELECT order_index FROM form_template_sections WHERE id = ? AND template_id = ?")
      .bind(targetSectionId, templateId)
      .first<{ order_index: number }>();
    if (target) {
      return position === "before" ? target.order_index - 1 : target.order_index + 1;
    }
  }

  if (position === "start") {
    const first = await db
      .prepare("SELECT MIN(order_index) AS order_index FROM form_template_sections WHERE template_id = ?")
      .bind(templateId)
      .first<{ order_index: number | null }>();
    return (first?.order_index ?? 10) - 1;
  }

  const last = await db
    .prepare("SELECT MAX(order_index) AS order_index FROM form_template_sections WHERE template_id = ?")
    .bind(templateId)
    .first<{ order_index: number | null }>();
  return (last?.order_index ?? 0) + 10;
}

async function nextFieldOrder(db: D1Database, sectionId: string, position: string, targetFieldId?: string | null) {
  if ((position === "before" || position === "after") && targetFieldId) {
    const target = await db
      .prepare("SELECT order_index FROM form_template_fields WHERE id = ? AND section_id = ?")
      .bind(targetFieldId, sectionId)
      .first<{ order_index: number }>();
    if (target) {
      return position === "before" ? target.order_index - 1 : target.order_index + 1;
    }
  }

  if (position === "start") {
    const first = await db
      .prepare("SELECT MIN(order_index) AS order_index FROM form_template_fields WHERE section_id = ?")
      .bind(sectionId)
      .first<{ order_index: number | null }>();
    return (first?.order_index ?? 10) - 1;
  }

  const last = await db
    .prepare("SELECT MAX(order_index) AS order_index FROM form_template_fields WHERE section_id = ?")
    .bind(sectionId)
    .first<{ order_index: number | null }>();
  return (last?.order_index ?? 0) + 10;
}

export async function addTemplateSection(db: D1Database, templateId: string, input: {
  sectionDefinitionId: string;
  title?: string;
  position?: string;
  targetSectionId?: string | null;
}) {
  const template = await getFormTemplate(db, templateId);
  if (!template) return { ok: false, message: "Modelo de formulario no encontrado." };

  const definition = await db
    .prepare("SELECT id, section_key, title FROM form_section_definitions WHERE id = ? AND status = 'active'")
    .bind(input.sectionDefinitionId)
    .first<{ id: string; section_key: string; title: string }>();
  if (!definition) return { ok: false, message: "Seccion no disponible en la paleta." };

  const title = input.title?.trim() || definition.title;
  const suffix = crypto.randomUUID().slice(0, 10);
  const sectionKey = `${definition.section_key}_${toFieldKey(title, suffix)}`;
  const duplicate = await db
    .prepare("SELECT id FROM form_template_sections WHERE template_id = ? AND section_key = ?")
    .bind(templateId, sectionKey)
    .first<{ id: string }>();
  if (duplicate) return { ok: false, message: "Esta seccion ya existe en el modelo con el mismo titulo." };

  const sectionId = `tplsec_${suffix}`;
  await normalizeTemplateSectionOrder(db, templateId);
  const orderIndex = await nextSectionOrder(db, templateId, input.position ?? "end", input.targetSectionId);

  await db
    .prepare(
      `INSERT INTO form_template_sections (id, template_id, section_key, title, order_index)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(sectionId, templateId, sectionKey, title, orderIndex)
    .run();
  await normalizeTemplateSectionOrder(db, templateId);

  return { ok: true, template: await getFormTemplate(db, templateId), ...(await getFormTemplateStructure(db, templateId)) };
}

export async function removeTemplateSection(db: D1Database, templateId: string, sectionId: string) {
  const existing = await db
    .prepare("SELECT id FROM form_template_sections WHERE id = ? AND template_id = ?")
    .bind(sectionId, templateId)
    .first<{ id: string }>();
  if (!existing) return { ok: false, message: "Seccion no encontrada en el modelo." };

  await db.prepare("DELETE FROM form_template_sections WHERE id = ? AND template_id = ?").bind(sectionId, templateId).run();
  await normalizeTemplateSectionOrder(db, templateId);
  return { ok: true, template: await getFormTemplate(db, templateId), ...(await getFormTemplateStructure(db, templateId)) };
}

export async function addTemplateField(db: D1Database, templateId: string, input: {
  sectionId: string;
  controlDefinitionId: string;
  label?: string;
  isRequired?: boolean;
  textValidation?: string;
  position?: string;
  targetFieldId?: string | null;
}) {
  const template = await getFormTemplate(db, templateId);
  if (!template) return { ok: false, message: "Modelo de formulario no encontrado." };

  const section = await db
    .prepare("SELECT id FROM form_template_sections WHERE id = ? AND template_id = ?")
    .bind(input.sectionId, templateId)
    .first<{ id: string }>();
  if (!section) return { ok: false, message: "Seleccione una seccion valida." };

  const control = await db
    .prepare(
      `SELECT id, control_key, label, field_type, catalog_key, default_required, default_config
       FROM form_control_definitions
       WHERE id = ? AND status = 'active'`
    )
    .bind(input.controlDefinitionId)
    .first<FormControlDefinition>();
  if (!control) return { ok: false, message: "Control no disponible en la paleta." };

  const label = input.label?.trim() || control.label;
  const normalizedLabel = normalizeIdentity(label);
  const duplicate = await db
    .prepare(
      `SELECT id
       FROM form_template_fields
       WHERE template_id = ?
         AND json_extract(config, '$.controlDefinitionId') = ?
         AND json_extract(config, '$.normalizedLabel') = ?`
    )
    .bind(templateId, control.id, normalizedLabel)
    .first<{ id: string }>();
  if (duplicate) {
    return { ok: false, message: "Este control ya existe en el modelo con la misma etiqueta. Si representa otra pregunta, cambie la etiqueta visible." };
  }

  const fieldId = `tplfield_${crypto.randomUUID().slice(0, 10)}`;
  const baseFieldKey = toFieldKey(label, control.control_key);
  let fieldKey = baseFieldKey;
  let counter = 2;
  while (await db.prepare("SELECT id FROM form_template_fields WHERE template_id = ? AND field_key = ?").bind(templateId, fieldKey).first()) {
    fieldKey = `${baseFieldKey}_${counter}`;
    counter += 1;
  }
  const config = JSON.stringify(applyTextValidationConfig({
    ...(control.default_config ? JSON.parse(control.default_config) as Record<string, unknown> : {}),
    controlDefinitionId: control.id,
    normalizedLabel
  }, control.field_type, input.textValidation));
  await normalizeTemplateFieldOrder(db, input.sectionId);
  const orderIndex = await nextFieldOrder(db, input.sectionId, input.position ?? "end", input.targetFieldId);

  await db
    .prepare(
      `INSERT INTO form_template_fields (id, template_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      fieldId,
      templateId,
      input.sectionId,
      fieldKey,
      label,
      control.field_type,
      control.catalog_key,
      input.isRequired === false ? 0 : control.default_required,
      orderIndex,
      config
    )
    .run();
  await normalizeTemplateFieldOrder(db, input.sectionId);

  return { ok: true, template: await getFormTemplate(db, templateId), ...(await getFormTemplateStructure(db, templateId)) };
}

export async function removeTemplateField(db: D1Database, templateId: string, fieldId: string) {
  const field = await db
    .prepare("SELECT section_id FROM form_template_fields WHERE id = ? AND template_id = ?")
    .bind(fieldId, templateId)
    .first<{ section_id: string }>();
  if (!field) return { ok: false, message: "Control no encontrado en el modelo." };

  await db.prepare("DELETE FROM form_template_fields WHERE id = ? AND template_id = ?").bind(fieldId, templateId).run();
  await normalizeTemplateFieldOrder(db, field.section_id);
  return { ok: true, template: await getFormTemplate(db, templateId), ...(await getFormTemplateStructure(db, templateId)) };
}

export async function updateTemplateField(db: D1Database, templateId: string, fieldId: string, input: {
  sectionId: string;
  label?: string;
  isRequired?: boolean;
  textValidation?: string;
  position?: string;
  targetFieldId?: string | null;
}) {
  const field = await db
    .prepare(
      `SELECT id, section_id, label, field_type, order_index, config
       FROM form_template_fields
       WHERE id = ? AND template_id = ?`
    )
    .bind(fieldId, templateId)
    .first<{ id: string; section_id: string; label: string; field_type: string; order_index: number; config: string }>();
  if (!field) return { ok: false, message: "Control no encontrado en el modelo." };

  const section = await db
    .prepare("SELECT id FROM form_template_sections WHERE id = ? AND template_id = ?")
    .bind(input.sectionId, templateId)
    .first<{ id: string }>();
  if (!section) return { ok: false, message: "Seleccione una seccion valida." };

  const label = input.label?.trim() || field.label;
  const normalizedLabel = normalizeIdentity(label);
  const currentConfig = field.config ? JSON.parse(field.config) as Record<string, unknown> : {};
  const controlDefinitionId = typeof currentConfig.controlDefinitionId === "string" ? currentConfig.controlDefinitionId : null;

  if (controlDefinitionId) {
    const duplicate = await db
      .prepare(
        `SELECT id
         FROM form_template_fields
         WHERE template_id = ?
           AND id <> ?
           AND json_extract(config, '$.controlDefinitionId') = ?
           AND json_extract(config, '$.normalizedLabel') = ?`
      )
      .bind(templateId, fieldId, controlDefinitionId, normalizedLabel)
      .first<{ id: string }>();
    if (duplicate) {
      return { ok: false, message: "Este control ya existe en el modelo con la misma etiqueta. Si representa otra pregunta, cambie la etiqueta visible." };
    }
  }

  const position = input.position ?? "same";
  if (position !== "same" || field.section_id !== input.sectionId) {
    await normalizeTemplateFieldOrder(db, input.sectionId);
  }
  const orderIndex = position !== "same" || field.section_id !== input.sectionId
    ? await nextFieldOrder(db, input.sectionId, position === "same" ? "end" : position, input.targetFieldId === fieldId ? null : input.targetFieldId)
    : field.order_index;
  const config = JSON.stringify(applyTextValidationConfig({
    ...currentConfig,
    normalizedLabel
  }, field.field_type, input.textValidation));

  await db
    .prepare(
      `UPDATE form_template_fields
       SET section_id = ?, label = ?, is_required = ?, order_index = ?, config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND template_id = ?`
    )
    .bind(
      input.sectionId,
      label,
      input.isRequired === false ? 0 : 1,
      orderIndex,
      config,
      fieldId,
      templateId
    )
    .run();

  await normalizeTemplateFieldOrder(db, input.sectionId);
  if (field.section_id !== input.sectionId) {
    await normalizeTemplateFieldOrder(db, field.section_id);
  }

  return { ok: true, template: await getFormTemplate(db, templateId), ...(await getFormTemplateStructure(db, templateId)) };
}

export async function updateFormTemplateDetails(db: D1Database, templateId: string, input: {
  name: string;
  description?: string;
  status: string;
}) {
  const template = await getFormTemplate(db, templateId);

  if (!template) {
    return { ok: false, message: "Modelo de formulario no encontrado." };
  }

  if (template.active_publication_count > 0 && input.status !== "active") {
    return { ok: false, message: "No se puede inactivar un modelo asociado a eventos activos. Primero cambie el modelo de esos eventos." };
  }

  const status = ["draft", "active", "inactive", "archived"].includes(input.status) ? input.status : template.status;
  await db
    .prepare(
      "UPDATE form_templates SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(input.name.trim(), input.description?.trim() || null, status, templateId)
    .run();

  await db
    .prepare(
      `UPDATE forms
       SET name = ?, updated_at = CURRENT_TIMESTAMP
       WHERE form_template_id = ? AND status = 'active'`
    )
    .bind(input.name.trim(), templateId)
    .run();

  return { ok: true, template: await getFormTemplate(db, templateId) };
}

export async function cloneFormTemplate(db: D1Database, templateId: string) {
  const source = await getFormTemplate(db, templateId);

  if (!source) {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const cloneId = `tpl_clone_${suffix}`;
  const sections = await db
    .prepare("SELECT id, section_key, title, order_index FROM form_template_sections WHERE template_id = ? ORDER BY order_index")
    .bind(templateId)
    .all<FormSection>();
  const fields = await db
    .prepare(
      "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_template_fields WHERE template_id = ? ORDER BY order_index"
    )
    .bind(templateId)
    .all<FormField>();
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `INSERT INTO form_templates (id, name, description, status, source_form_id)
         VALUES (?, ?, ?, 'draft', ?)`
      )
      .bind(cloneId, `${source.name} - copia`, source.description, source.source_form_id)
  ];

  for (const section of sections.results) {
    const sectionId = `${section.id}_${suffix}`;
    statements.push(
      db
        .prepare(
          `INSERT INTO form_template_sections (id, template_id, section_key, title, order_index)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(sectionId, cloneId, section.section_key, section.title, section.order_index)
    );

    for (const field of fields.results.filter((item) => item.section_id === section.id)) {
      statements.push(
        db
          .prepare(
            `INSERT INTO form_template_fields (id, template_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            `${field.id}_${suffix}`,
            cloneId,
            sectionId,
            field.field_key,
            field.label,
            field.field_type,
            field.catalog_key,
            field.is_required,
            field.order_index,
            field.config
          )
      );
    }
  }

  await db.batch(statements);
  return getFormTemplate(db, cloneId);
}

export async function getAdminForm(db: D1Database, formId: string, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "WHERE f.id = ?" : "WHERE f.id = ? AND e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      f.id,
      f.event_id,
      e.title AS event_title,
      f.name,
      f.status,
      f.short_link_slug,
      f.welcome_title_template,
      f.cloned_from_form_id,
      f.form_template_id,
      ft.name AS template_name,
      CASE WHEN e.short_link_slug = f.short_link_slug AND f.status = 'active' THEN 1 ELSE 0 END AS is_event_publication,
      CASE WHEN e.short_link_slug = f.short_link_slug AND f.status = 'active' THEN e.id ELSE NULL END AS associated_event_id,
      CASE WHEN e.short_link_slug = f.short_link_slug AND f.status = 'active' THEN e.title ELSE NULL END AS associated_event_title,
      COUNT(DISTINCT COALESCE(fts.id, fs.id)) AS section_count,
      COUNT(DISTINCT COALESCE(ftf.id, ff.id)) AS field_count
     FROM forms f
     INNER JOIN events e ON e.id = f.event_id
     LEFT JOIN form_sections fs ON fs.form_id = f.id
     LEFT JOIN form_fields ff ON ff.form_id = f.id
     LEFT JOIN form_templates ft ON ft.id = f.form_template_id
     LEFT JOIN form_template_sections fts ON fts.template_id = f.form_template_id
     LEFT JOIN form_template_fields ftf ON ftf.template_id = f.form_template_id
     ${whereSql}
     GROUP BY f.id`
  );

  return canSeeAllEvents(user)
    ? statement.bind(formId).first<AdminForm>()
    : statement.bind(formId, user.id).first<AdminForm>();
}

export async function getFormStructure(db: D1Database, formId: string) {
  const form = await db
    .prepare("SELECT form_template_id FROM forms WHERE id = ?")
    .bind(formId)
    .first<{ form_template_id: string | null }>();

  if (form?.form_template_id) {
    const [sections, fields] = await Promise.all([
      db
        .prepare(
          `SELECT id, section_key, title, order_index
           FROM form_template_sections
           WHERE template_id = ?
           ORDER BY order_index`
        )
        .bind(form.form_template_id)
        .all<FormSection>(),
      db
        .prepare(
          `SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config
           FROM form_template_fields
           WHERE template_id = ?
           ORDER BY order_index`
        )
        .bind(form.form_template_id)
        .all<FormField>()
    ]);

    return {
      sections: sections.results.map((section) => ({
        ...section,
        fields: fields.results.filter((field) => field.section_id === section.id)
      }))
    };
  }

  const [sections, fields] = await Promise.all([
    db
      .prepare(
        `SELECT id, section_key, title, order_index
         FROM form_sections
         WHERE form_id = ?
         ORDER BY order_index`
      )
      .bind(formId)
      .all<FormSection>(),
    db
      .prepare(
        `SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config
         FROM form_fields
         WHERE form_id = ?
         ORDER BY order_index`
      )
      .bind(formId)
      .all<FormField>()
  ]);

  return {
    sections: sections.results.map((section) => ({
      ...section,
      fields: fields.results.filter((field) => field.section_id === section.id)
    }))
  };
}

export async function getPublicFormStructure(db: D1Database, formId: string) {
  const structure = await getFormStructure(db, formId);
  const catalogKeys = Array.from(
    new Set(
      structure.sections
        .flatMap((section) => section.fields)
        .map((field) => field.catalog_key)
        .filter((key): key is string => Boolean(key))
    )
  );
  const catalogs: Record<string, CatalogItem[]> = {};

  await Promise.all(
    catalogKeys.map(async (catalogKey) => {
      const items = await db
        .prepare(
          `SELECT i.id, i.catalog_id, i.parent_item_id, i.source_id, i.name, i.description, i.status
           FROM system_catalog_items i
           INNER JOIN system_catalogs c ON c.id = i.catalog_id
           WHERE c.catalog_key = ? AND i.status = 'active'
           ORDER BY ${catalogOrderSql()}
           LIMIT 2500`
        )
        .bind(catalogKey)
        .all<CatalogItem>();
      catalogs[catalogKey] = items.results;
    })
  );

  return { ...structure, catalogs };
}

export async function findParticipantByDocument(db: D1Database, documentType: string, documentNumber: string) {
  const legacyDocumentAliases: Record<string, string[]> = {
    DNI: ["DNI/CEDULA"],
    "DNI/CEDULA": ["DNI"],
    CE: ["CARNET EXTRANJERIA"],
    "CARNET EXTRANJERIA": ["CE"],
    PAS: ["PASAPORTE"],
    PASAPORTE: ["PAS"]
  };
  const documentTypes = [documentType, ...(legacyDocumentAliases[documentType] ?? [])];
  const placeholders = documentTypes.map(() => "?").join(", ");

  return db
    .prepare(
      `SELECT id, document_type, document_number, first_name, paternal_last_name, maternal_last_name, email, phone
       FROM participants
       WHERE document_type IN (${placeholders}) AND document_number = ?
       LIMIT 1`
    )
    .bind(...documentTypes, documentNumber)
    .first<Participant>();
}

export async function hasAttendance(db: D1Database, sessionId: string, participantId: string) {
  const row = await db
    .prepare("SELECT id FROM attendance_records WHERE session_id = ? AND participant_id = ? LIMIT 1")
    .bind(sessionId, participantId)
    .first<{ id: string }>();

  return Boolean(row);
}

export async function participantHasEventAttendance(db: D1Database, eventId: string, participantId: string) {
  const row = await db
    .prepare("SELECT id FROM attendance_records WHERE event_id = ? AND participant_id = ? LIMIT 1")
    .bind(eventId, participantId)
    .first<{ id: string }>();

  return Boolean(row);
}

export async function getPublicQuestionByParticipantSlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT q.*, e.title AS event_title, e.short_link_slug AS event_slug
       FROM event_questions q
       INNER JOIN events e ON e.id = q.event_id
       WHERE q.participant_slug = ? AND q.status IN ('open', 'closed')`
    )
    .bind(slug)
    .first<EventQuestion & { event_title: string; event_slug: string }>();
}

export async function getPublicQuestionByPresenterSlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT q.*, e.title AS event_title, e.short_link_slug AS event_slug
       FROM event_questions q
       INNER JOIN events e ON e.id = q.event_id
       WHERE q.presenter_slug = ? AND q.status IN ('open', 'closed')`
    )
    .bind(slug)
    .first<EventQuestion & { event_title: string; event_slug: string }>();
}

export async function getPublicBoardByParticipantSlug(db: D1Database, slug: string) {
  const board = await db
    .prepare(
      `SELECT b.*, e.title AS event_title, e.short_link_slug AS event_slug, COUNT(n.id) AS note_count
       FROM event_boards b
       INNER JOIN events e ON e.id = b.event_id
       LEFT JOIN event_board_notes n ON n.board_id = b.id AND n.status = 'active'
       WHERE b.participant_slug = ?
       GROUP BY b.id`
    )
    .bind(slug)
    .first<EventBoard & { event_title: string; event_slug: string }>();
  if (!board) return null;
  const instructions = await listBoardInstructions(db, board.id);
  return { ...board, instructions: instructions.results };
}

export async function getPublicBoardByPresenterSlug(db: D1Database, slug: string) {
  const board = await db
    .prepare(
      `SELECT b.*, e.title AS event_title, e.short_link_slug AS event_slug, COUNT(n.id) AS note_count
       FROM event_boards b
       INNER JOIN events e ON e.id = b.event_id
       LEFT JOIN event_board_notes n ON n.board_id = b.id AND n.status = 'active'
       WHERE b.presenter_slug = ?
       GROUP BY b.id`
    )
    .bind(slug)
    .first<EventBoard & { event_title: string; event_slug: string }>();
  if (!board) return null;
  const instructions = await listBoardInstructions(db, board.id);
  return { ...board, instructions: instructions.results };
}

export async function listBoardNotes(db: D1Database, boardId: string, page = 1, pageSize = 48) {
  const limit = Math.min(Math.max(Math.floor(pageSize), 1), 96);
  const currentPage = Math.max(Math.floor(page), 1);
  const offset = (currentPage - 1) * limit;
  const [notes, total] = await Promise.all([
    db
      .prepare(
        `SELECT id, board_id, event_id, session_id, first_name, last_name, country_id, country_name, country_iso2,
                note_html, note_text, note_excerpt, status, created_at
         FROM event_board_notes
         WHERE board_id = ? AND status = 'active'
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(boardId, limit, offset)
      .all<EventBoardNote>(),
    db
      .prepare("SELECT COUNT(*) AS total FROM event_board_notes WHERE board_id = ? AND status = 'active'")
      .bind(boardId)
      .first<{ total: number }>()
  ]);

  return {
    notes: notes.results,
    page: currentPage,
    pageSize: limit,
    total: Number(total?.total ?? 0),
    totalPages: Math.max(1, Math.ceil(Number(total?.total ?? 0) / limit))
  };
}

export async function moderateBoardNote(db: D1Database, presenterSlug: string, noteId: string) {
  const board = await getPublicBoardByPresenterSlug(db, presenterSlug);
  if (!board || board.status === "archived") return { ok: false, message: "Pizarra no disponible." };

  const result = await db
    .prepare(
      `UPDATE event_board_notes
       SET status = 'moderated'
       WHERE id = ? AND board_id = ? AND status = 'active'`
    )
    .bind(noteId, board.id)
    .run();

  if (!result.meta.changes) return { ok: false, message: "La nota no existe o ya fue retirada." };
  return { ok: true };
}

function noteFingerprint(firstName: string, lastName: string, countryName: string, userAgent?: string) {
  return normalizeAnswer(`${firstName} ${lastName} ${countryName} ${userAgent ?? ""}`);
}

export async function registerBoardNote(db: D1Database, board: EventBoard, input: {
  firstName?: string;
  lastName?: string;
  countryId?: string | null;
  countryName?: string;
  countryIso2?: string | null;
  noteHtml?: string;
  userAgent?: string;
}) {
  if (board.status !== "open") return { ok: false, message: "La pizarra no esta abierta para recibir notas." };
  const firstName = input.firstName?.replace(/\s+/g, " ").trim() ?? "";
  const lastName = input.lastName?.replace(/\s+/g, " ").trim() ?? "";
  const countryName = input.countryName?.replace(/\s+/g, " ").trim() ?? "";
  const countryId = input.countryId?.trim() || null;
  const countryIso2 = input.countryIso2?.trim().toUpperCase() || null;
  const noteHtml = sanitizeRichHtml(input.noteHtml ?? "");
  const noteText = textFromHtml(noteHtml);

  if (!firstName || !lastName) return { ok: false, message: "Ingrese nombre y apellido." };
  if (!countryName) return { ok: false, message: "Seleccione pais." };
  if (!noteText) return { ok: false, message: "Ingrese una nota." };
  if (noteText.length > board.max_note_length) {
    return { ok: false, message: `La nota no debe superar ${board.max_note_length} caracteres.` };
  }

  const fingerprint = noteFingerprint(firstName, lastName, countryName, input.userAgent);
  const count = await db
    .prepare("SELECT COUNT(*) AS total FROM event_board_notes WHERE board_id = ? AND participant_fingerprint = ? AND status = 'active'")
    .bind(board.id, fingerprint)
    .first<{ total: number }>();
  const maxNotes = board.allow_multiple_notes ? Math.max(board.max_notes_per_participant ?? 1, 1) : 1;
  if (Number(count?.total ?? 0) >= maxNotes) {
    return { ok: false, message: `Ya registro el maximo permitido de notas (${maxNotes}).` };
  }

  const noteId = `board_note_${crypto.randomUUID().slice(0, 12)}`;
  const excerpt = noteText.length > 50 ? `${noteText.slice(0, 50)}...` : noteText;
  await db
    .prepare(
      `INSERT INTO event_board_notes (
        id, board_id, event_id, session_id, first_name, last_name, country_id, country_name, country_iso2,
        note_html, note_text, note_excerpt, participant_fingerprint
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(noteId, board.id, board.event_id, board.session_id, firstName, lastName, countryId, countryName, countryIso2, noteHtml, noteText, excerpt, fingerprint)
    .run();

  return { ok: true, note: await db.prepare("SELECT * FROM event_board_notes WHERE id = ?").bind(noteId).first<EventBoardNote>() };
}

export async function countQuestionResponsesByParticipant(db: D1Database, questionId: string, participantId: string) {
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM event_question_responses WHERE question_id = ? AND participant_id = ? AND status = 'active'")
    .bind(questionId, participantId)
    .first<{ count: number }>();
  return Number(row?.count ?? 0);
}

export async function listQuestionResponsesByParticipant(db: D1Database, questionId: string, participantId: string) {
  return db
    .prepare(
      `SELECT id, answer_text, created_at
       FROM event_question_responses
       WHERE question_id = ? AND participant_id = ? AND status = 'active'
       ORDER BY created_at ASC`
    )
    .bind(questionId, participantId)
    .all<EventQuestionResponseItem>();
}

export async function listQuestionSelectionsByParticipant(db: D1Database, questionId: string, participantId: string) {
  return db
    .prepare(
      `SELECT id, normalized_answer, display_answer, selection_order, created_at
       FROM event_question_selections
       WHERE question_id = ? AND participant_id = ? AND status = 'active'
       ORDER BY selection_order ASC, created_at ASC`
    )
    .bind(questionId, participantId)
    .all<EventQuestionSelectionItem>();
}

export async function addQuestionSelection(db: D1Database, question: EventQuestion, participant: Participant, input: {
  normalizedAnswer?: string;
  displayAnswer?: string;
}) {
  if (!question.show_participant_cloud) return { ok: false, message: "La nube no esta disponible para participantes." };

  const normalizedAnswer = normalizeAnswer(input.normalizedAnswer || input.displayAnswer || "");
  if (!normalizedAnswer) return { ok: false, message: "Seleccione un concepto valido." };

  const cloudItem = await db
    .prepare(
      `SELECT normalized_answer, MIN(answer_text) AS answer, COUNT(*) AS count
       FROM event_question_responses
       WHERE question_id = ? AND status = 'active'
       GROUP BY normalized_answer
       HAVING normalized_answer = ?
       LIMIT 1`
    )
    .bind(question.id, normalizedAnswer)
    .first<{ normalized_answer: string; answer: string; count: number }>();
  if (!cloudItem) return { ok: false, message: "El concepto seleccionado ya no esta disponible en la nube." };

  const existing = await db
    .prepare(
      `SELECT id
       FROM event_question_selections
       WHERE question_id = ? AND participant_id = ? AND normalized_answer = ? AND status = 'active'`
    )
    .bind(question.id, participant.id, normalizedAnswer)
    .first<{ id: string }>();
  if (existing) return { ok: false, message: "Este concepto ya fue seleccionado." };

  const currentCount = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM event_question_selections
       WHERE question_id = ? AND participant_id = ? AND status = 'active'`
    )
    .bind(question.id, participant.id)
    .first<{ count: number }>();
  if (Number(currentCount?.count ?? 0) >= question.max_selectable_concepts) {
    return { ok: false, message: "Ya seleccionaste el maximo de conceptos permitidos." };
  }

  const orderRow = await db
    .prepare(
      `SELECT COALESCE(MAX(selection_order), 0) + 1 AS next_order
       FROM event_question_selections
       WHERE question_id = ? AND participant_id = ?`
    )
    .bind(question.id, participant.id)
    .first<{ next_order: number }>();
  const selectionId = `qsel_${crypto.randomUUID().slice(0, 12)}`;
  const selectionOrder = Number(orderRow?.next_order ?? 1);
  const displayAnswer = input.displayAnswer?.trim() || cloudItem.answer;

  await db
    .prepare(
      `INSERT INTO event_question_selections (
        id, question_id, event_id, participant_id, document_type, document_number,
        normalized_answer, display_answer, selection_order, status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
    )
    .bind(
      selectionId,
      question.id,
      question.event_id,
      participant.id,
      participant.document_type,
      participant.document_number,
      normalizedAnswer,
      displayAnswer,
      selectionOrder
    )
    .run();

  return {
    ok: true,
    selection: {
      id: selectionId,
      normalized_answer: normalizedAnswer,
      display_answer: displayAnswer,
      selection_order: selectionOrder
    }
  };
}

export async function removeQuestionSelection(db: D1Database, question: EventQuestion, participant: Participant, selectionId: string) {
  const result = await db
    .prepare(
      `UPDATE event_question_selections
       SET status = 'removed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND question_id = ? AND participant_id = ? AND status = 'active'`
    )
    .bind(selectionId, question.id, participant.id)
    .run();
  return result.meta.changes > 0;
}

export async function getQuestionSelectionGroups(db: D1Database, questionId: string) {
  return db
    .prepare(
      `SELECT
        participant_id,
        participant_name,
        GROUP_CONCAT(display_answer, '||') AS selections,
        COUNT(*) AS selection_count
       FROM (
        SELECT
          s.participant_id,
          TRIM(p.first_name || ' ' || COALESCE(p.paternal_last_name, '')) AS participant_name,
          s.display_answer,
          s.selection_order,
          s.created_at
        FROM event_question_selections s
        INNER JOIN participants p ON p.id = s.participant_id
        WHERE s.question_id = ? AND s.status = 'active'
        ORDER BY s.participant_id, s.selection_order ASC, s.created_at ASC
       )
       GROUP BY participant_id, participant_name
       ORDER BY participant_name ASC`
    )
    .bind(questionId)
    .all<EventQuestionSelectionGroup>();
}

export async function registerQuestionResponse(db: D1Database, question: EventQuestion, participant: Participant, answerText: string) {
  if (question.status !== "open") return { ok: false, message: "La pregunta no esta abierta para recibir respuestas." };

  const cleanAnswer = answerText.replace(/\s+/g, " ").trim();
  if (!cleanAnswer) return { ok: false, message: "Ingrese una respuesta." };
  if (cleanAnswer.length > question.max_answer_length) {
    return { ok: false, message: `La respuesta no debe superar ${question.max_answer_length} caracteres.` };
  }

  const currentCount = await countQuestionResponsesByParticipant(db, question.id, participant.id);
  if (!question.allow_multiple_responses && currentCount > 0) {
    return { ok: false, message: "Ya registraste una respuesta para esta pregunta." };
  }
  if (question.allow_multiple_responses && question.max_responses_per_participant && currentCount >= question.max_responses_per_participant) {
    return { ok: false, message: "Alcanzaste el maximo de respuestas permitidas para esta pregunta." };
  }

  const responseId = `qresp_${crypto.randomUUID().slice(0, 12)}`;
  await db
    .prepare(
      `INSERT INTO event_question_responses (
        id, question_id, event_id, participant_id, document_type, document_number, answer_text, normalized_answer, status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`
    )
    .bind(
      responseId,
      question.id,
      question.event_id,
      participant.id,
      participant.document_type,
      participant.document_number,
      cleanAnswer,
      normalizeAnswer(cleanAnswer)
    )
    .run();

  return { ok: true, response: { id: responseId, answer_text: cleanAnswer } };
}

export async function getQuestionSummary(db: D1Database, questionId: string) {
  return db
    .prepare(
      `SELECT normalized_answer, MIN(answer_text) AS answer, COUNT(*) AS count
       FROM event_question_responses
       WHERE question_id = ? AND status = 'active'
       GROUP BY normalized_answer
       ORDER BY count DESC, answer ASC
       LIMIT 120`
    )
    .bind(questionId)
    .all<EventQuestionSummaryItem>();
}

export async function registerAttendance(db: D1Database, openSession: OpenSession, participantId: string, formId: string) {
  const attendanceId = `att_${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO attendance_records (id, event_id, module_id, session_id, participant_id, form_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(attendanceId, openSession.event_id, openSession.module_id, openSession.id, participantId, formId)
    .run();

  return attendanceId;
}

export async function createParticipant(db: D1Database, input: {
  documentType: string;
  documentNumber: string;
  firstName: string;
  paternalLastName?: string;
  maternalLastName?: string;
  email?: string;
  phone?: string;
  profileData: Record<string, unknown>;
}) {
  const participantId = `par_${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO participants (
        id, document_type, document_number, first_name, paternal_last_name, maternal_last_name, email, phone, profile_data
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      participantId,
      input.documentType,
      input.documentNumber,
      input.firstName,
      input.paternalLastName ?? null,
      input.maternalLastName ?? null,
      input.email ?? null,
      input.phone ?? null,
      JSON.stringify(input.profileData)
    )
    .run();

  return participantId;
}

export async function getAttendanceReportData(db: D1Database, eventId: string) {
  const event = await db
    .prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; title: string; short_link_slug: string }>();
  const fields = await db
    .prepare(
      `SELECT field_key, label, MIN(order_index) AS order_index
       FROM (
         SELECT ff.field_key, ff.label, ff.order_index
         FROM form_fields ff
         INNER JOIN forms f ON f.id = ff.form_id
         WHERE f.event_id = ?
         UNION ALL
         SELECT ftf.field_key, ftf.label, ftf.order_index
         FROM form_template_fields ftf
         INNER JOIN forms f ON f.form_template_id = ftf.template_id
         WHERE f.event_id = ?
       )
       GROUP BY field_key, label
       ORDER BY order_index`
    )
    .bind(eventId, eventId)
    .all<{ field_key: string; label: string; order_index: number }>();
  const rows = await db
    .prepare(
      `SELECT
        ar.id AS attendance_id,
        ar.registered_at,
        ar.status AS attendance_status,
        m.title AS module_title,
        s.sequence AS session_sequence,
        s.title AS session_title,
        s.theme AS session_theme,
        s.session_date,
        s.start_time,
        s.end_time,
        p.document_type,
        p.document_number,
        p.first_name,
        p.paternal_last_name,
        p.maternal_last_name,
        p.email,
        p.phone,
        p.profile_data
       FROM attendance_records ar
       INNER JOIN participants p ON p.id = ar.participant_id
       INNER JOIN event_sessions s ON s.id = ar.session_id
       INNER JOIN event_modules m ON m.id = ar.module_id
       WHERE ar.event_id = ?
       ORDER BY s.sequence, ar.registered_at`
    )
    .bind(eventId)
    .all<{
      attendance_id: string;
      registered_at: string;
      attendance_status: string;
      module_title: string;
      session_sequence: number;
      session_title: string;
      session_theme: string;
      session_date: string;
      start_time: string;
      end_time: string;
      document_type: string;
      document_number: string;
      first_name: string;
      paternal_last_name: string | null;
      maternal_last_name: string | null;
      email: string | null;
      phone: string | null;
      profile_data: string;
    }>();

  return {
    event,
    fields: fields.results,
    rows: rows.results
  };
}

export async function updateFormStatus(db: D1Database, formId: string, status: string) {
  const result = await db
    .prepare("UPDATE forms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, formId)
    .run();

  return result.meta.changes > 0;
}

export async function updateFormDetails(db: D1Database, formId: string, input: { name: string; status: string }, user: SessionUser) {
  const form = await getAdminForm(db, formId, user);

  if (!form) {
    return { ok: false, message: "Formulario no encontrado o no autorizado." };
  }

  if (form.is_event_publication && input.status !== "active") {
    return { ok: false, message: "No se puede inactivar un formulario asociado al enlace publico del evento. Primero asocie otro modelo al evento." };
  }

  const status = ["draft", "active", "inactive"].includes(input.status) ? input.status : form.status;
  await db
    .prepare("UPDATE forms SET name = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(input.name.trim(), status, formId)
    .run();

  if (form.form_template_id) {
    await db
      .prepare("UPDATE form_templates SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(input.name.trim(), form.form_template_id)
      .run();
  }

  return { ok: true, form: await getAdminForm(db, formId, user) };
}

export async function cloneForm(db: D1Database, sourceFormId: string, user: SessionUser) {
  const source = await getAdminForm(db, sourceFormId, user);

  if (!source) {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const cloneId = `form_clone_${suffix}`;
  const slug = `${source.short_link_slug}-copia-${suffix}`;
  const now = "CURRENT_TIMESTAMP";
  const sections = await db
    .prepare("SELECT id, section_key, title, order_index FROM form_sections WHERE form_id = ? ORDER BY order_index")
    .bind(sourceFormId)
    .all<FormSection>();
  const fields = await db
    .prepare(
      "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_fields WHERE form_id = ? ORDER BY order_index"
    )
    .bind(sourceFormId)
    .all<FormField>();

  const statements = [
    db
      .prepare(
        `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id)
         VALUES (?, ?, ?, 'draft', ?, ?, ?)`
      )
      .bind(cloneId, source.event_id, `${source.name} - copia`, slug, source.welcome_title_template, source.id)
  ];

  for (const section of sections.results) {
    const newSectionId = `${section.id}_${suffix}`;
    statements.push(
      db
        .prepare(
          `INSERT INTO form_sections (id, form_id, section_key, title, order_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ${now}, ${now})`
        )
        .bind(newSectionId, cloneId, section.section_key, section.title, section.order_index)
    );

    for (const field of fields.results.filter((item) => item.section_id === section.id)) {
      statements.push(
        db
          .prepare(
            `INSERT INTO form_fields (id, form_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${now}, ${now})`
          )
          .bind(
            `${field.id}_${suffix}`,
            cloneId,
            newSectionId,
            field.field_key,
            field.label,
            field.field_type,
            field.catalog_key,
            field.is_required,
            field.order_index,
            field.config
          )
      );
    }
  }

  await db.batch(statements);
  return getAdminForm(db, cloneId, user);
}

export async function listCatalogs(db: D1Database) {
  return db
    .prepare(
      `SELECT
        c.id,
        c.catalog_key,
        c.name,
        c.description,
        c.status,
        COALESCE(MAX(fcd.label), c.name) AS control_label,
        COUNT(DISTINCT i.id) AS item_count,
        COUNT(DISTINCT CASE WHEN i.status = 'active' THEN i.id END) AS active_item_count
       FROM system_catalogs c
       LEFT JOIN system_catalog_items i ON i.catalog_id = c.id
       LEFT JOIN form_control_definitions fcd ON fcd.catalog_key = c.catalog_key
       GROUP BY c.id
       ORDER BY c.catalog_key`
    )
    .all<Catalog>();
}

export async function createCatalogWithControl(db: D1Database, input: {
  catalogKey: string;
  catalogName: string;
  controlLabel: string;
  description?: string;
}) {
  const catalogKey = toFieldKey(input.catalogKey, "").replace(/^_+|_+$/g, "");
  const catalogName = input.catalogName.trim();
  const controlLabel = input.controlLabel.trim();

  if (!catalogKey || !catalogName || !controlLabel) {
    return { ok: false, message: "Ingrese nombre del catalogo y nombre para la paleta." };
  }

  const existing = await db
    .prepare("SELECT id FROM system_catalogs WHERE catalog_key = ?")
    .bind(catalogKey)
    .first<{ id: string }>();
  if (existing) {
    return { ok: false, message: "Ya existe un catalogo con esa clave." };
  }

  const catalogId = `cat_${catalogKey}`;
  const controlKey = toFieldKey(controlLabel, catalogKey);
  let finalControlKey = controlKey;
  let counter = 2;
  while (await db.prepare("SELECT id FROM form_control_definitions WHERE control_key = ?").bind(finalControlKey).first()) {
    finalControlKey = `${controlKey}_${counter}`;
    counter += 1;
  }

  await db.batch([
    db
      .prepare(
        `INSERT INTO system_catalogs (id, catalog_key, name, description, status)
         VALUES (?, ?, ?, ?, 'active')`
      )
      .bind(catalogId, catalogKey, catalogName, input.description?.trim() || catalogName),
    db
      .prepare(
        `INSERT INTO form_control_definitions (id, control_key, label, field_type, catalog_key, default_required, validation_rules, default_config, status)
         VALUES (?, ?, ?, 'select', ?, 1, '{}', '{}', 'active')`
      )
      .bind(`ctrldef_${finalControlKey}`, finalControlKey, controlLabel, catalogKey)
  ]);

  return { ok: true, catalogKey };
}

export async function updateCatalogWithControl(db: D1Database, catalogKey: string, input: {
  nextCatalogKey: string;
  catalogName: string;
  controlLabel: string;
  description?: string;
}) {
  const current = await db
    .prepare("SELECT id, catalog_key FROM system_catalogs WHERE catalog_key = ?")
    .bind(catalogKey)
    .first<{ id: string; catalog_key: string }>();
  if (!current) {
    return { ok: false, message: "Catalogo no encontrado." };
  }

  const nextCatalogKey = toFieldKey(input.nextCatalogKey, "").replace(/^_+|_+$/g, "");
  const catalogName = input.catalogName.trim();
  const controlLabel = input.controlLabel.trim();

  if (!nextCatalogKey || !catalogName || !controlLabel) {
    return { ok: false, message: "Ingrese clave, nombre del catalogo y nombre para la paleta." };
  }

  if (nextCatalogKey !== current.catalog_key) {
    const duplicate = await db
      .prepare("SELECT id FROM system_catalogs WHERE catalog_key = ?")
      .bind(nextCatalogKey)
      .first<{ id: string }>();
    if (duplicate) {
      return { ok: false, message: "Ya existe un catalogo con esa clave." };
    }
  }

  await db.batch([
    db
      .prepare(
        `UPDATE system_catalogs
         SET catalog_key = ?, name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(nextCatalogKey, catalogName, input.description?.trim() || catalogName, current.id),
    db
      .prepare(
        `UPDATE form_control_definitions
         SET catalog_key = ?, label = ?, updated_at = CURRENT_TIMESTAMP
         WHERE catalog_key = ?`
      )
      .bind(nextCatalogKey, controlLabel, current.catalog_key),
    db
      .prepare(
        `UPDATE form_fields
         SET catalog_key = ?, updated_at = CURRENT_TIMESTAMP
         WHERE catalog_key = ?`
      )
      .bind(nextCatalogKey, current.catalog_key),
    db
      .prepare(
        `UPDATE form_template_fields
         SET catalog_key = ?, updated_at = CURRENT_TIMESTAMP
         WHERE catalog_key = ?`
      )
      .bind(nextCatalogKey, current.catalog_key)
  ]);

  return { ok: true, catalogKey: nextCatalogKey };
}

export async function updateCatalogStatus(db: D1Database, catalogKey: string, status: string) {
  const nextStatus = status === "active" ? "active" : "inactive";
  const result = await db
    .prepare("UPDATE system_catalogs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE catalog_key = ?")
    .bind(nextStatus, catalogKey)
    .run();

  if (result.meta.changes > 0) {
    await db
      .prepare("UPDATE form_control_definitions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE catalog_key = ?")
      .bind(nextStatus, catalogKey)
      .run();
  }

  return result.meta.changes > 0;
}

export async function listCatalogItems(db: D1Database, catalogKey: string) {
  return db
    .prepare(
      `SELECT i.id, i.catalog_id, i.parent_item_id, i.source_id, i.name, i.description, i.status
       FROM system_catalog_items i
       INNER JOIN system_catalogs c ON c.id = i.catalog_id
       WHERE c.catalog_key = ?
       ORDER BY ${catalogOrderSql()}
       LIMIT 500`
    )
    .bind(catalogKey)
    .all<CatalogItem>();
}

export async function createCatalogItem(db: D1Database, catalogKey: string, name: string, description?: string) {
  const catalog = await db
    .prepare("SELECT id FROM system_catalogs WHERE catalog_key = ?")
    .bind(catalogKey)
    .first<{ id: string }>();

  if (!catalog) {
    return null;
  }

  const itemId = `catitem_${catalogKey}_${crypto.randomUUID().slice(0, 12)}`;
  await db
    .prepare(
      `INSERT INTO system_catalog_items (id, catalog_id, name, description, status)
       VALUES (?, ?, ?, ?, 'active')`
    )
    .bind(itemId, catalog.id, name, description ?? name)
    .run();

  return itemId;
}

export async function updateCatalogItem(db: D1Database, itemId: string, input: {
  name: string;
  description?: string;
}) {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, message: "Ingrese el nombre del elemento." };
  }

  const item = await db
    .prepare("SELECT id, catalog_id FROM system_catalog_items WHERE id = ?")
    .bind(itemId)
    .first<{ id: string; catalog_id: string }>();
  if (!item) {
    return { ok: false, message: "Elemento no encontrado." };
  }

  const duplicate = await db
    .prepare(
      `SELECT id
       FROM system_catalog_items
       WHERE catalog_id = ? AND id <> ? AND UPPER(name) = UPPER(?)`
    )
    .bind(item.catalog_id, itemId, name)
    .first<{ id: string }>();
  if (duplicate) {
    return { ok: false, message: "Ya existe un elemento con ese nombre en este catalogo." };
  }

  await db
    .prepare(
      `UPDATE system_catalog_items
       SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(name, input.description?.trim() || name, itemId)
    .run();

  return { ok: true };
}

export async function updateCatalogItemStatus(db: D1Database, itemId: string, status: string) {
  const result = await db
    .prepare("UPDATE system_catalog_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, itemId)
    .run();

  return result.meta.changes > 0;
}

export async function listDepartments(db: D1Database) {
  return db
    .prepare(
      `SELECT iddepartamento AS id, name
       FROM location_departments
       WHERE status = 'active'
       ORDER BY name`
    )
    .all<LocationOption>();
}

export async function listProvincesByDepartment(db: D1Database, departmentId: string) {
  return db
    .prepare(
      `SELECT idprovincia AS id, name
       FROM location_provinces
       WHERE iddepartamento = ? AND status = 'active'
       ORDER BY name`
    )
    .bind(departmentId)
    .all<LocationOption>();
}

export async function listDistrictsByProvince(db: D1Database, provinceId: string) {
  return db
    .prepare(
      `SELECT iddistrito AS id, name
       FROM location_districts
       WHERE idprovincia = ? AND status = 'active'
       ORDER BY name`
    )
    .bind(provinceId)
    .all<LocationOption>();
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
