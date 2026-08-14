import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type PublicFormResponse = {
  ok: boolean;
  canRegister: boolean;
  message?: string;
  welcomeTitle?: string;
  form?: {
    id: string;
    name: string;
  };
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
  sections?: PublicFormSection[];
  catalogs?: Record<string, CatalogItem[]>;
};

type PublicFormSection = {
  id: string;
  title: string;
  fields: PublicFormField[];
};

type PublicFormField = {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  catalog_key: string | null;
  is_required: number;
  config: string;
};

type PublicParticipant = {
  id: string;
  first_name: string;
  paternal_last_name: string | null;
  maternal_last_name: string | null;
  email: string | null;
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

type AdminForm = {
  id: string;
  event_title: string;
  name: string;
  status: string;
  short_link_slug: string;
  welcome_title_template: string;
  cloned_from_form_id: string | null;
  section_count: number;
  field_count: number;
};

type FormField = {
  id: string;
  label: string;
  field_type: string;
  catalog_key: string | null;
  is_required: number;
};

type FormSection = {
  id: string;
  title: string;
  fields: FormField[];
};

type Catalog = {
  id: string;
  catalog_key: string;
  name: string;
  status: string;
  item_count: number;
  active_item_count: number;
};

type CatalogItem = {
  id: string;
  name: string;
  description: string | null;
  status: string;
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
  const [forms, setForms] = React.useState<AdminForm[]>([]);
  const [selectedFormId, setSelectedFormId] = React.useState<string | null>(null);
  const [formSections, setFormSections] = React.useState<FormSection[]>([]);
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [selectedCatalogKey, setSelectedCatalogKey] = React.useState<string | null>(null);
  const [catalogItems, setCatalogItems] = React.useState<CatalogItem[]>([]);
  const [newCatalogItemName, setNewCatalogItemName] = React.useState("");
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
      void loadForms();
      void loadCatalogs();
    }
  }, [user]);

  React.useEffect(() => {
    if (selectedEventId) {
      void loadSessions(selectedEventId);
    }
  }, [selectedEventId]);

  React.useEffect(() => {
    if (selectedFormId) {
      void loadFormDetail(selectedFormId);
    }
  }, [selectedFormId]);

  React.useEffect(() => {
    if (selectedCatalogKey) {
      void loadCatalogItems(selectedCatalogKey);
    }
  }, [selectedCatalogKey]);

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

  async function loadForms() {
    const response = await fetch("/api/admin/forms", { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { forms: AdminForm[] };
    setForms(payload.forms);
    setSelectedFormId((current) => current ?? payload.forms[0]?.id ?? null);
  }

  async function loadFormDetail(formId: string) {
    const response = await fetch(`/api/admin/forms/${formId}`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { sections: FormSection[] };
    setFormSections(payload.sections);
  }

  async function cloneSelectedForm() {
    if (!selectedFormId) return;
    const response = await fetch(`/api/admin/forms/${selectedFormId}/clone`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      setActionMessage("No se pudo clonar el formulario.");
      return;
    }

    const payload = (await response.json()) as { form: AdminForm };
    setActionMessage("Formulario clonado como borrador.");
    await loadForms();
    setSelectedFormId(payload.form.id);
  }

  async function changeFormStatus(form: AdminForm, status: "active" | "inactive" | "draft") {
    const response = await fetch(`/api/admin/forms/${form.id}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    setActionMessage(response.ok ? "Estado del formulario actualizado." : "No se pudo actualizar el formulario.");
    await loadForms();
  }

  async function loadCatalogs() {
    const response = await fetch("/api/admin/catalogs", { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { catalogs: Catalog[] };
    setCatalogs(payload.catalogs);
    setSelectedCatalogKey((current) => current ?? payload.catalogs[0]?.catalog_key ?? null);
  }

  async function loadCatalogItems(catalogKey: string) {
    const response = await fetch(`/api/admin/catalogs/${catalogKey}/items`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { items: CatalogItem[] };
    setCatalogItems(payload.items);
  }

  async function addCatalogItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCatalogKey || !newCatalogItemName.trim()) return;
    const response = await fetch(`/api/admin/catalogs/${selectedCatalogKey}/items`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatalogItemName.trim() })
    });

    if (response.ok) {
      setNewCatalogItemName("");
      await loadCatalogs();
      await loadCatalogItems(selectedCatalogKey);
    }
  }

  async function toggleCatalogItem(item: CatalogItem) {
    if (!selectedCatalogKey) return;
    await fetch(`/api/admin/catalog-items/${item.id}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: item.status === "active" ? "inactive" : "active" })
    });
    await loadCatalogItems(selectedCatalogKey);
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
  const selectedForm = forms.find((form) => form.id === selectedFormId) ?? forms[0];
  const selectedCatalog = catalogs.find((catalog) => catalog.catalog_key === selectedCatalogKey) ?? catalogs[0];

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

        <section className="workspace-section" id="formularios">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plantillas y formularios</p>
              <h2>Formularios de asistencia</h2>
            </div>
            <div className="actions">
              <button className="button secondary" type="button" onClick={cloneSelectedForm} disabled={!selectedForm}>
                Clonar formulario
              </button>
            </div>
          </div>

          <div className="split-grid">
            <div className="list-panel">
              {forms.map((form) => (
                <button
                  className={`list-row ${form.id === selectedForm?.id ? "selected" : ""}`}
                  key={form.id}
                  type="button"
                  onClick={() => setSelectedFormId(form.id)}
                >
                  <strong>{form.name}</strong>
                  <span>{form.section_count} secciones · {form.field_count} campos</span>
                  <small>{form.status}</small>
                </button>
              ))}
            </div>

            <div className="detail-panel">
              {selectedForm ? (
                <>
                  <div className="detail-heading">
                    <div>
                      <h3>{selectedForm.name}</h3>
                      <p>{selectedForm.event_title}</p>
                    </div>
                    <span className={`status ${selectedForm.status === "active" ? "open" : "closed"}`}>
                      {selectedForm.status}
                    </span>
                  </div>
                  <div className="detail-actions">
                    <a className="button secondary" href={`/f/${selectedForm.short_link_slug}`}>Ver público</a>
                    <button className="button secondary" type="button" onClick={() => changeFormStatus(selectedForm, "active")}>
                      Activar
                    </button>
                    <button className="button secondary" type="button" onClick={() => changeFormStatus(selectedForm, "inactive")}>
                      Inactivar
                    </button>
                  </div>
                  <div className="form-structure">
                    {formSections.map((section) => (
                      <div className="structure-section" key={section.id}>
                        <h4>{section.title}</h4>
                        <div className="field-grid">
                          {section.fields.map((field) => (
                            <div className="field-chip" key={field.id}>
                              <strong>{field.label}</strong>
                              <span>{field.field_type}{field.catalog_key ? ` · ${field.catalog_key}` : ""}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="blocked-message">No hay formularios configurados.</p>
              )}
            </div>
          </div>
        </section>

        <section className="workspace-section" id="configuracion">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Configuración</p>
              <h2>Catálogos</h2>
            </div>
          </div>

          <div className="split-grid">
            <div className="list-panel compact-list">
              {catalogs.map((catalog) => (
                <button
                  className={`list-row ${catalog.catalog_key === selectedCatalog?.catalog_key ? "selected" : ""}`}
                  key={catalog.id}
                  type="button"
                  onClick={() => setSelectedCatalogKey(catalog.catalog_key)}
                >
                  <strong>{catalog.catalog_key}</strong>
                  <span>{catalog.active_item_count} activos de {catalog.item_count}</span>
                </button>
              ))}
            </div>

            <div className="detail-panel">
              {selectedCatalog ? (
                <>
                  <div className="detail-heading">
                    <div>
                      <h3>{selectedCatalog.catalog_key}</h3>
                      <p>Mantenimiento básico de opciones para campos tipo select.</p>
                    </div>
                  </div>
                  <form className="inline-form" onSubmit={addCatalogItem}>
                    <input
                      value={newCatalogItemName}
                      onChange={(event) => setNewCatalogItemName(event.target.value)}
                      placeholder="Nuevo elemento"
                    />
                    <button className="button" type="submit">Agregar</button>
                  </form>
                  <div className="catalog-items">
                    {catalogItems.map((item) => (
                      <div className="catalog-item" key={item.id}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.description}</span>
                        </div>
                        <button className="button secondary table-action" type="button" onClick={() => toggleCatalogItem(item)}>
                          {item.status === "active" ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="blocked-message">No hay catálogos configurados.</p>
              )}
            </div>
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
  const [documentType, setDocumentType] = React.useState("DNI/CEDULA");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [fields, setFields] = React.useState<Record<string, string>>({});
  const [participant, setParticipant] = React.useState<PublicParticipant | null>(null);
  const [step, setStep] = React.useState<"document" | "existing" | "new" | "done">("document");
  const [publicSectionIndex, setPublicSectionIndex] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

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

  async function identify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/public/forms/${slug}/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber })
    });
    const payload = (await response.json()) as {
      message?: string;
      exists?: boolean;
      participant?: PublicParticipant | null;
      alreadyRegistered?: boolean;
    };

    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "No se pudo validar el documento.");
      return;
    }

    if (payload.alreadyRegistered) {
      setStep("done");
      setMessage("Su asistencia ya fue registrada para esta sesion.");
      return;
    }

    if (payload.exists && payload.participant) {
      setParticipant(payload.participant);
      setStep("existing");
      return;
    }

    setParticipant(null);
    setFields((current) => ({
      ...current,
      datos_generales_tipo_docidentidad: documentType,
      datos_generales_numero_documento: documentNumber
    }));
    setPublicSectionIndex(0);
    setStep("new");
  }

  async function submitAttendance(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/public/forms/${slug}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber, participantId: participant?.id, fields })
    });
    const payload = (await response.json()) as { message?: string };

    setSubmitting(false);
    setMessage(payload.message ?? (response.ok ? "Asistencia registrada correctamente." : "No se pudo registrar la asistencia."));

    if (response.ok) {
      setStep("done");
    }
  }

  function updateField(fieldKey: string, value: string) {
    setFields((current) => ({ ...current, [fieldKey]: value }));
  }

  function nextPublicSection(event: React.FormEvent<HTMLFormElement>, sectionCount: number) {
    event.preventDefault();

    if (publicSectionIndex >= sectionCount - 1) {
      void submitAttendance();
      return;
    }

    setPublicSectionIndex((current) => current + 1);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

  const publicSections = data.sections ?? [];
  const currentPublicSection = publicSections[publicSectionIndex];
  const progressSteps = ["Documento", ...publicSections.map((section) => section.title)];
  const currentProgressIndex = step === "document" ? 0 : publicSectionIndex + 1;

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

        {step !== "existing" && step !== "done" ? (
          <div className="progress-steps" aria-label="Avance del formulario">
            {progressSteps.map((label, index) => (
              <div className={`progress-step ${index === currentProgressIndex ? "current" : ""} ${index < currentProgressIndex ? "done" : ""}`} key={label}>
                <span>{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        ) : null}

        {message ? <p className={step === "done" ? "form-success" : "form-error"}>{message}</p> : null}

        {step === "document" ? (
        <form className="document-form" onSubmit={identify}>
          <label>
            Tipo de documento
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
              <option>DNI/CEDULA</option>
              <option>CARNET EXTRANJERIA</option>
              <option>PASAPORTE</option>
              <option>OTRO</option>
            </select>
          </label>
          <label>
            Número de documento
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ingrese su documento"
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              required
            />
          </label>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Validando..." : "Continuar"}
          </button>
        </form>
        ) : null}

        {step === "existing" && participant ? (
          <div className="confirm-panel">
            <h2>Confirme su asistencia</h2>
            <p>{participant.first_name} {participant.paternal_last_name ?? ""} {participant.maternal_last_name ?? ""}</p>
            <div className="actions">
              <button className="button" type="button" onClick={() => void submitAttendance()} disabled={submitting}>
                {submitting ? "Registrando..." : "Confirmar asistencia"}
              </button>
              <button className="button secondary" type="button" onClick={() => setStep("document")}>
                Cambiar documento
              </button>
            </div>
          </div>
        ) : null}

        {step === "new" ? (
          <form className="document-form" onSubmit={(event) => nextPublicSection(event, publicSections.length)}>
            {currentPublicSection ? (
              <fieldset className="public-section" key={currentPublicSection.id}>
                <legend>{currentPublicSection.title}</legend>
                {currentPublicSection.fields.map((field) => {
                  if (
                    field.field_key === "datos_generales_tipo_docidentidad" ||
                    field.field_key === "datos_generales_numero_documento"
                  ) {
                    return null;
                  }

                  if (field.field_type === "select" || field.field_type === "radio") {
                    const options = field.field_type === "radio"
                      ? [{ id: "si", name: "SI" }, { id: "no", name: "NO" }]
                      : data.catalogs?.[field.catalog_key ?? ""] ?? [];

                    return (
                      <label key={field.id}>
                        {field.label}
                        <select
                          value={fields[field.field_key] ?? ""}
                          onChange={(event) => updateField(field.field_key, event.target.value)}
                          required={Boolean(field.is_required)}
                        >
                          <option value="">Seleccione</option>
                          {options.map((item) => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                          ))}
                        </select>
                      </label>
                    );
                  }

                  return (
                    <label key={field.id}>
                      {field.label}
                      <input
                        type={field.field_type === "date" ? "date" : "text"}
                        value={fields[field.field_key] ?? ""}
                        onChange={(event) => updateField(field.field_key, event.target.value)}
                        required={Boolean(field.is_required)}
                      />
                    </label>
                  );
                })}
              </fieldset>
            ) : null}
            <div className="form-navigation">
              <button
                className="button secondary"
                type="button"
                onClick={() => setPublicSectionIndex((current) => Math.max(0, current - 1))}
                disabled={publicSectionIndex === 0 || submitting}
              >
                Atrás
              </button>
              <button className="button" type="submit" disabled={submitting}>
                {publicSectionIndex >= publicSections.length - 1
                  ? submitting ? "Registrando..." : "Registrar asistencia"
                  : "Siguiente"}
              </button>
            </div>
          </form>
        ) : null}
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
