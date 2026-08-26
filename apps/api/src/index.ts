import { Hono } from "hono";
import { cors } from "hono/cors";
import QRCode from "qrcode";
import { createSession, getSessionUser, requireAuth, revokeCurrentSession, verifyPassword } from "./auth";
import {
  associateEventForm,
  associateEventFormTemplate,
  addTemplateField,
  addTemplateSection,
  closeEventSession,
  cloneFormTemplate,
  cloneForm,
  createCatalogItem,
  createCatalogWithControl,
  createEventBoard,
  createEventQuestion,
  createEventWithSchedule,
  createParticipant,
  findParticipantByDocument,
  getAdminForm,
  getAttendanceReportData,
  getFormStructure,
  getFormTemplate,
  getFormTemplateStructure,
  getOpenSessionForEvent,
  getPublicFormContextBySlug,
  getPublicFormStructure,
  getPublicBoardByParticipantSlug,
  getPublicBoardByPresenterSlug,
  getPublicQuestionByParticipantSlug,
  getPublicQuestionByPresenterSlug,
  getQuestionSelectionGroups,
  getQuestionSummary,
  getUserForLogin,
  hasAttendance,
  listAdminEvents,
  listAdminForms,
  listCatalogItems,
  listCatalogs,
  listDepartments,
  listDistrictsByProvince,
  listEventModules,
  listEventBoards,
  listBoardNotes,
  listEventQuestions,
  listQuestionResponsesByParticipant,
  listQuestionSelectionsByParticipant,
  listEventSessions,
  listFormControlDefinitions,
  listFormSectionDefinitions,
  listFormTemplates,
  listProvincesByDepartment,
  moderateBoardNote,
  isShortLinkAvailable,
  normalizePublicSlug,
  openEventSession,
  participantHasEventAttendance,
  addQuestionSelection,
  registerAttendance,
  registerBoardNote,
  registerQuestionResponse,
  removeQuestionSelection,
  removeTemplateField,
  removeTemplateSection,
  updateCatalogItemStatus,
  updateCatalogItem,
  updateCatalogStatus,
  updateCatalogWithControl,
  updateEventDetails,
  updateEventBoard,
  updateEventBoardStatus,
  updateEventQuestion,
  updateEventQuestionParticipantCloud,
  updateEventQuestionStatus,
  updateEventSessionDetails,
  updateFormDetails,
  updateFormTemplateDetails,
  updateFormStatus,
  updateTemplateField,
  userCanManageEvent
} from "./db";
import type { AppContext } from "./types";

const app = new Hono<AppContext>();

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value: number) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function uint32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function zipStore(files: Array<{ name: string; content: string }>) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = textBytes(file.name);
    const content = textBytes(file.content);
    const crc = crc32(content);
    const local = concatBytes([
      uint32(0x04034b50), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0),
      uint32(crc), uint32(content.length), uint32(content.length), uint16(name.length), uint16(0), name, content
    ]);
    localParts.push(local);
    centralParts.push(concatBytes([
      uint32(0x02014b50), uint16(20), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0),
      uint32(crc), uint32(content.length), uint32(content.length), uint16(name.length), uint16(0), uint16(0),
      uint16(0), uint16(0), uint32(0), uint32(offset), name
    ]));
    offset += local.length;
  }

  const central = concatBytes(centralParts);
  return concatBytes([
    ...localParts,
    central,
    uint32(0x06054b50), uint16(0), uint16(0), uint16(files.length), uint16(files.length),
    uint32(central.length), uint32(offset), uint16(0)
  ]);
}

function makeXlsx(headers: string[], rows: unknown[][]) {
  function columnName(index: number) {
    let value = "";
    let current = index + 1;
    while (current > 0) {
      const remainder = (current - 1) % 26;
      value = String.fromCharCode(65 + remainder) + value;
      current = Math.floor((current - 1) / 26);
    }
    return value;
  }

  const worksheetRows = [headers, ...rows]
    .map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) =>
      `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`
    ).join("")}</row>`)
    .join("");
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${worksheetRows}</sheetData></worksheet>`;
  return zipStore([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Lista de asistencia" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
    { name: "xl/worksheets/sheet1.xml", content: sheet }
  ]);
}

async function getPublicContext(db: D1Database, slug: string) {
  const context = await getPublicFormContextBySlug(db, slug);
  if (!context) return null;

  return {
    event: {
      id: context.event_id,
      title: context.event_title,
      source_title: context.source_title,
      start_date: context.start_date,
      end_date: context.end_date,
      start_time: context.start_time,
      end_time: context.end_time,
      status: context.event_status,
      short_link_slug: context.event_short_link_slug
    },
    form: {
      id: context.form_id,
      event_id: context.event_id,
      name: context.form_name,
      status: context.form_status,
      short_link_slug: context.form_short_link_slug,
      form_template_id: context.form_template_id,
      welcome_title_template: context.welcome_title_template
    }
  };
}

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => c.env.CORS_ORIGIN || origin || "*",
    credentials: true
  })
);

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    app: "asistencia-api",
    env: c.env.APP_ENV,
    timestamp: new Date().toISOString()
  })
);

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json<{ login?: string; password?: string }>().catch(() => null);
  const login = body?.login?.trim();
  const password = body?.password;

  if (!login || !password) {
    return c.json({ ok: false, message: "Ingrese usuario y contraseña." }, 400);
  }

  const user = await getUserForLogin(c.env.DB, login);

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ ok: false, message: "Credenciales inválidas." }, 401);
  }

  await createSession(c, user.id);
  await c.env.DB.prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id).run();

  return c.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      status: user.status,
      roles: user.roles ? user.roles.split(",") : []
    }
  });
});

