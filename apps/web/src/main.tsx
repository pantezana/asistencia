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
  section_key: string;
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

type LocationOption = {
  id: string;
  name: string;
};

type SelectOption = {
  id: string;
  name: string;
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
  theme: string | null;
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
  module_id: string;
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

type EventSessionDraft = {
  moduleTitle: string;
  title: string;
  theme: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
};

type CreatedEventResult = {
  eventId: string;
  formId: string;
  slug: string;
  publicUrl: string;
  qrUrl: string;
};

type QrPreview = {
  publicUrl: string;
  qrUrl: string;
  slug: string;
};

function cleanText(value: string | null | undefined) {
  return (value ?? "")
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã", "Á")
    .replaceAll("Ã‰", "É")
    .replaceAll("Ã", "Í")
    .replaceAll("Ã“", "Ó")
    .replaceAll("Ãš", "Ú")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Ã‘", "Ñ")
    .replaceAll("Â·", "·")
    .replaceAll("Â", "");
}

function publicFieldLabel(field: PublicFormField) {
  if (field.field_key === "datos_generales_paterno") return "Apellido Paterno";
  if (field.field_key === "datos_generales_materno") return "Apellido Materno";
  if (field.field_key === "datos_generales_fecha_nac") return "Fecha de Nacimiento";
  if (field.field_key === "actividad_actividad_del_productor") return "Cuál es su actividad";
  if (field.field_key === "organizacion_pertenece_a_organizacion") return "Pertenece a una organización";
  return cleanText(field.label);
}

function textInputProps(field: PublicFormField) {
  if (field.field_key === "datos_generales_correo_electronico") {
    return {
      type: "email",
      inputMode: "email" as const,
      pattern: "[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}",
      title: "Ingrese un correo electrónico válido, por ejemplo nombre@dominio.com"
    };
  }

  if (["datos_generales_celular", "organizacion_ruc"].includes(field.field_key)) {
    return {
      type: "text",
      inputMode: "numeric" as const,
      pattern: "[0-9]*",
      title: "Ingrese solo números"
    };
  }

  if (["datos_generales_nombres", "datos_generales_paterno", "datos_generales_materno"].includes(field.field_key)) {
    return {
      type: "text",
      pattern: "[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s]+",
      title: "Ingrese solo letras"
    };
  }

  return {
    type: field.field_type === "date" ? "date" : "text"
  };
}

function fileSafeName(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "qr-asistencia";
}

async function qrSvgToCanvas(qrUrl: string, size = 2400) {
  const svg = await fetch(qrUrl).then((response) => response.text());
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const imageUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  image.src = imageUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo generar el QR.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, size, size);
  URL.revokeObjectURL(imageUrl);
  return canvas;
}

