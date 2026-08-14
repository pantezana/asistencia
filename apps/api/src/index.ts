import { Hono } from "hono";
import { cors } from "hono/cors";
import { createSession, getSessionUser, requireAuth, revokeCurrentSession, verifyPassword } from "./auth";
import { getEventBySlug, getOpenSessionForEvent, getUserForLogin, listEventSessions } from "./db";
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

app.use("/api/admin/*", requireAuth());

app.get("/api/admin/me", (c) => {
  return c.json({ ok: true, user: c.get("user") });
});

app.get("/api/admin/events/:eventId/sessions", async (c) => {
  const eventId = c.req.param("eventId");
  const sessions = await listEventSessions(c.env.DB, eventId);

  return c.json({
    ok: true,
    sessions: sessions.results
  });
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