app.get("/api/auth/me", async (c) => {
  const user = await getSessionUser(c);

  if (!user) {
    return c.json({ ok: false, user: null }, 401);
  }

  return c.json({ ok: true, user });
});

app.post("/api/auth/logout", async (c) => {
  await revokeCurrentSession(c);
  return c.json({ ok: true });
});

app.get("/api/public/forms/:slug", async (c) => {
  const slug = c.req.param("slug");
  const context = await getPublicContext(c.env.DB, slug);

  if (!context) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

  const { event, form } = context;
  const openSession = await getOpenSessionForEvent(c.env.DB, event.id);
  const sessions = await listEventSessions(c.env.DB, event.id);
  const structure = await getPublicFormStructure(c.env.DB, form.id);

  if (!openSession) {
    return c.json({
      ok: true,
      event,
      form,
      ...structure,
      openSession: null,
      sessions: sessions.results,
      canRegister: false,
      message:
        "No se puede registrar asistencia en este momento. Comuníquese con el organizador del evento."
    });
  }

  return c.json({
    ok: true,
    event,
    form,
    ...structure,
    openSession,
    sessions: sessions.results,
    canRegister: true,
    welcomeTitle: `Bienvenido a ${event.title} - ${openSession.title}: ${openSession.theme}`
  });
});

app.get("/api/public/forms/:slug/qr", async (c) => {
  const slug = c.req.param("slug");
  const context = await getPublicContext(c.env.DB, slug);

  if (!context) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

  const url = new URL(c.req.url);
  const publicUrl = `${url.origin}/f/${slug}`;
  const svg = await QRCode.toString(publicUrl, {
    type: "svg",
    margin: 1,
    width: 320
  });

  return c.body(svg, 200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600"
  });
});

app.post("/api/public/forms/:slug/identify", async (c) => {
  const slug = c.req.param("slug");
  const context = await getPublicContext(c.env.DB, slug);

  if (!context) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

  const { event } = context;
  const openSession = await getOpenSessionForEvent(c.env.DB, event.id);

  if (!openSession) {
    return c.json({ ok: false, message: "No se puede registrar asistencia en este momento. Comuníquese con el organizador del evento." }, 409);
  }

  const body = await c.req.json<{ documentType?: string; documentNumber?: string }>().catch(() => null);
  const documentType = body?.documentType?.trim();
  const documentNumber = body?.documentNumber?.trim();

  if (!documentType || !documentNumber) {
    return c.json({ ok: false, message: "Ingrese tipo y número de documento." }, 400);
  }

  const participant = await findParticipantByDocument(c.env.DB, documentType, documentNumber);
  const alreadyRegistered = participant ? await hasAttendance(c.env.DB, openSession.id, participant.id) : false;

  return c.json({ ok: true, exists: Boolean(participant), participant, alreadyRegistered });
});

app.post("/api/public/forms/:slug/attendance", async (c) => {
  const slug = c.req.param("slug");
  const context = await getPublicContext(c.env.DB, slug);

  if (!context) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

  const { event, form } = context;
  const openSession = await getOpenSessionForEvent(c.env.DB, event.id);

  if (!openSession) {
    return c.json({ ok: false, message: "No se puede registrar asistencia en este momento. Comuníquese con el organizador del evento." }, 409);
  }

  const body = await c.req.json<{
    documentType?: string;
    documentNumber?: string;
    participantId?: string;
    fields?: Record<string, string>;
  }>().catch(() => null);
  const documentType = body?.documentType?.trim();
  const documentNumber = body?.documentNumber?.trim();

  if (!documentType || !documentNumber) {
    return c.json({ ok: false, message: "Ingrese tipo y número de documento." }, 400);
  }

  let participant = await findParticipantByDocument(c.env.DB, documentType, documentNumber);
  let participantId = participant?.id;

  if (!participantId) {
    const fields = body?.fields ?? {};
    const firstName = fields.datos_generales_nombres?.trim();

    if (!firstName) {
      return c.json({ ok: false, message: "Ingrese los nombres del participante." }, 400);
    }

    participantId = await createParticipant(c.env.DB, {
      documentType,
      documentNumber,
      firstName,
      paternalLastName: fields.datos_generales_paterno?.trim(),
      maternalLastName: fields.datos_generales_materno?.trim(),
      email: fields.datos_generales_correo_electronico?.trim(),
      phone: fields.datos_generales_celular?.trim(),
      profileData: fields
    });
  }

  if (await hasAttendance(c.env.DB, openSession.id, participantId)) {
    return c.json({ ok: true, alreadyRegistered: true, message: "Su asistencia ya fue registrada para esta sesión." });
  }

  await registerAttendance(c.env.DB, openSession, participantId, form.id);
  return c.json({ ok: true, alreadyRegistered: false, message: "Asistencia registrada correctamente." });
});

app.get("/api/public/location/departments", async (c) => {
  const departments = await listDepartments(c.env.DB);
  return c.json({ ok: true, departments: departments.results });
});

app.get("/api/public/location/provinces", async (c) => {
  const departmentId = c.req.query("departmentId");

  if (!departmentId) {
    return c.json({ ok: false, message: "Seleccione departamento." }, 400);
  }

  const provinces = await listProvincesByDepartment(c.env.DB, departmentId);
  return c.json({ ok: true, provinces: provinces.results });
});