async function downloadQrPng(qrUrl: string, slug: string) {
  const canvas = await qrSvgToCanvas(qrUrl, 2400);
  const link = document.createElement("a");
  link.download = `${fileSafeName(slug)}-qr.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function asciiBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

async function downloadQrPdf(qrUrl: string, slug: string) {
  const canvas = await qrSvgToCanvas(qrUrl, 2400);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.98);
  const imageBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (char) => char.charCodeAt(0));
  const objects: Uint8Array[] = [];
  const offsets: number[] = [];
  let position = "%PDF-1.4\n".length;

  function addObject(content: Uint8Array | string) {
    const index = objects.length + 1;
    const header = asciiBytes(`${index} 0 obj\n`);
    const body = typeof content === "string" ? asciiBytes(content) : content;
    const footer = asciiBytes("\nendobj\n");
    offsets.push(position);
    const object = concatBytes([header, body, footer]);
    objects.push(object);
    position += object.length;
  }

  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObject("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
  addObject(concatBytes([
    asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`),
    imageBytes,
    asciiBytes("\nendstream")
  ]));
  const content = "q\n430 0 0 430 82.5 246 cm\n/Im0 Do\nQ";
  addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const beforeXref = concatBytes([asciiBytes("%PDF-1.4\n"), ...objects]);
  const xrefStart = beforeXref.length;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefStart),
    "%%EOF"
  ].join("\n");
  const pdfBytes = concatBytes([beforeXref, asciiBytes(xref)]);
  const link = document.createElement("a");
  link.download = `${fileSafeName(slug)}-qr.pdf`;
  link.href = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
  link.click();
}

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
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [savingSession, setSavingSession] = React.useState(false);
  const [forms, setForms] = React.useState<AdminForm[]>([]);
  const [selectedFormId, setSelectedFormId] = React.useState<string | null>(null);
  const [formSections, setFormSections] = React.useState<FormSection[]>([]);
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [selectedCatalogKey, setSelectedCatalogKey] = React.useState<string | null>(null);
  const [catalogItems, setCatalogItems] = React.useState<CatalogItem[]>([]);
  const [newCatalogItemName, setNewCatalogItemName] = React.useState("");
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [showCreateEvent, setShowCreateEvent] = React.useState(false);
  const [creatingEvent, setCreatingEvent] = React.useState(false);
  const [createdEvent, setCreatedEvent] = React.useState<CreatedEventResult | null>(null);
  const [qrPreview, setQrPreview] = React.useState<QrPreview | null>(null);
  const [savingEvent, setSavingEvent] = React.useState(false);
  const [eventDraft, setEventDraft] = React.useState({
    title: "",
    shortLinkSlug: "",
    theme: "",
    startDate: "",
    endDate: "",
    startTime: "08:00",
    endTime: "17:00"
  });
  const [sessionDrafts, setSessionDrafts] = React.useState<EventSessionDraft[]>([
    { moduleTitle: "MÃ³dulo general", title: "SesiÃ³n 1", theme: "", sessionDate: "", startTime: "08:00", endTime: "17:00" }
  ]);
  const [eventEditDraft, setEventEditDraft] = React.useState({
    title: "",
    shortLinkSlug: "",
    theme: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    status: "draft"
  });
  const [sessionEditDraft, setSessionEditDraft] = React.useState({
    moduleTitle: "",
    title: "",
    theme: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    status: "closed"
  });

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
    const session = sessions.find((item) => item.id === selectedSessionId) ?? sessions[0];
    if (!session) return;

    setSelectedSessionId((current) => current ?? session.id);
    setSessionEditDraft({
      moduleTitle: session.module_title,
      title: session.title,
      theme: session.theme,
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.attendance_status
    });
  }, [sessions, selectedSessionId]);

  React.useEffect(() => {
    const event = events.find((item) => item.id === selectedEventId);
    if (!event) return;

    setEventEditDraft({
      title: event.title,
      shortLinkSlug: event.short_link_slug,
      theme: event.theme ?? "",
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      status: event.status
    });
  }, [events, selectedEventId]);

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
    return <PublicMessage title="Asistencia" message="Validando sesiÃ³n..." />;
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
    setSelectedSessionId((current) => payload.sessions.some((session) => session.id === current) ? current : payload.sessions[0]?.id ?? null);
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
      setActionMessage(payload.message ?? "No se pudo actualizar la sesiÃ³n.");
      return;
    }

    setActionMessage(action === "open" ? "SesiÃ³n abierta correctamente." : "SesiÃ³n cerrada correctamente.");
    await loadEvents();
    await loadSessions(selectedEventId);
  }

  function editSession(session: AdminSession) {
    setSelectedSessionId(session.id);
    setSessionEditDraft({
      moduleTitle: session.module_title,
      title: session.title,
      theme: session.theme,
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.attendance_status
    });
  }

  async function saveSelectedSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId || !selectedSessionId) return;

    setSavingSession(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/events/${selectedEventId}/sessions/${selectedSessionId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionEditDraft)
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    setSavingSession(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la sesion.");
      return;
    }

    await loadSessions(selectedEventId);
    await loadEvents();
    setActionMessage("Sesion actualizada correctamente.");
  }

  function updateSessionDraft(index: number, field: keyof EventSessionDraft, value: string) {
    setSessionDrafts((current) => current.map((session, itemIndex) =>
      itemIndex === index ? { ...session, [field]: value } : session
    ));
  }

  function addSessionDraft() {
    setSessionDrafts((current) => [
      ...current,
      {
        moduleTitle: current.at(-1)?.moduleTitle || "MÃ³dulo general",
        title: `SesiÃ³n ${current.length + 1}`,
        theme: "",
        sessionDate: "",
        startTime: eventDraft.startTime,
        endTime: eventDraft.endTime
      }
    ]);
  }

  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingEvent(true);
    setActionMessage(null);

    const response = await fetch("/api/admin/events", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...eventDraft, sessions: sessionDrafts })
    });
    const payload = (await response.json()) as ({ ok: boolean; message?: string } & Partial<CreatedEventResult>);
    setCreatingEvent(false);

    if (!response.ok || !payload.eventId || !payload.publicUrl || !payload.qrUrl || !payload.formId || !payload.slug) {
      setActionMessage(payload.message ?? "No se pudo crear el evento.");
      return;
    }

    const result = {
      eventId: payload.eventId,
      formId: payload.formId,
      slug: payload.slug,
      publicUrl: payload.publicUrl,
      qrUrl: payload.qrUrl
    };
    setCreatedEvent(result);
    setSelectedEventId(result.eventId);
    await loadEvents();
    await loadForms();
    setActionMessage("Evento, cronograma y formulario creados correctamente.");
  }

  async function saveSelectedEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;

    setSavingEvent(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/events/${selectedEventId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventEditDraft)
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    setSavingEvent(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar el evento.");
      return;
    }

    await loadEvents();
    setActionMessage("Evento actualizado correctamente.");
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0];
  const openSession = sessions.find((session) => session.attendance_status === "open");
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const selectedForm = forms.find((form) => form.id === selectedFormId) ?? forms[0];
  const selectedEventPublicUrl = selectedEvent ? `${window.location.origin}/f/${selectedEvent.short_link_slug}` : "";
  const selectedEventQrUrl = selectedEvent ? `${window.location.origin}/api/public/forms/${selectedEvent.short_link_slug}/qr` : "";
  const selectedCatalog = catalogs.find((catalog) => catalog.catalog_key === selectedCatalogKey) ?? catalogs[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>Asistencia</strong>
            <small>GestiÃ³n de eventos</small>
          </div>
        </div>
        <nav className="nav-list">
          <a className="active" href="#eventos">Eventos</a>
          <a href="#formularios">Formularios</a>
          <a href="#reportes">Reportes</a>
          <a href="#configuracion">ConfiguraciÃ³n</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP en desarrollo</p>
            <h1>Panel de administraciÃ³n</h1>
          </div>
          <div className="user-menu">
            <span>{user.full_name}</span>
            <small>{user.roles.join(", ")}</small>
            <button className="button secondary" type="button" onClick={logout}>Cerrar sesiÃ³n</button>
          </div>
        </header>

        <section className="summary-grid" aria-label="Resumen del sistema">
          <Metric label="Eventos" value={String(events.length)} />
          <Metric label="MÃ³dulos" value={String(selectedEvent?.module_count ?? 0)} />
          <Metric label="Sesiones" value={String(selectedEvent?.session_count ?? 0)} />
          <Metric label="SesiÃ³n abierta" value={openSession ? String(openSession.sequence) : "0"} />
        </section>

        <section className="workspace-section" id="eventos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Gestion de eventos</p>
              <h2>Eventos registrados</h2>
            </div>
            <div className="actions">
              <button className="button" type="button" onClick={() => setShowCreateEvent((current) => !current)}>
                Crear evento
              </button>
            </div>
          </div>

          {showCreateEvent ? (
            <form className="admin-form-panel" onSubmit={createEvent}>
              <div className="form-grid">
                <label>
                  TÃ­tulo del evento
                  <input value={eventDraft.title} onChange={(event) => setEventDraft((current) => ({ ...current, title: event.target.value }))} required />
                </label>
                <label>
                  Tema
                  <input value={eventDraft.theme} onChange={(event) => setEventDraft((current) => ({ ...current, theme: event.target.value }))} />
                </label>
                <label>
                  Enlace corto
                  <input
                    value={eventDraft.shortLinkSlug}
                    onChange={(event) => setEventDraft((current) => ({ ...current, shortLinkSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                    placeholder="curso-serforeduca1"
                    required
                  />
                  <small>{window.location.origin}/f/{eventDraft.shortLinkSlug || "enlace-corto"}</small>
                </label>
                <label>
                  Fecha inicio
                  <input type="date" value={eventDraft.startDate} onChange={(event) => setEventDraft((current) => ({ ...current, startDate: event.target.value }))} required />
                </label>
                <label>
                  Fecha fin
                  <input type="date" value={eventDraft.endDate} onChange={(event) => setEventDraft((current) => ({ ...current, endDate: event.target.value }))} required />
                </label>
                <label>
                  Hora inicio
                  <input type="time" value={eventDraft.startTime} onChange={(event) => setEventDraft((current) => ({ ...current, startTime: event.target.value }))} required />
                </label>
                <label>
                  Hora fin
                  <input type="time" value={eventDraft.endTime} onChange={(event) => setEventDraft((current) => ({ ...current, endTime: event.target.value }))} required />
                </label>
              </div>

              <div className="section-heading compact-heading">
                <div>
                  <p className="eyebrow">Cronograma</p>
                  <h3>Sesiones del evento</h3>
                </div>
                <button className="button secondary" type="button" onClick={addSessionDraft}>Agregar sesiÃ³n</button>
              </div>

              <div className="session-draft-list">
                {sessionDrafts.map((session, index) => (
                  <div className="session-draft" key={index}>
                    <label>
                      MÃ³dulo
                      <input value={session.moduleTitle} onChange={(event) => updateSessionDraft(index, "moduleTitle", event.target.value)} required />
                    </label>
                    <label>
                      SesiÃ³n
                      <input value={session.title} onChange={(event) => updateSessionDraft(index, "title", event.target.value)} required />
                    </label>
                    <label className="wide-field">
                      Tema
                      <input value={session.theme} onChange={(event) => updateSessionDraft(index, "theme", event.target.value)} required />
                    </label>
                    <label>
                      Fecha
                      <input type="date" value={session.sessionDate} onChange={(event) => updateSessionDraft(index, "sessionDate", event.target.value)} required />
                    </label>
                    <label>
                      Inicio
                      <input type="time" value={session.startTime} onChange={(event) => updateSessionDraft(index, "startTime", event.target.value)} required />
                    </label>
                    <label>
                      Fin
                      <input type="time" value={session.endTime} onChange={(event) => updateSessionDraft(index, "endTime", event.target.value)} required />
                    </label>
                  </div>
                ))}
              </div>

              {createdEvent ? (
                <div className="created-event-box">
                  <div>
                    <strong>Enlace corto</strong>
                    <a href={createdEvent.publicUrl}>{createdEvent.publicUrl}</a>
                  </div>
                  <QrShareBlock
                    onPreview={setQrPreview}
                    publicUrl={createdEvent.publicUrl}
                    qrUrl={createdEvent.qrUrl}
                    slug={createdEvent.slug}
                  />
                </div>
              ) : null}

              <div className="actions">
                <button className="button" type="submit" disabled={creatingEvent}>
                  {creatingEvent ? "Creando..." : "Crear evento, formulario y QR"}
                </button>
              </div>
            </form>
          ) : null}

          <div className="session-table-wrap">
            <table className="session-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Periodo</th>
                  <th>Sesiones</th>
                  <th>Estado</th>
                  <th>Enlace</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr className={event.id === selectedEvent?.id ? "selected-row" : ""} key={event.id}>
                    <td>
                      <strong>{event.title}</strong>
                      <small>{event.theme}</small>
                    </td>
                    <td>{event.start_date} - {event.end_date}</td>
                    <td>{event.session_count}</td>
                    <td>
                      <span className={`status ${event.open_session_count > 0 ? "open" : "closed"}`}>
                        {event.open_session_count > 0 ? "Abierto" : event.status}
                      </span>
                    </td>
                    <td>
                      <a href={`/f/${event.short_link_slug}`}>Abrir</a>
                    </td>
                    <td>
                      <button className="button secondary table-action" type="button" onClick={() => setSelectedEventId(event.id)}>
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedEvent ? (
            <div className="event-panel">
              <form className="event-edit-form" onSubmit={saveSelectedEvent}>
                <div className="detail-heading">
                  <div>
                    <p className="eyebrow">Evento seleccionado</p>
                    <h3>{selectedEvent.title}</h3>
                  </div>
                  <span className={`status ${openSession ? "open" : "closed"}`}>
                    {openSession ? "Con sesion abierta" : "Sin sesion abierta"}
                  </span>
                </div>
                <div className="form-grid">
                  <label>
                    Titulo
                    <input value={eventEditDraft.title} onChange={(event) => setEventEditDraft((current) => ({ ...current, title: event.target.value }))} required />
                  </label>
                  <label>
                    Tema
                    <input value={eventEditDraft.theme} onChange={(event) => setEventEditDraft((current) => ({ ...current, theme: event.target.value }))} />
                  </label>
                  <label>
                    Enlace corto
                    <input
                      value={eventEditDraft.shortLinkSlug}
                      onChange={(event) => setEventEditDraft((current) => ({ ...current, shortLinkSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                      required
                    />
                    <small>{window.location.origin}/f/{eventEditDraft.shortLinkSlug || "enlace-corto"}</small>
                  </label>
                  <label>
                    Estado
                    <select value={eventEditDraft.status} onChange={(event) => setEventEditDraft((current) => ({ ...current, status: event.target.value }))}>
                      <option value="draft">Borrador</option>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </label>
                  <label>
                    Fecha inicio
                    <input type="date" value={eventEditDraft.startDate} onChange={(event) => setEventEditDraft((current) => ({ ...current, startDate: event.target.value }))} required />
                  </label>
                  <label>
                    Fecha fin
                    <input type="date" value={eventEditDraft.endDate} onChange={(event) => setEventEditDraft((current) => ({ ...current, endDate: event.target.value }))} required />
                  </label>
                  <label>
                    Hora inicio
                    <input type="time" value={eventEditDraft.startTime} onChange={(event) => setEventEditDraft((current) => ({ ...current, startTime: event.target.value }))} required />
                  </label>
                  <label>
                    Hora fin
                    <input type="time" value={eventEditDraft.endTime} onChange={(event) => setEventEditDraft((current) => ({ ...current, endTime: event.target.value }))} required />
                  </label>
                </div>
                <div className="created-event-box">
                  <div>
                    <strong>Enlace corto</strong>
                    <a href={selectedEventPublicUrl}>{selectedEventPublicUrl}</a>
                  </div>
                  <QrShareBlock
                    onPreview={setQrPreview}
                    publicUrl={selectedEventPublicUrl}
                    qrUrl={selectedEventQrUrl}
                    slug={selectedEvent.short_link_slug}
                  />
                </div>
                <div className="actions">
                  <button className="button" type="submit" disabled={savingEvent}>
                    {savingEvent ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <a className="button secondary" href={`/f/${selectedEvent.short_link_slug}`}>Abrir formulario</a>
                </div>
              </form>
            </div>
          ) : null}

          {actionMessage ? <p className="form-success">{actionMessage}</p> : null}

          {selectedSession ? (
            <form className="admin-form-panel" onSubmit={saveSelectedSession}>
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">Sesion seleccionada</p>
                  <h3>Editar cronograma</h3>
                </div>
                <span className={`status ${sessionEditDraft.status === "open" ? "open" : "closed"}`}>
                  {sessionEditDraft.status === "open" ? "Abierta" : "Cerrada"}
                </span>
              </div>
              <div className="form-grid">
                <label>
                  Modulo
                  <input value={sessionEditDraft.moduleTitle} onChange={(event) => setSessionEditDraft((current) => ({ ...current, moduleTitle: event.target.value }))} required />
                </label>
                <label>
                  Titulo
                  <input value={sessionEditDraft.title} onChange={(event) => setSessionEditDraft((current) => ({ ...current, title: event.target.value }))} required />
                </label>
                <label className="wide-field">
                  Tema
                  <input value={sessionEditDraft.theme} onChange={(event) => setSessionEditDraft((current) => ({ ...current, theme: event.target.value }))} required />
                </label>
                <label>
                  Fecha
                  <input type="date" value={sessionEditDraft.sessionDate} onChange={(event) => setSessionEditDraft((current) => ({ ...current, sessionDate: event.target.value }))} required />
                </label>
                <label>
                  Inicio
                  <input type="time" value={sessionEditDraft.startTime} onChange={(event) => setSessionEditDraft((current) => ({ ...current, startTime: event.target.value }))} required />
                </label>
                <label>
                  Fin
                  <input type="time" value={sessionEditDraft.endTime} onChange={(event) => setSessionEditDraft((current) => ({ ...current, endTime: event.target.value }))} required />
                </label>
                <label>
                  Estado de asistencia
                  <select value={sessionEditDraft.status} onChange={(event) => setSessionEditDraft((current) => ({ ...current, status: event.target.value }))}>
                    <option value="closed">Cerrada</option>
                    <option value="open">Abierta</option>
                  </select>
                </label>
              </div>
              <div className="actions">
                <button className="button" type="submit" disabled={savingSession}>
                  {savingSession ? "Guardando..." : "Guardar sesion"}
                </button>
              </div>
            </form>
          ) : null}

          <div className="session-table-wrap">
            <table className="session-table">
              <thead>
                <tr>
                  <th>SesiÃ³n</th>
                  <th>MÃ³dulo</th>
                  <th>Tema</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>AcciÃ³n</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr className={session.id === selectedSession?.id ? "selected-row" : ""} key={session.id}>
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
                      <button className="button secondary table-action" type="button" onClick={() => editSession(session)}>
                        Editar
                      </button>
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
                  <span>{form.section_count} secciones Â· {form.field_count} campos</span>
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
                    <a className="button secondary" href={`/f/${selectedForm.short_link_slug}`}>Ver pÃºblico</a>
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
                              <span>{field.field_type}{field.catalog_key ? ` Â· ${field.catalog_key}` : ""}</span>
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
              <p className="eyebrow">ConfiguraciÃ³n</p>
              <h2>CatÃ¡logos</h2>
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
                      <p>Mantenimiento bÃ¡sico de opciones para campos tipo select.</p>
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
                <p className="blocked-message">No hay catÃ¡logos configurados.</p>
              )}
            </div>
          </div>
        </section>
        {qrPreview ? (
          <div className="qr-modal" role="dialog" aria-modal="true" aria-label="QR ampliado">
            <div className="qr-modal-panel">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">QR ampliado</p>
                  <h3>Formulario de asistencia</h3>
                  <a href={qrPreview.publicUrl}>{qrPreview.publicUrl}</a>
                </div>
                <button className="button secondary" type="button" onClick={() => setQrPreview(null)}>
                  Cerrar
                </button>
              </div>
              <img src={qrPreview.qrUrl} alt="Codigo QR ampliado" />
              <div className="actions">
                <button className="button secondary" type="button" onClick={() => void downloadQrPng(qrPreview.qrUrl, qrPreview.slug)}>
                  IMAGEN
                </button>
                <button className="button secondary" type="button" onClick={() => void downloadQrPdf(qrPreview.qrUrl, qrPreview.slug)}>
                  PDF
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
      setError(payload.message ?? "No se pudo iniciar sesiÃ³n.");
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
            ContraseÃ±a
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

function SearchableSelect({
  disabled,
  onChange,
  options,
  placeholder,
  required,
  value
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.id === value || option.name === value);
  const visibleValue = open ? query : cleanText(selected?.name ?? value);
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const filtered = options
    .filter((option) =>
      cleanText(option.name)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(normalizedQuery)
    )
    .slice(0, 30);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open, value]);

  return (
    <div className="searchable-select">
      <input
        autoComplete="off"
        disabled={disabled}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        type="text"
        value={visibleValue}
      />
      {open && !disabled ? (
        <div className="searchable-options">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                {cleanText(option.name)}
              </button>
            ))
          ) : (
            <span>No se encontraron resultados.</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function QrShareBlock({
  onPreview,
  publicUrl,
  qrUrl,
  slug
}: QrPreview & { onPreview: (preview: QrPreview) => void }) {
  const [working, setWorking] = React.useState<"png" | "pdf" | null>(null);

  async function runDownload(type: "png" | "pdf") {
    setWorking(type);
    try {
      if (type === "png") {
        await downloadQrPng(qrUrl, slug);
      } else {
        await downloadQrPdf(qrUrl, slug);
      }
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="qr-share">
      <img src={qrUrl} alt="Codigo QR del formulario" />
      <div className="qr-actions">
        <button className="button secondary" type="button" onClick={() => onPreview({ publicUrl, qrUrl, slug })}>
          AMPLIAR
        </button>
        <button className="button secondary" type="button" onClick={() => void runDownload("png")} disabled={working !== null}>
          {working === "png" ? "GENERANDO..." : "IMAGEN"}
        </button>
        <button className="button secondary" type="button" onClick={() => void runDownload("pdf")} disabled={working !== null}>
          {working === "pdf" ? "GENERANDO..." : "PDF"}
        </button>
      </div>
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
  const [departments, setDepartments] = React.useState<LocationOption[]>([]);
  const [provinces, setProvinces] = React.useState<LocationOption[]>([]);
  const [districts, setDistricts] = React.useState<LocationOption[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState("");
  const [selectedProvinceId, setSelectedProvinceId] = React.useState("");
  const [organizationProvinces, setOrganizationProvinces] = React.useState<LocationOption[]>([]);
  const [organizationDistricts, setOrganizationDistricts] = React.useState<LocationOption[]>([]);
  const [selectedOrganizationDepartmentId, setSelectedOrganizationDepartmentId] = React.useState("");
  const [selectedOrganizationProvinceId, setSelectedOrganizationProvinceId] = React.useState("");
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

  React.useEffect(() => {
    fetch("/api/public/location/departments")
      .then((response) => (response.ok ? response.json() as Promise<{ departments: LocationOption[] }> : Promise.reject()))
      .then((payload) => setDepartments(payload.departments))
      .catch(() => setDepartments([]));
  }, []);

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
      setMessage("Está intentando volver a registrar asistencia. Su asistencia ya fue registrada en esta sesión.");
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
    const sanitizedValue = sanitizeFieldValue(fieldKey, value);
    setFields((current) => {
      if (fieldKey === "ubicacion_pais" && !isPeru(sanitizedValue)) {
        const { ubicacion_departamento, ubicacion_provincia, ubicacion_distrito, ...rest } = current;
        setSelectedDepartmentId("");
        setSelectedProvinceId("");
        setProvinces([]);
        setDistricts([]);
        return { ...rest, [fieldKey]: sanitizedValue };
      }

      if (fieldKey === "organizacion_pais" && !isPeru(sanitizedValue)) {
        const { organizacion_departamento, organizacion_provincia, organizacion_distrito, ...rest } = current;
        setSelectedOrganizationDepartmentId("");
        setSelectedOrganizationProvinceId("");
        setOrganizationProvinces([]);
        setOrganizationDistricts([]);
        return { ...rest, [fieldKey]: sanitizedValue };
      }

      if (fieldKey === "organizacion_pertenece_a_organizacion" && sanitizedValue !== "SI") {
        const {
          organizacion_tipo_de_organizacion,
          organizacion_ruc,
          organizacion_organizacion,
          organizacion_pais,
          organizacion_departamento,
          organizacion_provincia,
          organizacion_distrito,
          ...rest
        } = current;
        setSelectedOrganizationDepartmentId("");
        setSelectedOrganizationProvinceId("");
        setOrganizationProvinces([]);
        setOrganizationDistricts([]);
        return { ...rest, [fieldKey]: sanitizedValue };
      }

      return { ...current, [fieldKey]: sanitizedValue };
    });
  }

  function returnToDocumentStep() {
    setStep("document");
    setParticipant(null);
    setMessage(null);
    setPublicSectionIndex(0);
  }

  function previousPublicStep() {
    if (publicSectionIndex === 0) {
      returnToDocumentStep();
      return;
    }

    setPublicSectionIndex((current) => Math.max(0, current - 1));
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function sanitizeFieldValue(fieldKey: string, value: string) {
    if (["datos_generales_celular", "organizacion_ruc"].includes(fieldKey)) {
      return value.replace(/\D/g, "");
    }

    if (["datos_generales_nombres", "datos_generales_paterno", "datos_generales_materno"].includes(fieldKey)) {
      return value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
    }

    return value;
  }

  async function selectDepartment(departmentId: string) {
    const department = departments.find((item) => item.id === departmentId);
    setSelectedDepartmentId(departmentId);
    setSelectedProvinceId("");
    setDistricts([]);
    setFields((current) => ({
      ...current,
      ubicacion_departamento: department?.name ?? "",
      ubicacion_provincia: "",
      ubicacion_distrito: ""
    }));

    if (!departmentId) {
      setProvinces([]);
      return;
    }

    const response = await fetch(`/api/public/location/provinces?departmentId=${encodeURIComponent(departmentId)}`);
    const payload = (await response.json()) as { provinces: LocationOption[] };
    setProvinces(response.ok ? payload.provinces : []);
  }

  async function selectProvince(provinceId: string) {
    const province = provinces.find((item) => item.id === provinceId);
    setSelectedProvinceId(provinceId);
    setFields((current) => ({
      ...current,
      ubicacion_provincia: province?.name ?? "",
      ubicacion_distrito: ""
    }));

    if (!provinceId) {
      setDistricts([]);
      return;
    }

    const response = await fetch(`/api/public/location/districts?provinceId=${encodeURIComponent(provinceId)}`);
    const payload = (await response.json()) as { districts: LocationOption[] };
    setDistricts(response.ok ? payload.districts : []);
  }

  function selectDistrict(districtId: string) {
    const district = districts.find((item) => item.id === districtId);
    updateField("ubicacion_distrito", district?.name ?? "");
  }

  async function selectOrganizationDepartment(departmentId: string) {
    const department = departments.find((item) => item.id === departmentId);
    setSelectedOrganizationDepartmentId(departmentId);
    setSelectedOrganizationProvinceId("");
    setOrganizationDistricts([]);
    setFields((current) => ({
      ...current,
      organizacion_departamento: department?.name ?? "",
      organizacion_provincia: "",
      organizacion_distrito: ""
    }));

    if (!departmentId) {
      setOrganizationProvinces([]);
      return;
    }

    const response = await fetch(`/api/public/location/provinces?departmentId=${encodeURIComponent(departmentId)}`);
    const payload = (await response.json()) as { provinces: LocationOption[] };
    setOrganizationProvinces(response.ok ? payload.provinces : []);
  }

  async function selectOrganizationProvince(provinceId: string) {
    const province = organizationProvinces.find((item) => item.id === provinceId);
    setSelectedOrganizationProvinceId(provinceId);
    setFields((current) => ({
      ...current,
      organizacion_provincia: province?.name ?? "",
      organizacion_distrito: ""
    }));

    if (!provinceId) {
      setOrganizationDistricts([]);
      return;
    }

    const response = await fetch(`/api/public/location/districts?provinceId=${encodeURIComponent(provinceId)}`);
    const payload = (await response.json()) as { districts: LocationOption[] };
    setOrganizationDistricts(response.ok ? payload.districts : []);
  }

  function selectOrganizationDistrict(districtId: string) {
    const district = organizationDistricts.find((item) => item.id === districtId);
    updateField("organizacion_distrito", district?.name ?? "");
  }

  function isPeru(value: string | undefined) {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase() === "PERU";
  }

  function isOptionalForeignLocationField(fieldKey: string) {
    return (
      ["ubicacion_departamento", "ubicacion_provincia", "ubicacion_distrito"].includes(fieldKey) &&
      !isPeru(fields.ubicacion_pais)
    );
  }

  function isOrganizationDetailField(fieldKey: string) {
    return [
      "organizacion_tipo_de_organizacion",
      "organizacion_ruc",
      "organizacion_organizacion",
      "organizacion_pais",
      "organizacion_departamento",
      "organizacion_provincia",
      "organizacion_distrito"
    ].includes(fieldKey);
  }

  function isOptionalOrganizationLocationField(fieldKey: string) {
    return (
      ["organizacion_departamento", "organizacion_provincia", "organizacion_distrito"].includes(fieldKey) &&
      !isPeru(fields.organizacion_pais)
    );
  }

  function nextPublicSection(event: React.FormEvent<HTMLFormElement>, sectionCount: number) {
    event.preventDefault();

    if (currentPublicSection?.section_key === "datos_generales" && !isEmailValid()) {
      setMessage("Ingrese un correo electrónico válido, por ejemplo nombre@dominio.com.");
      return;
    }

    if (currentPublicSection?.section_key === "actividad" && !isActivitySectionValid()) {
      setMessage("Seleccione al menos un producto agrario, pecuario o forestal, o responda NO.");
      return;
    }

    if (publicSectionIndex >= sectionCount - 1) {
      void submitAttendance();
      return;
    }

    setPublicSectionIndex((current) => current + 1);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isEmailValid() {
    const email = fields.datos_generales_correo_electronico?.trim() ?? "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function isActivityProductField(fieldKey: string) {
    return [
      "actividad_producto_agrario",
      "actividad_productos_pecuario",
      "actividad_productos_forestales"
    ].includes(fieldKey);
  }

  function isActivitySectionValid() {
    if (fields.actividad_es_productor_agrario_pecuario_forestal !== "SI") {
      return true;
    }

    return Boolean(
      fields.actividad_producto_agrario ||
      fields.actividad_productos_pecuario ||
      fields.actividad_productos_forestales
    );
  }

  function updateProducerAnswer(value: string) {
    setFields((current) => {
      if (value !== "SI") {
        const {
          actividad_producto_agrario,
          actividad_productos_pecuario,
          actividad_productos_forestales,
          ...rest
        } = current;
        return { ...rest, actividad_es_productor_agrario_pecuario_forestal: value };
      }

      return { ...current, actividad_es_productor_agrario_pecuario_forestal: value };
    });
    setMessage(null);
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
  const progressSteps = ["Documento", ...publicSections.map((section) => cleanText(section.title))];
  const currentProgressIndex = step === "document" ? 0 : publicSectionIndex + 1;

  return (
    <main className="public-page">
      <section className="public-form">
        <p className="eyebrow">Formulario público</p>
        <h1>{cleanText(data.welcomeTitle)}</h1>
        <div className="session-strip">
          <span>{cleanText(data.openSession.module_title)}</span>
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
              <button className="button secondary" type="button" onClick={returnToDocumentStep}>
                Cambiar documento
              </button>
            </div>
          </div>
        ) : null}

        {step === "done" && message?.includes("volver a registrar asistencia") ? (
          <div className="actions">
            <button className="button secondary" type="button" onClick={returnToDocumentStep}>
              Cambiar documento
            </button>
          </div>
        ) : null}

        {step === "new" ? (
          <form className="document-form" onSubmit={(event) => nextPublicSection(event, publicSections.length)}>
            {currentPublicSection ? (
              <fieldset className="public-section" key={currentPublicSection.id}>
                <legend>{cleanText(currentPublicSection.title)}</legend>
                {currentPublicSection.fields.some((field) => field.field_key === "ubicacion_pais") && fields.ubicacion_pais && !isPeru(fields.ubicacion_pais) ? (
                  <p className="field-note">Para países distintos de Perú no se requiere departamento, provincia ni distrito.</p>
                ) : null}
                {currentPublicSection.fields.some((field) => field.field_key === "organizacion_pais") && fields.organizacion_pais && !isPeru(fields.organizacion_pais) ? (
                  <p className="field-note">Para sedes fuera de Perú no se requiere departamento, provincia ni distrito.</p>
                ) : null}
                {false && currentPublicSection.section_key === "actividad" ? (
                  <label>
                    Es Productor Agrario, Pecuario o Forestal
                    <select
                      value={fields.actividad_es_productor_agrario_pecuario_forestal ?? ""}
                      onChange={(event) => updateProducerAnswer(event.target.value)}
                      required
                    >
                      <option value="">Seleccione</option>
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </label>
                ) : null}
                {false && currentPublicSection.section_key === "actividad" && fields.actividad_es_productor_agrario_pecuario_forestal === "SI" ? (
                  <p className="field-note">Seleccione sus productos: debe elegir al menos una opción.</p>
                ) : null}
                {currentPublicSection.fields.map((field) => {
                  if (
                    field.field_key === "datos_generales_tipo_docidentidad" ||
                    field.field_key === "datos_generales_numero_documento"
                  ) {
                    return null;
                  }

	                  if (isOptionalForeignLocationField(field.field_key)) {
	                    return null;
	                  }

                  if (
                    isOrganizationDetailField(field.field_key) &&
                    fields.organizacion_pertenece_a_organizacion !== "SI"
                  ) {
                    return null;
                  }

                  if (isOptionalOrganizationLocationField(field.field_key)) {
                    return null;
                  }

	                  if (isActivityProductField(field.field_key) && fields.actividad_es_productor_agrario_pecuario_forestal !== "SI") {
	                    return null;
	                  }

                  if (field.field_key === "ubicacion_departamento") {
	                    return (
	                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={departments}
                          value={selectedDepartmentId}
                          onChange={(value) => void selectDepartment(value)}
                          placeholder="Buscar departamento"
                          required={isPeru(fields.ubicacion_pais)}
                        />
                      </label>
                    );
                  }

                  if (field.field_key === "ubicacion_provincia") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={provinces}
                          value={selectedProvinceId}
                          onChange={(value) => void selectProvince(value)}
                          placeholder="Buscar provincia"
                          required={isPeru(fields.ubicacion_pais)}
                          disabled={!selectedDepartmentId}
                        />
                      </label>
                    );
                  }

	                  if (field.field_key === "ubicacion_distrito") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={districts}
                          value={districts.find((item) => item.name === fields.ubicacion_distrito)?.id ?? ""}
                          onChange={selectDistrict}
                          placeholder="Buscar distrito"
                          required={isPeru(fields.ubicacion_pais)}
                          disabled={!selectedProvinceId}
                        />
                      </label>
	                    );
	                  }

                  if (field.field_key === "organizacion_departamento") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={departments}
                          value={selectedOrganizationDepartmentId}
                          onChange={(value) => void selectOrganizationDepartment(value)}
                          placeholder="Buscar departamento"
                          required={isPeru(fields.organizacion_pais)}
                        />
                      </label>
                    );
                  }

                  if (field.field_key === "organizacion_provincia") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={organizationProvinces}
                          value={selectedOrganizationProvinceId}
                          onChange={(value) => void selectOrganizationProvince(value)}
                          placeholder="Buscar provincia"
                          required={isPeru(fields.organizacion_pais)}
                          disabled={!selectedOrganizationDepartmentId}
                        />
                      </label>
                    );
                  }

                  if (field.field_key === "organizacion_distrito") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={organizationDistricts}
                          value={organizationDistricts.find((item) => item.name === fields.organizacion_distrito)?.id ?? ""}
                          onChange={selectOrganizationDistrict}
                          placeholder="Buscar distrito"
                          required={isPeru(fields.organizacion_pais)}
                          disabled={!selectedOrganizationProvinceId}
                        />
                      </label>
                    );
                  }

	                  if (field.field_type === "select" || field.field_type === "radio") {
                    const options = field.field_type === "radio"
                      ? [{ id: "si", name: "SI" }, { id: "no", name: "NO" }]
                      : data.catalogs?.[field.catalog_key ?? ""] ?? [];

                    return (
                      <React.Fragment key={field.id}>
                      {field.field_key === "organizacion_pais" ? (
                        <p className="field-note">Ubicación de la sede de su organización</p>
                      ) : null}
                      <label>
                        {publicFieldLabel(field)}
                        {field.catalog_key === "pais" ? (
                          <SearchableSelect
                            options={options}
                            value={fields[field.field_key] ?? ""}
                            onChange={(value) => {
                              const selectedOption = options.find((option) => option.id === value);
                              updateField(field.field_key, cleanText(selectedOption?.name ?? value));
                            }}
                            placeholder="Buscar país"
                            required={
                              Boolean(field.is_required) &&
                              !isOptionalForeignLocationField(field.field_key) &&
                              !isOptionalOrganizationLocationField(field.field_key)
                            }
                          />
                        ) : (
		                        <select
	                          value={fields[field.field_key] ?? ""}
	                          onChange={(event) => updateField(field.field_key, event.target.value)}
		                          required={
                              Boolean(field.is_required) &&
                              !isOptionalForeignLocationField(field.field_key) &&
                              !isOptionalOrganizationLocationField(field.field_key) &&
                              !isActivityProductField(field.field_key) &&
                              field.field_key !== "organizacion_ruc"
                            }
                        >
                          <option value="">Seleccione</option>
                          {options.map((item) => (
                            <option key={item.id} value={cleanText(item.name)}>{cleanText(item.name)}</option>
                          ))}
                        </select>
                        )}
                      </label>
                      {field.field_key === "actividad_actividad_del_productor" ? (
                        <>
                          <label>
                            Es Productor Agrario, Pecuario o Forestal
                            <select
                              value={fields.actividad_es_productor_agrario_pecuario_forestal ?? ""}
                              onChange={(event) => updateProducerAnswer(event.target.value)}
                              required
                            >
                              <option value="">Seleccione</option>
                              <option value="SI">SI</option>
                              <option value="NO">NO</option>
                            </select>
                          </label>
                          {fields.actividad_es_productor_agrario_pecuario_forestal === "SI" ? (
                            <p className="field-note">Seleccione sus productos: debe elegir al menos una opción.</p>
                          ) : null}
                        </>
                      ) : null}
                      </React.Fragment>
                    );
                  }

                  return (
                    <label key={field.id}>
                      {publicFieldLabel(field)}
                      <input
                        {...textInputProps(field)}
                        value={fields[field.field_key] ?? ""}
                        onChange={(event) => updateField(field.field_key, event.target.value)}
                        required={
                          Boolean(field.is_required) &&
                          !isOptionalForeignLocationField(field.field_key) &&
                          !isOptionalOrganizationLocationField(field.field_key) &&
                          field.field_key !== "organizacion_ruc"
                        }
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
                onClick={previousPublicStep}
                disabled={submitting}
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
