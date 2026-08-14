import { Hono } from "hono";
import { cors } from "hono/cors";
import { getEventBySlug, getOpenSessionForEvent, listEventSessions } from "./db";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

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

app.get("/api/public/forms/:slug", async (c) => {
  const slug = c.req.param("slug");
  const event = await getEventBySlug(c.env.DB, slug);

  if (!event) {
    return c.json({ ok: false, message: "Formulario no encontrado." }, 404);
  }

  const openSession = await getOpenSessionForEvent(c.env.DB, event.id);
  const sessions = await listEventSessions(c.env.DB, event.id);

  if (!openSession) {
    return c.json({
      ok: true,
      event,
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
    openSession,
    sessions: sessions.results,
    canRegister: true,
    welcomeTitle: `Bienvenido a ${event.title} - ${openSession.title}: ${openSession.theme}`
  });
});

app.get("/api/admin/events/:eventId/sessions", async (c) => {
  const eventId = c.req.param("eventId");
  const sessions = await listEventSessions(c.env.DB, eventId);

  return c.json({
    ok: true,
    sessions: sessions.results
  });
});

app.notFound((c) => c.json({ ok: false, message: "Ruta no encontrada." }, 404));

export default app;