app.get("/api/public/location/districts", async (c) => {
  const provinceId = c.req.query("provinceId");

  if (!provinceId) {
    return c.json({ ok: false, message: "Seleccione provincia." }, 400);
  }

  const districts = await listDistrictsByProvince(c.env.DB, provinceId);
  return c.json({ ok: true, districts: districts.results });
});

app.get("/api/public/catalogs/:catalogKey/items", async (c) => {
  const items = await listCatalogItems(c.env.DB, c.req.param("catalogKey"));
  return c.json({ ok: true, items: items.results.filter((item) => item.status === "active") });
});

app.get("/api/public/questions/:slug", async (c) => {
  const question = await getPublicQuestionByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);

  return c.json({ ok: true, question });
});

app.post("/api/public/questions/:slug/identify", async (c) => {
  const question = await getPublicQuestionByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);

  const body = await c.req.json<{ documentType?: string; documentNumber?: string }>().catch(() => null);
  const documentType = body?.documentType?.trim();
  const documentNumber = body?.documentNumber?.trim();
  if (!documentType || !documentNumber) return c.json({ ok: false, message: "Ingrese tipo y numero de documento." }, 400);

  const participant = await findParticipantByDocument(c.env.DB, documentType, documentNumber);
  const canParticipate = participant ? await participantHasEventAttendance(c.env.DB, question.event_id, participant.id) : false;
  const responses = canParticipate && participant
    ? await listQuestionResponsesByParticipant(c.env.DB, question.id, participant.id)
    : null;
  const selections = canParticipate && participant
    ? await listQuestionSelectionsByParticipant(c.env.DB, question.id, participant.id)
    : null;

  return c.json({
    ok: true,
    canParticipate,
    participant: canParticipate ? participant : null,
    responses: responses?.results ?? [],
    selections: selections?.results ?? [],
    attendanceUrl: `/f/${question.event_slug}`
  });
});

app.get("/api/public/questions/:slug/summary", async (c) => {
  const question = await getPublicQuestionByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);
  const summary = question.show_participant_cloud ? await getQuestionSummary(c.env.DB, question.id) : null;
  return c.json({ ok: true, question, summary: summary?.results ?? [] });
});

app.post("/api/public/questions/:slug/selections", async (c) => {
  const question = await getPublicQuestionByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);

  const body = await c.req.json<{
    documentType?: string;
    documentNumber?: string;
    normalizedAnswer?: string;
    displayAnswer?: string;
  }>().catch(() => null);
  const documentType = body?.documentType?.trim();
  const documentNumber = body?.documentNumber?.trim();
  if (!documentType || !documentNumber) return c.json({ ok: false, message: "Identifique su documento." }, 400);

  const participant = await findParticipantByDocument(c.env.DB, documentType, documentNumber);
  if (!participant || !(await participantHasEventAttendance(c.env.DB, question.event_id, participant.id))) {
    return c.json({ ok: false, message: "Para seleccionar conceptos primero debe registrar asistencia en el evento.", attendanceUrl: `/f/${question.event_slug}` }, 403);
  }

  const result = await addQuestionSelection(c.env.DB, question, participant, {
    normalizedAnswer: body?.normalizedAnswer,
    displayAnswer: body?.displayAnswer
  });
  return c.json(result, result.ok ? 201 : 400);
});

app.delete("/api/public/questions/:slug/selections/:selectionId", async (c) => {
  const question = await getPublicQuestionByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);

  const body = await c.req.json<{ documentType?: string; documentNumber?: string }>().catch(() => null);
  const documentType = body?.documentType?.trim();
  const documentNumber = body?.documentNumber?.trim();
  if (!documentType || !documentNumber) return c.json({ ok: false, message: "Identifique su documento." }, 400);

  const participant = await findParticipantByDocument(c.env.DB, documentType, documentNumber);
  if (!participant || !(await participantHasEventAttendance(c.env.DB, question.event_id, participant.id))) {
    return c.json({ ok: false, message: "Para quitar conceptos primero debe registrar asistencia en el evento.", attendanceUrl: `/f/${question.event_slug}` }, 403);
  }

  const ok = await removeQuestionSelection(c.env.DB, question, participant, c.req.param("selectionId"));
  if (!ok) return c.json({ ok: false, message: "Seleccion no encontrada." }, 404);
  return c.json({ ok: true });
});

app.post("/api/public/questions/:slug/responses", async (c) => {
  const question = await getPublicQuestionByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);

  const body = await c.req.json<{ documentType?: string; documentNumber?: string; answer?: string }>().catch(() => null);
  const documentType = body?.documentType?.trim();
  const documentNumber = body?.documentNumber?.trim();
  if (!documentType || !documentNumber) return c.json({ ok: false, message: "Identifique su documento." }, 400);

  const participant = await findParticipantByDocument(c.env.DB, documentType, documentNumber);
  if (!participant || !(await participantHasEventAttendance(c.env.DB, question.event_id, participant.id))) {
    return c.json({ ok: false, message: "Para responder primero debe registrar asistencia en el evento.", attendanceUrl: `/f/${question.event_slug}` }, 403);
  }

  const result = await registerQuestionResponse(c.env.DB, question, participant, body?.answer ?? "");
  return c.json(result, result.ok ? 201 : 400);
});

app.get("/api/public/question-presenter/:slug", async (c) => {
  const question = await getPublicQuestionByPresenterSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);
  const summary = await getQuestionSummary(c.env.DB, question.id);
  const selectionGroups = question.show_participant_cloud ? await getQuestionSelectionGroups(c.env.DB, question.id) : null;
  return c.json({ ok: true, question, summary: summary.results, selectionGroups: selectionGroups?.results ?? [] });
});

