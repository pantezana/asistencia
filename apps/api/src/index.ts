import { Hono } from "hono";
import { cors } from "hono/cors";
import { createSession, getSessionUser, requireAuth, revokeCurrentSession, verifyPassword } from "./auth";
import {
  closeEventSession,
  cloneForm,
  createCatalogItem,
  createParticipant,
  findParticipantByDocument,
  getActiveFormBySlug,
  getEventBySlug,
  getAdminForm,
  getFormStructure,
  getOpenSessionForEvent,
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
  openEventSession,
  registerAttendance,
  updateCatalogItemStatus,
  updateFormStatus,
  userCanManageEvent
} from "./db";
import type { AppContext } from "./types";

const app = new Hono<AppContext>();

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
  const event = await getEventBySlug(c.env.DB, slug);
  const form = await getActiveFormBySlug(c.env.DB, slug);

  if (!event || !form) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

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

app.post("/api/public/forms/:slug/identify", async (c) => {
  const slug = c.req.param("slug");
  const event = await getEventBySlug(c.env.DB, slug);
  const form = await getActiveFormBySlug(c.env.DB, slug);

  if (!event || !form) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

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
  const event = await getEventBySlug(c.env.DB, slug);
  const form = await getActiveFormBySlug(c.env.DB, slug);

  if (!event || !form) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

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
