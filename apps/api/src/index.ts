import { Hono } from "hono";
import { cors } from "hono/cors";
import QRCode from "qrcode";
import { createSession, getSessionUser, requireAuth, revokeCurrentSession, verifyPassword } from "./auth";
import {
  closeEventSession,
  cloneForm,
  createCatalogItem,
  createEventWithSchedule,
  createParticipant,
  findParticipantByDocument,
  getAdminForm,
  getAttendanceReportData,
  getFormStructure,
  getOpenSessionForEvent,
  getPublicFormContextBySlug,
  getPublicFormStructure,
  getUserForLogin,
  hasAttendance,
  listAdminEvents,
  listAdminForms,
  listCatalogItems,
  listCatalogs,
  listDepartments,
  listDistrictsByProvince,
  listEventModules,
  listEventSessions,
  listProvincesByDepartment,
  isShortLinkAvailable,
  normalizePublicSlug,
  openEventSession,
  registerAttendance,
  updateCatalogItemStatus,
  updateEventDetails,
  updateEventSessionDetails,
  updateFormStatus,
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

app.get("/api/admin/forms/:formId", async (c) => {
  const formId = c.req.param("formId");
  const form = await getAdminForm(c.env.DB, formId, c.get("user"));

  if (!form) {
    return c.json({ ok: false, message: "Formulario no encontrado o no autorizado." }, 404);
  }

  const structure = await getFormStructure(c.env.DB, formId);
  return c.json({ ok: true, form, ...structure });
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

  await updateFormStatus(c.env.DB, formId, status);
  return c.json({ ok: true });
});

app.get("/api/admin/catalogs", async (c) => {
  const catalogs = await listCatalogs(c.env.DB);
  return c.json({ ok: true, catalogs: catalogs.results });
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