app.get("/api/public/question-presenter/:slug/summary", async (c) => {
  const question = await getPublicQuestionByPresenterSlug(c.env.DB, c.req.param("slug"));
  if (!question) return c.json({ ok: false, message: "Pregunta no disponible." }, 404);
  const summary = await getQuestionSummary(c.env.DB, question.id);
  const selectionGroups = question.show_participant_cloud ? await getQuestionSelectionGroups(c.env.DB, question.id) : null;
  return c.json({ ok: true, question, summary: summary.results, selectionGroups: selectionGroups?.results ?? [] });
});

app.get("/api/public/boards/:slug", async (c) => {
  const board = await getPublicBoardByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!board || board.status === "archived" || board.status === "draft") {
    return c.json({ ok: false, message: "Pizarra no disponible." }, 404);
  }
  return c.json({ ok: true, board });
});

app.post("/api/public/boards/:slug/notes", async (c) => {
  const board = await getPublicBoardByParticipantSlug(c.env.DB, c.req.param("slug"));
  if (!board || board.status === "archived" || board.status === "draft") {
    return c.json({ ok: false, message: "Pizarra no disponible." }, 404);
  }
  const body = await c.req.json<{
    firstName?: string;
    lastName?: string;
    countryId?: string | null;
    countryName?: string;
    countryIso2?: string | null;
    noteHtml?: string;
  }>().catch(() => null);
  const result = await registerBoardNote(c.env.DB, board, {
    firstName: body?.firstName,
    lastName: body?.lastName,
    countryId: body?.countryId,
    countryName: body?.countryName,
    countryIso2: body?.countryIso2,
    noteHtml: body?.noteHtml,
    userAgent: c.req.header("user-agent") ?? ""
  });
  return c.json(result, result.ok ? 201 : 400);
});

app.get("/api/public/board-presenter/:slug", async (c) => {
  const board = await getPublicBoardByPresenterSlug(c.env.DB, c.req.param("slug"));
  if (!board || board.status === "archived") return c.json({ ok: false, message: "Pizarra no disponible." }, 404);
  const page = Number(c.req.query("page") ?? "1");
  const pageSize = Number(c.req.query("pageSize") ?? "48");
  const notes = await listBoardNotes(c.env.DB, board.id, page, pageSize);
  return c.json({ ok: true, board, ...notes });
});

app.get("/api/public/board-presenter/:slug/notes", async (c) => {
  const board = await getPublicBoardByPresenterSlug(c.env.DB, c.req.param("slug"));
  if (!board || board.status === "archived") return c.json({ ok: false, message: "Pizarra no disponible." }, 404);
  const page = Number(c.req.query("page") ?? "1");
  const pageSize = Number(c.req.query("pageSize") ?? "48");
  const notes = await listBoardNotes(c.env.DB, board.id, page, pageSize);
  return c.json({ ok: true, board, ...notes });
});

app.delete("/api/public/board-presenter/:slug/notes/:noteId", async (c) => {
  const result = await moderateBoardNote(c.env.DB, c.req.param("slug"), c.req.param("noteId"));
  return c.json(result, result.ok ? 200 : 404);
});

app.use("/api/admin/*", requireAuth());

app.get("/api/admin/me", (c) => {
  return c.json({ ok: true, user: c.get("user") });
});

app.get("/api/admin/events", async (c) => {
  const events = await listAdminEvents(c.env.DB, c.get("user"));

  return c.json({
    ok: true,
    events: events.results
  });
});

app.post("/api/admin/events", async (c) => {
  const body = await c.req.json<{
    title?: string;
    shortLinkSlug?: string;
    theme?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    sessions?: Array<{
      moduleTitle?: string;
      title?: string;
      theme?: string;
      sessionDate?: string;
      startTime?: string;
      endTime?: string;
    }>;
  }>().catch(() => null);

  if (!body?.title?.trim()) {
    return c.json({ ok: false, message: "Ingrese el título del evento." }, 400);
  }

  const shortLinkSlug = normalizePublicSlug(body.shortLinkSlug ?? "");
  if (!shortLinkSlug) {
    return c.json({ ok: false, message: "Ingrese el enlace corto del evento." }, 400);
  }

  if (!(await isShortLinkAvailable(c.env.DB, shortLinkSlug))) {
    return c.json({ ok: false, message: "El enlace corto ya existe. Ingrese uno diferente." }, 409);
  }

  const sessions = (body.sessions ?? []).filter((session) =>
    session.sessionDate?.trim() && session.startTime?.trim() && session.endTime?.trim()
  );

  if (sessions.length === 0) {
    return c.json({ ok: false, message: "Ingrese al menos una sesión del cronograma." }, 400);
  }

  const result = await createEventWithSchedule(c.env.DB, c.get("user"), {
    title: body.title.trim(),
    shortLinkSlug,
    theme: body.theme?.trim(),
    startDate: body.startDate || sessions[0].sessionDate || "",
    endDate: body.endDate || sessions[sessions.length - 1].sessionDate || "",
    startTime: body.startTime || sessions[0].startTime || "",
    endTime: body.endTime || sessions[0].endTime || "",
    sessions: sessions.map((session, index) => ({
      moduleTitle: session.moduleTitle?.trim() || "Módulo general",
      title: session.title?.trim() || `Sesión ${index + 1}`,
      theme: session.theme?.trim() || session.title?.trim() || `Sesión ${index + 1}`,
      sessionDate: session.sessionDate || "",
      startTime: session.startTime || "",
      endTime: session.endTime || ""
    }))
  });

  const url = new URL(c.req.url);
  return c.json({
    ok: true,
    ...result,
    publicUrl: `${url.origin}/f/${result.slug}`,
    qrUrl: `${url.origin}/api/public/forms/${result.slug}/qr`
  });
});

