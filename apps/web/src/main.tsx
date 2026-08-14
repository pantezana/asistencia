import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type PublicFormResponse = {
  ok: boolean;
  canRegister: boolean;
  message?: string;
  welcomeTitle?: string;
  event?: {
    title: string;
    start_date: string;
    end_date: string;
  };
  openSession?: {
    title: string;
    theme: string;
    session_date: string;
    start_time: string;
    end_time: string;
    module_title: string;
  } | null;
};

type SessionUser = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
};

type AdminEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: string;
  short_link_slug: string;
  module_count: number;
  session_count: number;
  open_session_count: number;
};

type AdminSession = {
  id: string;
  sequence: number;
  title: string;
  theme: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  attendance_status: string;
  module_title: string;
};

function App() {
  const path = window.location.pathname;

  if (path.startsWith("/f/")) {
    return <PublicAttendanceForm slug={path.replace("/f/", "") || "inauguracion-otca"} />;
  }

  return <AdminShell />;
}

function AdminShell() {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState<AdminEvent[]>([]);
  const [sessions, setSessions] = React.useState<AdminSession[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => setUser((payload as { user: SessionUser }).user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (user) {
      void loadEvents();
    }
  }, [user]);

  React.useEffect(() => {
    if (selectedEventId) {
      void loadSessions(selectedEventId);
    }
  }, [selectedEventId]);

  if (loading) {
    return <PublicMessage title="Asistencia" message="Validando sesión..." />;
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  async function loadEvents() {
    const response = await fetch("/api/admin/events", { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { events: AdminEvent[] };
    setEvents(payload.events);
    setSelectedEventId((current) => current ?? payload.events[0]?.id ?? null);
  }

  async function loadSessions(eventId: string) {
    const response = await fetch(`/api/admin/events/${eventId}/sessions`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { sessions: AdminSession[] };
    setSessions(payload.sessions);
  }

  async function changeSessionState(session: AdminSession, action: "open" | "close") {
    if (!selectedEventId) return;
    setActionMessage(null);
    const response = await fetch(`/api/admin/events/${selectedEventId}/sessions/${session.id}/${action}`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setActionMessage(payload.message ?? "No se pudo actualizar la sesión.");
      return;
    }

    setActionMessage(action === "open" ? "Sesión abierta correctamente." : "Sesión cerrada correctamente.");
    await loadEvents();
    await loadSessions(selectedEventId);
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0];
  const openSession = sessions.find((session) => session.attendance_status === "open");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>Asistencia</strong>
            <small>Gestión de eventos</small>
          </div>
        </div>
        <nav className="nav-list">
          <a className="active" href="#eventos">Eventos</a>
          <a href="#formularios">Formularios</a>
          <a href="#reportes">Reportes</a>
          <a href="#configuracion">Configuración</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP en desarrollo</p>
            <h1>Panel de administración</h1>
          </div>
          <div className="user-menu">
            <span>{user.full_name}</span>
            <small>{user.roles.join(", ")}</small>
            <button className="button secondary" type="button" onClick={logout}>Cerrar sesión</button>
          </div>
        </header>

        <section className="summary-grid" aria-label="Resumen del sistema">
          <Metric label="Eventos" value={String(events.length)} />
          <Metric label="Módulos" value={String(selectedEvent?.module_count ?? 0)} />
          <Metric label="Sesiones" value={String(selectedEvent?.session_count ?? 0)} />
          <Metric label="Sesión abierta" value={openSession ? String(openSession.sequence) : "0"} />
        </section>

        <section className="workspace-section" id="eventos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evento de prueba</p>
              <h2>{selectedEvent?.title ?? "Eventos"}</h2>
            </div>
            <div className="actions">
              {selectedEvent ? (
                <a className="button secondary" href={`/f/${selectedEvent.short_link_slug}`}>Abrir formulario</a>
              ) : null}
              <button className="button" type="button">Crear evento</button>
            </div>
          </div>

          {selectedEvent ? (
            <div className="event-panel">
              <div>
                <h3>{selectedEvent.title}</h3>
                <p>
                  Estructura inicial lista para administrar módulos, sesiones, formularios clonables,
                  enlace corto, QR y reportes exportables.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Periodo</dt>
                  <dd>{selectedEvent.start_date} - {selectedEvent.end_date}</dd>
                </div>
                <div>
                  <dt>Horario</dt>
                  <dd>{selectedEvent.start_time} - {selectedEvent.end_time}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>
                    <span className={`status ${openSession ? "open" : "closed"}`}>
                      {openSession ? "Abierto" : "Cerrado"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {actionMessage ? <p className="form-success">{actionMessage}</p> : null}

          <div className="session-table-wrap">
            <table className="session-table">
              <thead>
                <tr>
                  <th>Sesión</th>
                  <th>Módulo</th>
                  <th>Tema</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.sequence}</td>
                    <td>{session.module_title}</td>
                    <td>{session.theme}</td>
                    <td>{session.session_date}</td>
                    <td>{session.start_time} - {session.end_time}</td>
                    <td>
                      <span className={`status ${session.attendance_status === "open" ? "open" : "closed"}`}>
                        {session.attendance_status === "open" ? "Abierto" : "Cerrado"}
                      </span>
                    </td>
                    <td>
                      {session.attendance_status === "open" ? (
                        <button className="button secondary table-action" type="button" onClick={() => changeSessionState(session, "close")}>
                          Cerrar
                        </button>
                      ) : (
                        <button className="button table-action" type="button" onClick={() => changeSessionState(session, "open")}>
                          Abrir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [login, setLogin] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ login, password })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; user?: SessionUser };

    if (!response.ok || !payload.user) {
      setError(payload.message ?? "No se pudo iniciar sesión.");
      setSubmitting(false);
      return;
    }

    onLogin(payload.user);
    setSubmitting(false);
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <p className="eyebrow">Acceso administrativo</p>
          <h1>Asistencia</h1>
          <p>Ingrese con un usuario autorizado para gestionar eventos, sesiones y reportes.</p>
        </div>
        <form className="document-form" onSubmit={submit}>
          <label>
            Usuario o correo
            <input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PublicAttendanceForm({ slug }: { slug: string }) {
  const [data, setData] = React.useState<PublicFormResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/public/forms/${slug}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el formulario.");
        }
        return response.json() as Promise<PublicFormResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  if (error) {
    return <PublicMessage title="Formulario no disponible" message={error} />;
  }

  if (!data) {
    return <PublicMessage title="Cargando formulario" message="Estamos consultando la sesión activa." />;
  }

  if (!data.canRegister || !data.openSession) {
    return (
      <PublicMessage
        title={data.event?.title ?? "Asistencia"}
        message={data.message ?? "No se puede registrar asistencia en este momento."}
      />
    );
  }

  return (
    <main className="public-page">
      <section className="public-form">
        <p className="eyebrow">Formulario público</p>
        <h1>{data.welcomeTitle}</h1>
        <div className="session-strip">
          <span>{data.openSession.module_title}</span>
          <span>{data.openSession.session_date}</span>
          <span>{data.openSession.start_time} - {data.openSession.end_time}</span>
        </div>

        <form className="document-form">
          <label>
            Tipo de documento
            <select defaultValue="DNI/CEDULA">
              <option>DNI/CEDULA</option>
              <option>CARNET EXTRANJERIA</option>
              <option>PASAPORTE</option>
              <option>OTRO</option>
            </select>
          </label>
          <label>
            Número de documento
            <input type="text" inputMode="numeric" placeholder="Ingrese su documento" />
          </label>
          <button className="button" type="button">Continuar</button>
        </form>
      </section>
    </main>
  );
}

function PublicMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="public-page">
      <section className="public-form compact">
        <p className="eyebrow">Asistencia</p>
        <h1>{title}</h1>
        <p className="blocked-message">{message}</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