app.get("/api/admin/events/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const [modules, sessions] = await Promise.all([
    listEventModules(c.env.DB, eventId),
    listEventSessions(c.env.DB, eventId)
  ]);

  return c.json({
    ok: true,
    modules: modules.results,
    sessions: sessions.results
  });
});

app.put("/api/admin/events/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const body = await c.req.json<{
    title?: string;
    shortLinkSlug?: string;
    theme?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }>().catch(() => null);

  if (!body?.title?.trim()) {
    return c.json({ ok: false, message: "Ingrese el titulo del evento." }, 400);
  }

  const shortLinkSlug = normalizePublicSlug(body.shortLinkSlug ?? "");
  if (!shortLinkSlug) {
    return c.json({ ok: false, message: "Ingrese el enlace corto del evento." }, 400);
  }

  if (!(await isShortLinkAvailable(c.env.DB, shortLinkSlug, eventId))) {
    return c.json({ ok: false, message: "El enlace corto ya existe. Ingrese uno diferente." }, 409);
  }

  if (!body.startDate || !body.endDate || !body.startTime || !body.endTime) {
    return c.json({ ok: false, message: "Complete fecha y horario del evento." }, 400);
  }

  const status = body.status && ["draft", "active", "inactive"].includes(body.status) ? body.status : "draft";
  const updated = await updateEventDetails(c.env.DB, eventId, {
    title: body.title.trim(),
    shortLinkSlug,
    theme: body.theme?.trim(),
    startDate: body.startDate,
    endDate: body.endDate,
    startTime: body.startTime,
    endTime: body.endTime,
    status
  });

  return c.json({ ok: updated });
});

app.put("/api/admin/events/:eventId/form-association", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const body = await c.req.json<{ formId?: string }>().catch(() => null);
  const formId = body?.formId?.trim();

  if (!formId) {
    return c.json({ ok: false, message: "Seleccione un formulario activo." }, 400);
  }

  const form = await associateEventForm(c.env.DB, eventId, formId, c.get("user"));

  if (!form) {
    return c.json({ ok: false, message: "No se pudo asociar el formulario seleccionado." }, 400);
  }

  return c.json({ ok: true, form });
});

app.put("/api/admin/events/:eventId/form-template", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const body = await c.req.json<{ templateId?: string }>().catch(() => null);
  const templateId = body?.templateId?.trim();

  if (!templateId) {
    return c.json({ ok: false, message: "Seleccione un modelo de formulario activo." }, 400);
  }

  const form = await associateEventFormTemplate(c.env.DB, eventId, templateId);

  if (!form) {
    return c.json({ ok: false, message: "No se pudo publicar el modelo de formulario seleccionado." }, 400);
  }

  return c.json({ ok: true, form });
});

app.get("/api/admin/events/:eventId/sessions", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const sessions = await listEventSessions(c.env.DB, eventId);

  return c.json({
    ok: true,
    sessions: sessions.results
  });
});

app.get("/api/admin/events/:eventId/questions", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const questions = await listEventQuestions(c.env.DB, eventId);
  return c.json({ ok: true, questions: questions.results });
});

app.post("/api/admin/events/:eventId/questions", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{
    questionText?: string;
    description?: string;
    sessionId?: string | null;
    allowMultipleResponses?: boolean;
    maxResponsesPerParticipant?: number | null;
    maxAnswerLength?: number;
    maxSelectableConcepts?: number;
    participantSlug?: string;
  }>().catch(() => null);

  const result = await createEventQuestion(c.env.DB, eventId, c.get("user"), {
    questionText: body?.questionText ?? "",
    description: body?.description,
    sessionId: body?.sessionId || null,
    allowMultipleResponses: body?.allowMultipleResponses,
    maxResponsesPerParticipant: body?.maxResponsesPerParticipant ?? null,
    maxAnswerLength: body?.maxAnswerLength,
    maxSelectableConcepts: body?.maxSelectableConcepts,
    participantSlug: body?.participantSlug
  });

  return c.json(result, result.ok ? 201 : 400);
});

app.put("/api/admin/events/:eventId/questions/:questionId", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{
    questionText?: string;
    description?: string;
    sessionId?: string | null;
    status?: string;
    allowMultipleResponses?: boolean;
    maxResponsesPerParticipant?: number | null;
    maxAnswerLength?: number;
    maxSelectableConcepts?: number;
    participantSlug?: string;
  }>().catch(() => null);

  const result = await updateEventQuestion(c.env.DB, eventId, c.req.param("questionId"), {
    questionText: body?.questionText ?? "",
    description: body?.description,
    sessionId: body?.sessionId || null,
    status: body?.status,
    allowMultipleResponses: body?.allowMultipleResponses,
    maxResponsesPerParticipant: body?.maxResponsesPerParticipant ?? null,
    maxAnswerLength: body?.maxAnswerLength,
    maxSelectableConcepts: body?.maxSelectableConcepts,
    participantSlug: body?.participantSlug
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/events/:eventId/questions/:questionId/status", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{ status?: string }>().catch(() => null);
  const ok = await updateEventQuestionStatus(c.env.DB, eventId, c.req.param("questionId"), body?.status ?? "draft");
  if (!ok) return c.json({ ok: false, message: "Pregunta no encontrada." }, 404);
  return c.json({ ok: true });
});

app.post("/api/admin/events/:eventId/questions/:questionId/participant-cloud", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{ show?: boolean }>().catch(() => null);
  const ok = await updateEventQuestionParticipantCloud(c.env.DB, eventId, c.req.param("questionId"), Boolean(body?.show));
  if (!ok) return c.json({ ok: false, message: "Pregunta no encontrada." }, 404);
  return c.json({ ok: true });
});

app.get("/api/admin/events/:eventId/boards", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const boards = await listEventBoards(c.env.DB, eventId);
  return c.json({ ok: true, boards: boards.results });
});

app.post("/api/admin/events/:eventId/boards", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{
    title?: string;
    sessionId?: string | null;
    participantSlug?: string;
    maxNoteLength?: number;
    allowMultipleNotes?: boolean;
    maxNotesPerParticipant?: number | null;
    instructions?: Array<{ languageLabel?: string | null; contentHtml?: string; sortOrder?: number }>;
  }>().catch(() => null);

  const result = await createEventBoard(c.env.DB, eventId, c.get("user"), {
    title: body?.title ?? "",
    sessionId: body?.sessionId || null,
    participantSlug: body?.participantSlug,
    maxNoteLength: body?.maxNoteLength,
    allowMultipleNotes: body?.allowMultipleNotes,
    maxNotesPerParticipant: body?.maxNotesPerParticipant ?? null,
    instructions: body?.instructions
  });
  return c.json(result, result.ok ? 201 : 400);
});

app.put("/api/admin/events/:eventId/boards/:boardId", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{
    title?: string;
    sessionId?: string | null;
    participantSlug?: string;
    maxNoteLength?: number;
    allowMultipleNotes?: boolean;
    maxNotesPerParticipant?: number | null;
    instructions?: Array<{ languageLabel?: string | null; contentHtml?: string; sortOrder?: number }>;
  }>().catch(() => null);

  const result = await updateEventBoard(c.env.DB, eventId, c.req.param("boardId"), {
    title: body?.title ?? "",
    sessionId: body?.sessionId || null,
    participantSlug: body?.participantSlug,
    maxNoteLength: body?.maxNoteLength,
    allowMultipleNotes: body?.allowMultipleNotes,
    maxNotesPerParticipant: body?.maxNotesPerParticipant ?? null,
    instructions: body?.instructions
  });
  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/events/:eventId/boards/:boardId/status", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));
  if (!canManage) return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);

  const body = await c.req.json<{ status?: string }>().catch(() => null);
  const ok = await updateEventBoardStatus(c.env.DB, eventId, c.req.param("boardId"), body?.status ?? "draft");
  if (!ok) return c.json({ ok: false, message: "Pizarra no encontrada." }, 404);
  return c.json({ ok: true });
});

app.get("/api/admin/events/:eventId/attendance.xlsx", async (c) => {
  const eventId = c.req.param("eventId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const report = await getAttendanceReportData(c.env.DB, eventId);
  if (!report.event) {
    return c.json({ ok: false, message: "Evento no encontrado." }, 404);
  }

  const baseHeaders = [
    "Evento",
    "Modulo",
    "Sesion",
    "Tema sesion",
    "Fecha sesion",
    "Hora inicio",
    "Hora fin",
    "Fecha registro",
    "Estado asistencia"
  ];
  const headers = [...baseHeaders, ...report.fields.map((field) => field.label)];
  const rows = report.rows.map((row) => {
    const profile = JSON.parse(row.profile_data || "{}") as Record<string, unknown>;
    return [
      report.event?.title,
      row.module_title,
      row.session_title || row.session_sequence,
      row.session_theme,
      row.session_date,
      row.start_time,
      row.end_time,
      row.registered_at,
      row.attendance_status,
      ...report.fields.map((field) => profile[field.field_key] ?? "")
    ];
  });
  const xlsx = makeXlsx(headers, rows);
  const fileName = `${normalizePublicSlug(report.event.short_link_slug || report.event.title)}-lista-asistencia.xlsx`;

  return new Response(xlsx, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store"
    }
  });
});

app.put("/api/admin/events/:eventId/sessions/:sessionId", async (c) => {
  const eventId = c.req.param("eventId");
  const sessionId = c.req.param("sessionId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const body = await c.req.json<{
    moduleTitle?: string;
    title?: string;
    theme?: string;
    sessionDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }>().catch(() => null);

  if (!body?.title?.trim()) {
    return c.json({ ok: false, message: "Ingrese el titulo de la sesion." }, 400);
  }

  if (!body.sessionDate || !body.startTime || !body.endTime) {
    return c.json({ ok: false, message: "Complete fecha y horario de la sesion." }, 400);
  }

  const result = await updateEventSessionDetails(c.env.DB, eventId, sessionId, {
    moduleTitle: body.moduleTitle?.trim() || "Modulo general",
    title: body.title.trim(),
    theme: body.theme?.trim() || body.title.trim(),
    sessionDate: body.sessionDate,
    startTime: body.startTime,
    endTime: body.endTime,
    status: body.status === "open" ? "open" : "closed"
  });

  return c.json(result, result.ok ? 200 : 404);
});

app.get("/api/admin/forms", async (c) => {
  const forms = await listAdminForms(c.env.DB, c.get("user"));
  return c.json({ ok: true, forms: forms.results });
});

app.get("/api/admin/form-templates", async (c) => {
  const templates = await listFormTemplates(c.env.DB);
  return c.json({ ok: true, templates: templates.results });
});

app.get("/api/admin/form-templates/:templateId", async (c) => {
  const templateId = c.req.param("templateId");
  const template = await getFormTemplate(c.env.DB, templateId);

  if (!template) {
    return c.json({ ok: false, message: "Modelo de formulario no encontrado." }, 404);
  }

  const structure = await getFormTemplateStructure(c.env.DB, templateId);
  return c.json({ ok: true, template, ...structure });
});

app.get("/api/admin/form-builder/palette", async (c) => {
  const [sections, controls] = await Promise.all([
    listFormSectionDefinitions(c.env.DB),
    listFormControlDefinitions(c.env.DB)
  ]);

  return c.json({ ok: true, sections: sections.results, controls: controls.results });
});

app.post("/api/admin/form-templates/:templateId/sections", async (c) => {
  const templateId = c.req.param("templateId");
  const body = await c.req.json<{
    sectionDefinitionId?: string;
    title?: string;
    position?: string;
    targetSectionId?: string | null;
  }>().catch(() => null);

  if (!body?.sectionDefinitionId) {
    return c.json({ ok: false, message: "Seleccione una seccion de la paleta." }, 400);
  }

  const result = await addTemplateSection(c.env.DB, templateId, {
    sectionDefinitionId: body.sectionDefinitionId,
    title: body.title,
    position: body.position,
    targetSectionId: body.targetSectionId
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.delete("/api/admin/form-templates/:templateId/sections/:sectionId", async (c) => {
  const result = await removeTemplateSection(c.env.DB, c.req.param("templateId"), c.req.param("sectionId"));
  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/form-templates/:templateId/fields", async (c) => {
  const templateId = c.req.param("templateId");
  const body = await c.req.json<{
    sectionId?: string;
    controlDefinitionId?: string;
    label?: string;
    isRequired?: boolean;
    textValidation?: string;
    position?: string;
    targetFieldId?: string | null;
  }>().catch(() => null);

  if (!body?.sectionId || !body.controlDefinitionId) {
    return c.json({ ok: false, message: "Seleccione seccion y control." }, 400);
  }

  const result = await addTemplateField(c.env.DB, templateId, {
    sectionId: body.sectionId,
    controlDefinitionId: body.controlDefinitionId,
    label: body.label,
    isRequired: body.isRequired,
    textValidation: body.textValidation,
    position: body.position,
    targetFieldId: body.targetFieldId
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.delete("/api/admin/form-templates/:templateId/fields/:fieldId", async (c) => {
  const result = await removeTemplateField(c.env.DB, c.req.param("templateId"), c.req.param("fieldId"));
  return c.json(result, result.ok ? 200 : 400);
});

app.put("/api/admin/form-templates/:templateId/fields/:fieldId", async (c) => {
  const templateId = c.req.param("templateId");
  const fieldId = c.req.param("fieldId");
  const body = await c.req.json<{
    sectionId?: string;
    label?: string;
    isRequired?: boolean;
    textValidation?: string;
    position?: string;
    targetFieldId?: string | null;
  }>().catch(() => null);

  if (!body?.sectionId) {
    return c.json({ ok: false, message: "Seleccione una seccion valida." }, 400);
  }

  const result = await updateTemplateField(c.env.DB, templateId, fieldId, {
    sectionId: body.sectionId,
    label: body.label,
    isRequired: body.isRequired,
    textValidation: body.textValidation,
    position: body.position,
    targetFieldId: body.targetFieldId
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.put("/api/admin/form-templates/:templateId", async (c) => {
  const templateId = c.req.param("templateId");
  const body = await c.req.json<{ name?: string; description?: string; status?: string }>().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return c.json({ ok: false, message: "Ingrese el nombre del modelo." }, 400);
  }

  const result = await updateFormTemplateDetails(c.env.DB, templateId, {
    name,
    description: body?.description,
    status: body?.status ?? "active"
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/form-templates/:templateId/clone", async (c) => {
  const templateId = c.req.param("templateId");
  const template = await cloneFormTemplate(c.env.DB, templateId);

  if (!template) {
    return c.json({ ok: false, message: "Modelo de formulario no encontrado." }, 404);
  }

  return c.json({ ok: true, template });
});

app.get("/api/admin/forms/:formId", async (c) => {
  const formId = c.req.param("formId");
  const form = await getAdminForm(c.env.DB, formId, c.get("user"));

  if (!form) {
    return c.json({ ok: false, message: "Formulario no encontrado o no autorizado." }, 404);
  }

  const structure = await getFormStructure(c.env.DB, formId);
  return c.json({ ok: true, form, ...structure });
});

app.put("/api/admin/forms/:formId", async (c) => {
  const formId = c.req.param("formId");
  const body = await c.req.json<{ name?: string; status?: string }>().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return c.json({ ok: false, message: "Ingrese el nombre del formulario." }, 400);
  }

  const result = await updateFormDetails(c.env.DB, formId, {
    name,
    status: body?.status ?? "active"
  }, c.get("user"));

  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/forms/:formId/clone", async (c) => {
  const formId = c.req.param("formId");
  const form = await cloneForm(c.env.DB, formId, c.get("user"));

  if (!form) {
    return c.json({ ok: false, message: "Formulario no encontrado o no autorizado." }, 404);
  }

  return c.json({ ok: true, form });
});

app.post("/api/admin/forms/:formId/status", async (c) => {
  const formId = c.req.param("formId");
  const body = await c.req.json<{ status?: string }>().catch(() => null);
  const status = body?.status;

  if (!status || !["draft", "active", "inactive"].includes(status)) {
    return c.json({ ok: false, message: "Estado inválido." }, 400);
  }

  const form = await getAdminForm(c.env.DB, formId, c.get("user"));

  if (!form) {
    return c.json({ ok: false, message: "Formulario no encontrado o no autorizado." }, 404);
  }

  if (form.is_event_publication && status !== "active") {
    return c.json({ ok: false, message: "No se puede inactivar un formulario asociado al enlace publico del evento." }, 400);
  }

  await updateFormStatus(c.env.DB, formId, status);
  return c.json({ ok: true });
});

app.get("/api/admin/catalogs", async (c) => {
  const catalogs = await listCatalogs(c.env.DB);
  return c.json({ ok: true, catalogs: catalogs.results });
});

app.post("/api/admin/catalogs", async (c) => {
  const body = await c.req.json<{
    catalogKey?: string;
    catalogName?: string;
    controlLabel?: string;
    description?: string;
  }>().catch(() => null);

  const result = await createCatalogWithControl(c.env.DB, {
    catalogKey: body?.catalogKey ?? "",
    catalogName: body?.catalogName ?? "",
    controlLabel: body?.controlLabel ?? "",
    description: body?.description
  });

  return c.json(result, result.ok ? 201 : 400);
});

app.put("/api/admin/catalogs/:catalogKey", async (c) => {
  const body = await c.req.json<{
    catalogKey?: string;
    catalogName?: string;
    controlLabel?: string;
    description?: string;
  }>().catch(() => null);

  const result = await updateCatalogWithControl(c.env.DB, c.req.param("catalogKey"), {
    nextCatalogKey: body?.catalogKey ?? "",
    catalogName: body?.catalogName ?? "",
    controlLabel: body?.controlLabel ?? "",
    description: body?.description
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/catalogs/:catalogKey/status", async (c) => {
  const body = await c.req.json<{ status?: string }>().catch(() => null);
  const status = body?.status === "active" ? "active" : "inactive";
  const ok = await updateCatalogStatus(c.env.DB, c.req.param("catalogKey"), status);

  if (!ok) {
    return c.json({ ok: false, message: "Catalogo no encontrado." }, 404);
  }

  return c.json({ ok: true });
});

app.get("/api/admin/catalogs/:catalogKey/items", async (c) => {
  const items = await listCatalogItems(c.env.DB, c.req.param("catalogKey"));
  return c.json({ ok: true, items: items.results });
});

app.post("/api/admin/catalogs/:catalogKey/items", async (c) => {
  const body = await c.req.json<{ name?: string; description?: string }>().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return c.json({ ok: false, message: "Ingrese el nombre del elemento." }, 400);
  }

  const itemId = await createCatalogItem(c.env.DB, c.req.param("catalogKey"), name, body?.description?.trim());

  if (!itemId) {
    return c.json({ ok: false, message: "Catálogo no encontrado." }, 404);
  }

  return c.json({ ok: true, itemId });
});

app.post("/api/admin/catalog-items/:itemId/status", async (c) => {
  const body = await c.req.json<{ status?: string }>().catch(() => null);
  const status = body?.status;

  if (!status || !["active", "inactive"].includes(status)) {
    return c.json({ ok: false, message: "Estado inválido." }, 400);
  }

  const changed = await updateCatalogItemStatus(c.env.DB, c.req.param("itemId"), status);

  if (!changed) {
    return c.json({ ok: false, message: "Elemento no encontrado." }, 404);
  }

  return c.json({ ok: true });
});

app.put("/api/admin/catalog-items/:itemId", async (c) => {
  const body = await c.req.json<{ name?: string; description?: string }>().catch(() => null);
  const result = await updateCatalogItem(c.env.DB, c.req.param("itemId"), {
    name: body?.name ?? "",
    description: body?.description
  });

  return c.json(result, result.ok ? 200 : 400);
});

app.post("/api/admin/events/:eventId/sessions/:sessionId/open", async (c) => {
  const eventId = c.req.param("eventId");
  const sessionId = c.req.param("sessionId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const result = await openEventSession(c.env.DB, eventId, sessionId);

  if (!result.ok) {
    return c.json(result, 404);
  }

  return c.json({ ok: true });
});

app.post("/api/admin/events/:eventId/sessions/:sessionId/close", async (c) => {
  const eventId = c.req.param("eventId");
  const sessionId = c.req.param("sessionId");
  const canManage = await userCanManageEvent(c.env.DB, eventId, c.get("user"));

  if (!canManage) {
    return c.json({ ok: false, message: "Evento no encontrado o no autorizado." }, 404);
  }

  const changed = await closeEventSession(c.env.DB, eventId, sessionId);

  if (!changed) {
    return c.json({ ok: false, message: "Sesión no encontrada." }, 404);
  }

  return c.json({ ok: true });
});

app.onError((error, c) => {
  console.error(error);

  return c.json(
    {
      ok: false,
      message: "Error interno del servidor.",
      detail: c.env.APP_ENV === "development" ? error.message : undefined
    },
    500
  );
});

app.notFound((c) => {
  const url = new URL(c.req.url);

  if (!url.pathname.startsWith("/api/")) {
    return c.env.ASSETS.fetch(c.req.raw);
  }

  return c.json({ ok: false, message: "Ruta no encontrada." }, 404);
});

export default app;
