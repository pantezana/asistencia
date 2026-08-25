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
  associated_form_id: string | null;
  associated_form_name: string | null;
  associated_template_id: string | null;
  associated_template_name: string | null;
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

type FormField = {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  catalog_key: string | null;
  is_required: number;
  config: string;
};

type FormSection = {
  id: string;
  section_key: string;
  title: string;
  fields: FormField[];
};

type FormSectionDefinition = {
  id: string;
  section_key: string;
  title: string;
  description: string | null;
  status: string;
};

type FormControlDefinition = {
  id: string;
  control_key: string;
  label: string;
  field_type: string;
  catalog_key: string | null;
  default_required: number;
  validation_rules: string;
  default_config: string;
  status: string;
};

type Catalog = {
  id: string;
  catalog_key: string;
  name: string;
  status: string;
  description: string | null;
  control_label: string;
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

type FormTemplate = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  source_form_id: string | null;
  section_count: number;
  field_count: number;
  event_count: number;
  active_publication_count: number;
};

type QrPreview = {
  publicUrl: string;
  qrUrl: string;
  slug: string;
};

type EventQuestion = {
  id: string;
  event_id: string;
  session_id: string | null;
  question_text: string;
  description: string | null;
  interaction_type: string;
  status: string;
  allow_multiple_responses: number;
  max_responses_per_participant: number | null;
  max_answer_length: number;
  max_selectable_concepts: number;
  show_participant_cloud: number;
  participant_slug: string;
  presenter_slug: string;
  response_count: number;
  unique_participant_count: number;
  event_title?: string;
  event_slug?: string;
};

type QuestionSummaryItem = {
  answer: string;
  normalized_answer: string;
  count: number;
};

type QuestionSelectionItem = {
  id: string;
  normalized_answer: string;
  display_answer: string;
  selection_order: number;
};

type QuestionSelectionGroup = {
  participant_id: string;
  participant_name: string;
  selections: string;
  selection_count: number;
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

function parseFieldConfig(config: string | null | undefined) {
  try {
    return JSON.parse(config || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function textValidationFromConfig(config: string | null | undefined) {
  const value = parseFieldConfig(config).textValidation;
  return value === "letters" || value === "numbers" || value === "none" ? value : null;
}

function legacyTextValidation(fieldKey: string) {
  if (["datos_generales_celular", "organizacion_ruc"].includes(fieldKey)) return "numbers";
  if (["datos_generales_nombres", "datos_generales_paterno", "datos_generales_materno"].includes(fieldKey)) return "letters";
  return null;
}

function textValidationForField(field: Pick<PublicFormField | FormField, "field_key" | "config">) {
  return textValidationFromConfig(field.config) ?? legacyTextValidation(field.field_key);
}

function textValidationLabel(value: string | null) {
  if (value === "letters") return "solo texto";
  if (value === "numbers") return "solo numeros";
  return "";
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

  const textValidation = textValidationForField(field);

  if (textValidation === "numbers") {
    return {
      type: "text",
      inputMode: "numeric" as const,
      pattern: "[0-9]*",
      title: "Ingrese solo números"
    };
  }

  if (textValidation === "letters") {
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

  if (path.startsWith("/q/p/")) {
    return <QuestionPresenterView slug={path.replace("/q/p/", "")} />;
  }

  if (path.startsWith("/q/")) {
    return <QuestionParticipantView slug={path.replace("/q/", "")} />;
  }

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
  const [eventQuestions, setEventQuestions] = React.useState<EventQuestion[]>([]);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [savingSession, setSavingSession] = React.useState(false);
  const [formTemplates, setFormTemplates] = React.useState<FormTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [templateEditDraft, setTemplateEditDraft] = React.useState({ name: "", description: "", status: "active" });
  const [savingTemplate, setSavingTemplate] = React.useState(false);
  const [templateSections, setTemplateSections] = React.useState<FormSection[]>([]);
  const [sectionPalette, setSectionPalette] = React.useState<FormSectionDefinition[]>([]);
  const [controlPalette, setControlPalette] = React.useState<FormControlDefinition[]>([]);
  const [templateSectionDraft, setTemplateSectionDraft] = React.useState({
    sectionDefinitionId: "",
    title: "",
    position: "end",
    targetSectionId: ""
  });
  const [templateFieldDraft, setTemplateFieldDraft] = React.useState({
    sectionId: "",
    controlDefinitionId: "",
    label: "",
    isRequired: true,
    textValidation: "none",
    position: "end",
    targetFieldId: ""
  });
  const [editingFieldId, setEditingFieldId] = React.useState<string | null>(null);
  const [templateFieldEditDraft, setTemplateFieldEditDraft] = React.useState({
    sectionId: "",
    label: "",
    isRequired: true,
    textValidation: "none",
    position: "same",
    targetFieldId: ""
  });
  const [editingTemplateStructure, setEditingTemplateStructure] = React.useState(false);
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [selectedCatalogKey, setSelectedCatalogKey] = React.useState<string | null>(null);
  const [catalogItems, setCatalogItems] = React.useState<CatalogItem[]>([]);
  const [newCatalogItemName, setNewCatalogItemName] = React.useState("");
  const [newCatalogDraft, setNewCatalogDraft] = React.useState({
    catalogKey: "",
    catalogName: "",
    controlLabel: "",
    description: ""
  });
  const [catalogEditDraft, setCatalogEditDraft] = React.useState({
    catalogKey: "",
    catalogName: "",
    controlLabel: "",
    description: ""
  });
  const [editingCatalogItemId, setEditingCatalogItemId] = React.useState<string | null>(null);
  const [catalogItemEditDraft, setCatalogItemEditDraft] = React.useState({ name: "", description: "" });
  const [savingCatalog, setSavingCatalog] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [showCreateEvent, setShowCreateEvent] = React.useState(false);
  const [creatingEvent, setCreatingEvent] = React.useState(false);
  const [createdEvent, setCreatedEvent] = React.useState<CreatedEventResult | null>(null);
  const [qrPreview, setQrPreview] = React.useState<QrPreview | null>(null);
  const [savingEvent, setSavingEvent] = React.useState(false);
  const [savingFormAssociation, setSavingFormAssociation] = React.useState(false);
  const [associatedTemplateDraftId, setAssociatedTemplateDraftId] = React.useState("");
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
  const [questionDraft, setQuestionDraft] = React.useState({
    questionText: "",
    description: "",
    sessionId: "",
    allowMultipleResponses: false,
    maxResponsesPerParticipant: "",
    maxAnswerLength: "80",
    maxSelectableConcepts: "5",
    participantSlug: ""
  });
  const [editingQuestionId, setEditingQuestionId] = React.useState<string | null>(null);
  const [questionEditDraft, setQuestionEditDraft] = React.useState({
    questionText: "",
    description: "",
    sessionId: "",
    allowMultipleResponses: false,
    maxResponsesPerParticipant: "",
    maxAnswerLength: "80",
    maxSelectableConcepts: "5",
    participantSlug: ""
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
      void loadFormTemplates();
      void loadFormBuilderPalette();
      void loadCatalogs();
    }
  }, [user]);

  React.useEffect(() => {
    if (selectedEventId) {
      setEditingQuestionId(null);
      void loadSessions(selectedEventId);
      void loadEventQuestions(selectedEventId);
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
    setAssociatedTemplateDraftId(event.associated_template_id ?? "");
  }, [events, selectedEventId]);

  React.useEffect(() => {
    if (selectedTemplateId) {
      void loadFormTemplateDetail(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  React.useEffect(() => {
    setTemplateFieldDraft((current) => ({
      ...current,
      sectionId: current.sectionId || templateSections[0]?.id || "",
      targetFieldId: ""
    }));
    setTemplateSectionDraft((current) => ({
      ...current,
      targetSectionId: current.targetSectionId || templateSections[0]?.id || ""
    }));
  }, [templateSections]);

  React.useEffect(() => {
    setTemplateFieldDraft((current) => ({
      ...current,
      controlDefinitionId: current.controlDefinitionId || controlPalette[0]?.id || "",
      label: current.label || controlPalette[0]?.label || "",
      textValidation: current.controlDefinitionId ? current.textValidation : textValidationFromConfig(controlPalette[0]?.default_config) ?? "none"
    }));
    setTemplateSectionDraft((current) => ({
      ...current,
      sectionDefinitionId: current.sectionDefinitionId || sectionPalette[0]?.id || "",
      title: current.title || sectionPalette[0]?.title || ""
    }));
  }, [controlPalette, sectionPalette]);

  React.useEffect(() => {
    const template = formTemplates.find((item) => item.id === selectedTemplateId);
    if (!template) return;
    setTemplateEditDraft({
      name: template.name,
      description: template.description ?? "",
      status: template.status
    });
  }, [formTemplates, selectedTemplateId]);

  React.useEffect(() => {
    if (selectedCatalogKey) {
      void loadCatalogItems(selectedCatalogKey);
    }
  }, [selectedCatalogKey]);

  React.useEffect(() => {
    const catalog = catalogs.find((item) => item.catalog_key === selectedCatalogKey);
    if (!catalog) return;
    setCatalogEditDraft({
      catalogKey: catalog.catalog_key,
      catalogName: catalog.name,
      controlLabel: catalog.control_label ?? catalog.name,
      description: catalog.description ?? ""
    });
    setEditingCatalogItemId(null);
    setCatalogItemEditDraft({ name: "", description: "" });
  }, [catalogs, selectedCatalogKey]);

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

  async function loadEventQuestions(eventId: string) {
    const response = await fetch(`/api/admin/events/${eventId}/questions`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { questions: EventQuestion[] };
    setEventQuestions(payload.questions);
  }

  async function saveSelectedTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTemplateId) return;

    setSavingTemplate(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateEditDraft)
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate };
    setSavingTemplate(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar el modelo.");
      return;
    }

    await loadFormTemplates();
    await loadEvents();
    setSelectedTemplateId(payload.template?.id ?? selectedTemplateId);
    setActionMessage("Modelo de formulario actualizado correctamente.");
  }

  async function cloneSelectedTemplate() {
    if (!selectedTemplateId) return;
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}/clone`, {
      method: "POST",
      credentials: "include"
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate };

    if (!response.ok || !payload.ok || !payload.template) {
      setActionMessage(payload.message ?? "No se pudo clonar el modelo.");
      return;
    }

    await loadFormTemplates();
    setSelectedTemplateId(payload.template.id);
    setActionMessage("Modelo clonado como borrador.");
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

  async function createCatalog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCatalogDraft.catalogKey.trim() || !newCatalogDraft.catalogName.trim() || !newCatalogDraft.controlLabel.trim()) return;

    setSavingCatalog(true);
    setActionMessage(null);
    const response = await fetch("/api/admin/catalogs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCatalogDraft)
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; catalogKey?: string };
    setSavingCatalog(false);

    if (!response.ok || !payload.ok || !payload.catalogKey) {
      setActionMessage(payload.message ?? "No se pudo crear el catalogo.");
      return;
    }

    setNewCatalogDraft({ catalogKey: "", catalogName: "", controlLabel: "", description: "" });
    await loadCatalogs();
    await loadFormBuilderPalette();
    setSelectedCatalogKey(payload.catalogKey);
    await loadCatalogItems(payload.catalogKey);
    setActionMessage("Catalogo y control de paleta creados correctamente.");
  }

  async function saveCatalogDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCatalogKey || !catalogEditDraft.catalogKey.trim() || !catalogEditDraft.catalogName.trim() || !catalogEditDraft.controlLabel.trim()) return;

    setSavingCatalog(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/catalogs/${selectedCatalogKey}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catalogEditDraft)
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; catalogKey?: string };
    setSavingCatalog(false);

    if (!response.ok || !payload.ok || !payload.catalogKey) {
      setActionMessage(payload.message ?? "No se pudo actualizar el catalogo.");
      return;
    }

    await loadCatalogs();
    await loadFormBuilderPalette();
    if (selectedTemplateId) {
      await loadFormTemplateDetail(selectedTemplateId);
    }
    setSelectedCatalogKey(payload.catalogKey);
    await loadCatalogItems(payload.catalogKey);
    setActionMessage("Catalogo actualizado correctamente.");
  }

  async function toggleCatalogStatus(catalog: Catalog) {
    const nextStatus = catalog.status === "active" ? "inactive" : "active";
    setActionMessage(null);
    const response = await fetch(`/api/admin/catalogs/${catalog.catalog_key}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar el catalogo.");
      return;
    }

    await loadCatalogs();
    await loadFormBuilderPalette();
    if (selectedCatalogKey === catalog.catalog_key) {
      await loadCatalogItems(catalog.catalog_key);
    }
    setActionMessage(nextStatus === "active" ? "Catalogo activado correctamente." : "Catalogo inactivado correctamente.");
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

  function startCatalogItemEdit(item: CatalogItem) {
    setEditingCatalogItemId(item.id);
    setCatalogItemEditDraft({
      name: item.name,
      description: item.description ?? ""
    });
  }

  function cancelCatalogItemEdit() {
    setEditingCatalogItemId(null);
    setCatalogItemEditDraft({ name: "", description: "" });
  }

  async function saveCatalogItem(itemId: string) {
    if (!selectedCatalogKey || !catalogItemEditDraft.name.trim()) return;

    setActionMessage(null);
    const response = await fetch(`/api/admin/catalog-items/${itemId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catalogItemEditDraft)
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar el elemento.");
      return;
    }

    cancelCatalogItemEdit();
    await loadCatalogs();
    await loadCatalogItems(selectedCatalogKey);
    setActionMessage("Elemento actualizado correctamente.");
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

  async function loadFormTemplates() {
    const response = await fetch("/api/admin/form-templates", { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { templates: FormTemplate[] };
    setFormTemplates(payload.templates);
    setSelectedTemplateId((current) => current ?? payload.templates[0]?.id ?? null);
  }

  async function loadFormBuilderPalette() {
    const response = await fetch("/api/admin/form-builder/palette", { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as {
      sections: FormSectionDefinition[];
      controls: FormControlDefinition[];
    };
    setSectionPalette(payload.sections);
    setControlPalette(payload.controls);
  }

  async function loadFormTemplateDetail(templateId: string) {
    const response = await fetch(`/api/admin/form-templates/${templateId}`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { template: FormTemplate; sections: FormSection[] };
    setFormTemplates((current) => current.map((template) => template.id === payload.template.id ? payload.template : template));
    setTemplateSections(payload.sections);
  }

  function applyTemplateStructurePayload(payload: { template?: FormTemplate; sections?: FormSection[] }) {
    if (payload.template) {
      setFormTemplates((current) => current.map((template) => template.id === payload.template?.id ? payload.template : template));
    }
    if (payload.sections) {
      setTemplateSections(payload.sections);
    }
  }

  async function addSectionToTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTemplateId || !templateSectionDraft.sectionDefinitionId) return;

    setEditingTemplateStructure(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}/sections`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...templateSectionDraft,
        targetSectionId: templateSectionDraft.targetSectionId || null
      })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate; sections?: FormSection[] };
    setEditingTemplateStructure(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo agregar la seccion.");
      return;
    }

    applyTemplateStructurePayload(payload);
    await loadFormTemplates();
    setActionMessage("Seccion agregada al modelo.");
  }

  async function removeSectionFromTemplate(sectionId: string) {
    if (!selectedTemplateId) return;
    if (!window.confirm("Esta accion quitara la seccion y sus controles del modelo. Desea continuar?")) return;

    setEditingTemplateStructure(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}/sections/${sectionId}`, {
      method: "DELETE",
      credentials: "include"
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate; sections?: FormSection[] };
    setEditingTemplateStructure(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo quitar la seccion.");
      return;
    }

    applyTemplateStructurePayload(payload);
    await loadFormTemplates();
    setActionMessage("Seccion quitada del modelo.");
  }

  async function addFieldToTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTemplateId || !templateFieldDraft.sectionId || !templateFieldDraft.controlDefinitionId) return;

    setEditingTemplateStructure(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}/fields`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...templateFieldDraft,
        targetFieldId: templateFieldDraft.targetFieldId || null
      })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate; sections?: FormSection[] };
    setEditingTemplateStructure(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo agregar el control.");
      return;
    }

    applyTemplateStructurePayload(payload);
    await loadFormTemplates();
    setActionMessage("Control agregado al modelo.");
  }

  async function removeFieldFromTemplate(fieldId: string) {
    if (!selectedTemplateId) return;

    setEditingTemplateStructure(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}/fields/${fieldId}`, {
      method: "DELETE",
      credentials: "include"
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate; sections?: FormSection[] };
    setEditingTemplateStructure(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo quitar el control.");
      return;
    }

    applyTemplateStructurePayload(payload);
    await loadFormTemplates();
    setActionMessage("Control quitado del modelo.");
  }

  function editTemplateField(section: FormSection, field: FormField) {
    setEditingFieldId(field.id);
    setTemplateFieldEditDraft({
      sectionId: section.id,
      label: field.label,
      isRequired: Boolean(field.is_required),
      textValidation: field.field_type === "text" ? textValidationForField(field) ?? "none" : "none",
      position: "same",
      targetFieldId: ""
    });
  }

  function cancelTemplateFieldEdit() {
    setEditingFieldId(null);
    setTemplateFieldEditDraft({
      sectionId: "",
      label: "",
      isRequired: true,
      textValidation: "none",
      position: "same",
      targetFieldId: ""
    });
  }

  async function saveTemplateFieldEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTemplateId || !editingFieldId || !templateFieldEditDraft.sectionId) return;

    setEditingTemplateStructure(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/form-templates/${selectedTemplateId}/fields/${editingFieldId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...templateFieldEditDraft,
        targetFieldId: templateFieldEditDraft.targetFieldId || null
      })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; template?: FormTemplate; sections?: FormSection[] };
    setEditingTemplateStructure(false);

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo editar el control.");
      return;
    }

    applyTemplateStructurePayload(payload);
    await loadFormTemplates();
    cancelTemplateFieldEdit();
    setActionMessage("Control actualizado correctamente.");
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

  async function createQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId || !questionDraft.questionText.trim()) return;

    setActionMessage(null);
    const response = await fetch(`/api/admin/events/${selectedEventId}/questions`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText: questionDraft.questionText,
        description: questionDraft.description,
        sessionId: questionDraft.sessionId || null,
        allowMultipleResponses: questionDraft.allowMultipleResponses,
        maxResponsesPerParticipant: questionDraft.maxResponsesPerParticipant ? Number(questionDraft.maxResponsesPerParticipant) : null,
        maxAnswerLength: Number(questionDraft.maxAnswerLength) || 80,
        maxSelectableConcepts: Number(questionDraft.maxSelectableConcepts) || 5,
        participantSlug: questionDraft.participantSlug
      })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo crear la pregunta.");
      return;
    }

    setQuestionDraft({
      questionText: "",
      description: "",
      sessionId: "",
      allowMultipleResponses: false,
      maxResponsesPerParticipant: "",
      maxAnswerLength: "80",
      maxSelectableConcepts: "5",
      participantSlug: ""
    });
    await loadEventQuestions(selectedEventId);
    setActionMessage("Pregunta interactiva creada correctamente.");
  }

  async function changeQuestionStatus(question: EventQuestion, status: string) {
    if (!selectedEventId) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/questions/${question.id}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la pregunta.");
      return;
    }

    await loadEventQuestions(selectedEventId);
    setActionMessage("Estado de pregunta actualizado.");
  }

  async function toggleParticipantCloud(question: EventQuestion, show: boolean) {
    if (!selectedEventId) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/questions/${question.id}/participant-cloud`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ show })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la visibilidad de la nube.");
      return;
    }

    await loadEventQuestions(selectedEventId);
    setActionMessage(show ? "Nube visible para participantes." : "Nube oculta para participantes.");
  }

  function startQuestionEdit(question: EventQuestion) {
    setEditingQuestionId(question.id);
    setQuestionEditDraft({
      questionText: question.question_text,
      description: question.description ?? "",
      sessionId: question.session_id ?? "",
      allowMultipleResponses: Boolean(question.allow_multiple_responses),
      maxResponsesPerParticipant: question.max_responses_per_participant?.toString() ?? "",
      maxAnswerLength: question.max_answer_length.toString(),
      maxSelectableConcepts: question.max_selectable_concepts.toString(),
      participantSlug: question.participant_slug
    });
    setActionMessage(null);
  }

  function cancelQuestionEdit() {
    setEditingQuestionId(null);
    setQuestionEditDraft({
      questionText: "",
      description: "",
      sessionId: "",
      allowMultipleResponses: false,
      maxResponsesPerParticipant: "",
      maxAnswerLength: "80",
      maxSelectableConcepts: "5",
      participantSlug: ""
    });
  }

  async function saveQuestionEdit(question: EventQuestion, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;

    const response = await fetch(`/api/admin/events/${selectedEventId}/questions/${question.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText: questionEditDraft.questionText,
        description: questionEditDraft.description,
        sessionId: questionEditDraft.sessionId || null,
        allowMultipleResponses: questionEditDraft.allowMultipleResponses,
        maxResponsesPerParticipant: questionEditDraft.allowMultipleResponses && questionEditDraft.maxResponsesPerParticipant
          ? Number(questionEditDraft.maxResponsesPerParticipant)
          : null,
        maxAnswerLength: Number(questionEditDraft.maxAnswerLength) || 80,
        maxSelectableConcepts: Number(questionEditDraft.maxSelectableConcepts) || 5,
        participantSlug: questionEditDraft.participantSlug
      })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la pregunta.");
      return;
    }

    await loadEventQuestions(selectedEventId);
    cancelQuestionEdit();
    setActionMessage("Pregunta actualizada correctamente.");
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
    await loadFormTemplates();
    setActionMessage("Evento, cronograma y formulario creados correctamente.");
  }

  async function saveSelectedEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;

    setSavingEvent(true);
    setActionMessage(null);
    const eventResponse = await fetch(`/api/admin/events/${selectedEventId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventEditDraft)
    });
    const eventPayload = (await eventResponse.json()) as { ok: boolean; message?: string };

    if (!eventResponse.ok || !eventPayload.ok) {
      setSavingEvent(false);
      setActionMessage(eventPayload.message ?? "No se pudo actualizar el evento.");
      return;
    }

    const modelChanged = Boolean(
      associatedTemplateDraftId &&
      associatedTemplateDraftId !== (selectedEvent?.associated_template_id ?? "")
    );

    if (modelChanged) {
      const association = await updateEventFormTemplate(selectedEventId, associatedTemplateDraftId);

      if (!association.ok) {
        setSavingEvent(false);
        setActionMessage(association.message ?? "El evento se guardo, pero no se pudo cambiar el modelo asociado.");
        return;
      }
    }

    setSavingEvent(false);
    await loadEvents();
    await loadFormTemplates();
    setActionMessage(modelChanged
      ? "Evento y modelo asociado actualizados correctamente."
      : "Evento actualizado correctamente.");
  }

  async function updateEventFormTemplate(eventId: string, templateId: string) {
    const response = await fetch(`/api/admin/events/${eventId}/form-template`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    return {
      ok: response.ok && payload.ok,
      message: payload.message
    };
  }

  async function saveFormAssociation() {
    if (!selectedEventId || !associatedTemplateDraftId) return;

    setSavingFormAssociation(true);
    setActionMessage(null);
    const payload = await updateEventFormTemplate(selectedEventId, associatedTemplateDraftId);
    setSavingFormAssociation(false);

    if (!payload.ok) {
      setActionMessage(payload.message ?? "No se pudo asociar el formulario.");
      return;
    }

    await loadEvents();
    await loadFormTemplates();
    setActionMessage("Modelo de formulario asociado correctamente. El enlace y el QR del evento se conservaron.");
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0];
  const openSession = sessions.find((session) => session.attendance_status === "open");
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const selectedTemplate = formTemplates.find((template) => template.id === selectedTemplateId) ?? formTemplates[0];
  const selectedEventPublicUrl = selectedEvent ? `${window.location.origin}/f/${selectedEvent.short_link_slug}` : "";
  const selectedEventQrUrl = selectedEvent ? `${window.location.origin}/api/public/forms/${selectedEvent.short_link_slug}/qr` : "";
  const selectedCatalog = catalogs.find((catalog) => catalog.catalog_key === selectedCatalogKey) ?? catalogs[0];
  const activeFormTemplates = formTemplates.filter((template) => template.status === "active");
  const fieldTargetSection = templateSections.find((section) => section.id === templateFieldDraft.sectionId) ?? templateSections[0];
  const targetFields = fieldTargetSection?.fields ?? [];
  const editTargetSection = templateSections.find((section) => section.id === templateFieldEditDraft.sectionId) ?? templateSections[0];
  const editTargetFields = (editTargetSection?.fields ?? []).filter((field) => field.id !== editingFieldId);
  const selectedPaletteControl = controlPalette.find((control) => control.id === templateFieldDraft.controlDefinitionId);
  const addFieldSupportsTextValidation = selectedPaletteControl?.field_type === "text";
  const editingField = templateSections.flatMap((section) => section.fields).find((field) => field.id === editingFieldId);
  const editFieldSupportsTextValidation = editingField?.field_type === "text";

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
                    Modelo de formulario asociado
                    <select value={associatedTemplateDraftId} onChange={(event) => setAssociatedTemplateDraftId(event.target.value)}>
                      <option value="">Seleccione modelo activo</option>
                      {activeFormTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.section_count} secciones, {template.field_count} campos)
                        </option>
                      ))}
                    </select>
                    <small>{selectedEvent.associated_template_name ?? selectedEvent.associated_form_name ?? "Sin modelo activo asociado"}</small>
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
                  <button
                    className="button secondary"
                    type="button"
                    disabled={savingFormAssociation || !associatedTemplateDraftId}
                    onClick={() => void saveFormAssociation()}
                  >
                    {savingFormAssociation ? "Asociando..." : "Guardar solo modelo asociado"}
                  </button>
                  <a className="button secondary" href={`/f/${selectedEvent.short_link_slug}`}>Abrir formulario</a>
                  <a className="button secondary" href={`/api/admin/events/${selectedEvent.id}/attendance.xlsx`}>
                    Descargar asistencia
                  </a>
                </div>
              </form>
            </div>
          ) : null}

          {selectedEvent ? (
            <div className="admin-form-panel">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">Interacción en vivo</p>
                  <h3>Preguntas interactivas</h3>
                  <p>Publique preguntas para participantes registrados en la asistencia del evento y visualice una nube de respuestas.</p>
                </div>
              </div>

              <form className="builder-card" onSubmit={createQuestion}>
                <div className="builder-grid">
                  <label>
                    Pregunta
                    <input
                      value={questionDraft.questionText}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, questionText: event.target.value }))}
                      placeholder="Ejemplo: Describe este aprendizaje en una palabra"
                      required
                    />
                  </label>
                  <label>
                    Sesión asociada
                    <select value={questionDraft.sessionId} onChange={(event) => setQuestionDraft((current) => ({ ...current, sessionId: event.target.value }))}>
                      <option value="">Todo el evento</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>{session.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Enlace corto de pregunta
                    <input
                      value={questionDraft.participantSlug}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, participantSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                      placeholder="opcional"
                    />
                  </label>
                  <label className="wide-field">
                    Descripción
                    <input
                      value={questionDraft.description}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, description: event.target.value }))}
                    />
                  </label>
                  <label>
                    Máximo de caracteres
                    <input
                      min="10"
                      max="500"
                      type="number"
                      value={questionDraft.maxAnswerLength}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, maxAnswerLength: event.target.value }))}
                    />
                  </label>
                  <label>
                    Número de seleccionables
                    <input
                      min="1"
                      type="number"
                      value={questionDraft.maxSelectableConcepts}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, maxSelectableConcepts: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Máximo respuestas por participante
                    <input
                      min="1"
                      type="number"
                      value={questionDraft.maxResponsesPerParticipant}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, maxResponsesPerParticipant: event.target.value }))}
                      disabled={!questionDraft.allowMultipleResponses}
                    />
                  </label>
                  <label className="check-field">
                    <input
                      checked={questionDraft.allowMultipleResponses}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, allowMultipleResponses: event.target.checked }))}
                      type="checkbox"
                    />
                    Permitir mas de una respuesta
                  </label>
                </div>
                <div className="actions">
                  <button className="button secondary" type="submit">Crear pregunta</button>
                </div>
              </form>

              <div className="question-list">
                {eventQuestions.map((question) => {
                  const participantUrl = `${window.location.origin}/q/${question.participant_slug}`;
                  const presenterUrl = `${window.location.origin}/q/p/${question.presenter_slug}`;
                  const isEditingQuestion = editingQuestionId === question.id;
                  const hasResponses = question.response_count > 0;
                  return (
                    <div className={`question-card${isEditingQuestion ? " editing" : ""}`} key={question.id}>
                      {!isEditingQuestion ? (
                        <>
                          <div>
                            <strong>{question.question_text}</strong>
                            <span>{question.response_count} respuestas · {question.unique_participant_count} participantes · {question.status}</span>
                            <span>{question.show_participant_cloud ? "Nube visible para participantes" : "Nube oculta para participantes"}</span>
                            <a href={participantUrl}>{participantUrl}</a>
                            <a href={presenterUrl}>{presenterUrl}</a>
                          </div>
                          <div className="row-actions">
                            <button className="button secondary table-action" type="button" onClick={() => startQuestionEdit(question)}>Editar</button>
                            {question.show_participant_cloud ? (
                              <button className="button secondary table-action" type="button" onClick={() => void toggleParticipantCloud(question, false)}>Dejar de ver nube participante</button>
                            ) : (
                              <button className="button secondary table-action" type="button" onClick={() => void toggleParticipantCloud(question, true)}>Ver nube participante</button>
                            )}
                            <button className="button secondary table-action" type="button" onClick={() => void changeQuestionStatus(question, "open")}>Abrir</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeQuestionStatus(question, "closed")}>Cerrar</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeQuestionStatus(question, "archived")}>Archivar</button>
                          </div>
                        </>
                      ) : (
                        <form className="question-edit-form" onSubmit={(event) => void saveQuestionEdit(question, event)}>
                          <div className="builder-grid">
                            <label>
                              Pregunta
                              <input
                                value={questionEditDraft.questionText}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, questionText: event.target.value }))}
                                disabled={hasResponses}
                                required
                              />
                              {hasResponses ? <span className="field-hint">No puede modificarse porque ya existen respuestas registradas.</span> : null}
                            </label>
                            <label>
                              Sesión asociada
                              <select value={questionEditDraft.sessionId} onChange={(event) => setQuestionEditDraft((current) => ({ ...current, sessionId: event.target.value }))}>
                                <option value="">Todo el evento</option>
                                {sessions.map((session) => (
                                  <option key={session.id} value={session.id}>{session.title}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Enlace corto de pregunta
                              <input
                                value={questionEditDraft.participantSlug}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, participantSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                                disabled={hasResponses}
                                required
                              />
                              {hasResponses ? <span className="field-hint">No puede modificarse porque ya existen respuestas registradas.</span> : null}
                            </label>
                            <label className="wide-field">
                              Descripción
                              <input
                                value={questionEditDraft.description}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, description: event.target.value }))}
                              />
                            </label>
                            <label>
                              Máximo de caracteres
                              <input
                                min="10"
                                max="500"
                                type="number"
                                value={questionEditDraft.maxAnswerLength}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, maxAnswerLength: event.target.value }))}
                              />
                            </label>
                            <label>
                              Número de seleccionables
                              <input
                                min="1"
                                type="number"
                                value={questionEditDraft.maxSelectableConcepts}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, maxSelectableConcepts: event.target.value }))}
                                required
                              />
                            </label>
                            <label>
                              Máximo respuestas por participante
                              <input
                                min="1"
                                type="number"
                                value={questionEditDraft.maxResponsesPerParticipant}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, maxResponsesPerParticipant: event.target.value }))}
                                disabled={!questionEditDraft.allowMultipleResponses}
                              />
                            </label>
                            <label className="check-field">
                              <input
                                checked={questionEditDraft.allowMultipleResponses}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, allowMultipleResponses: event.target.checked }))}
                                type="checkbox"
                              />
                              Permitir más de una respuesta
                            </label>
                          </div>
                          <div className="question-edit-note">
                            <span>{question.response_count} respuestas registradas</span>
                            {hasResponses ? <span>Pregunta y enlace corto bloqueados por trazabilidad.</span> : <span>Pregunta y enlace corto aún pueden modificarse.</span>}
                          </div>
                          <div className="actions">
                            <button className="button" type="submit">Guardar pregunta</button>
                            <button className="button secondary" type="button" onClick={cancelQuestionEdit}>Cancelar</button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
                {eventQuestions.length === 0 ? <p className="blocked-message">No hay preguntas interactivas para este evento.</p> : null}
              </div>
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
              <p className="eyebrow">Plantillas reutilizables</p>
              <h2>Modelos de formulario</h2>
            </div>
            <div className="actions">
              <button className="button secondary" type="button" onClick={cloneSelectedTemplate} disabled={!selectedTemplate}>
                Clonar modelo
              </button>
            </div>
          </div>

          <div className="split-grid">
            <div className="list-panel">
              {formTemplates.map((template) => (
                <button
                  className={`list-row ${template.id === selectedTemplate?.id ? "selected" : ""}`}
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <strong>{template.name}</strong>
                  <span>{template.section_count} secciones · {template.field_count} campos</span>
                  <small>{template.status} · {template.active_publication_count > 0 ? `${template.active_publication_count} evento(s)` : "Libre"}</small>
                </button>
              ))}
            </div>

            <div className="detail-panel">
              {selectedTemplate ? (
                <>
                  <div className="detail-heading">
                    <div>
                      <h3>{selectedTemplate.name}</h3>
                      <p>{selectedTemplate.description ?? "Modelo reutilizable para formularios públicos de asistencia."}</p>
                    </div>
                    <span className={`status ${selectedTemplate.status === "active" ? "open" : "closed"}`}>
                      {selectedTemplate.status}
                    </span>
                  </div>
                  <form className="admin-form-panel compact-form" onSubmit={saveSelectedTemplate}>
                    <div className="form-grid">
                      <label className="wide-field">
                        Nombre del modelo
                        <input
                          value={templateEditDraft.name}
                          onChange={(event) => setTemplateEditDraft((current) => ({ ...current, name: event.target.value }))}
                          required
                        />
                      </label>
                      <label className="wide-field">
                        Descripción
                        <input
                          value={templateEditDraft.description}
                          onChange={(event) => setTemplateEditDraft((current) => ({ ...current, description: event.target.value }))}
                        />
                      </label>
                      <label>
                        Estado
                        <select
                          value={templateEditDraft.status}
                          onChange={(event) => setTemplateEditDraft((current) => ({ ...current, status: event.target.value }))}
                          disabled={selectedTemplate.active_publication_count > 0}
                        >
                          <option value="draft">Borrador</option>
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                          <option value="archived">Archivado</option>
                        </select>
                        {selectedTemplate.active_publication_count > 0 ? (
                          <small>Usado por eventos activos: primero cambie el modelo de esos eventos.</small>
                        ) : null}
                      </label>
                      <label>
                        Uso actual
                        <input
                          readOnly
                          value={selectedTemplate.active_publication_count > 0 ? `Asociado a ${selectedTemplate.active_publication_count} evento(s)` : "Libre / no publicado"}
                        />
                      </label>
                      <label>
                        Historial de uso
                        <input readOnly value={`${selectedTemplate.event_count} evento(s) en total`} />
                      </label>
                      <label>
                        Estructura
                        <input readOnly value={`${selectedTemplate.section_count} secciones / ${selectedTemplate.field_count} campos`} />
                      </label>
                    </div>
                    <div className="actions">
                      <button className="button" type="submit" disabled={savingTemplate}>
                        {savingTemplate ? "Guardando..." : "Guardar modelo"}
                      </button>
                    </div>
                  </form>
                  <div className="builder-panel">
                    <form className="builder-card" onSubmit={addSectionToTemplate}>
                      <div>
                        <h4>Agregar seccion</h4>
                        <p>Incorpore una seccion desde la paleta y defina su posicion.</p>
                      </div>
                      <div className="builder-grid">
                        <label>
                          Seccion de paleta
                          <select
                            value={templateSectionDraft.sectionDefinitionId}
                            onChange={(event) => {
                              const definition = sectionPalette.find((section) => section.id === event.target.value);
                              setTemplateSectionDraft((current) => ({
                                ...current,
                                sectionDefinitionId: event.target.value,
                                title: definition?.title ?? current.title
                              }));
                            }}
                          >
                            {sectionPalette.map((section) => (
                              <option key={section.id} value={section.id}>{section.title}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Titulo visible
                          <input
                            value={templateSectionDraft.title}
                            onChange={(event) => setTemplateSectionDraft((current) => ({ ...current, title: event.target.value }))}
                          />
                        </label>
                        <label>
                          Posicion
                          <select
                            value={templateSectionDraft.position}
                            onChange={(event) => setTemplateSectionDraft((current) => ({ ...current, position: event.target.value }))}
                          >
                            <option value="end">Al final</option>
                            <option value="start">Al inicio</option>
                            <option value="before">Antes de</option>
                            <option value="after">Despues de</option>
                          </select>
                        </label>
                        <label>
                          Referencia
                          <select
                            value={templateSectionDraft.targetSectionId}
                            onChange={(event) => setTemplateSectionDraft((current) => ({ ...current, targetSectionId: event.target.value }))}
                            disabled={!["before", "after"].includes(templateSectionDraft.position)}
                          >
                            <option value="">Seleccione</option>
                            {templateSections.map((section) => (
                              <option key={section.id} value={section.id}>{section.title}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="actions">
                        <button className="button secondary" type="submit" disabled={editingTemplateStructure || sectionPalette.length === 0}>
                          Agregar seccion
                        </button>
                      </div>
                    </form>

                    <form className="builder-card" onSubmit={addFieldToTemplate}>
                      <div>
                        <h4>Agregar control</h4>
                        <p>La etiqueta visible define la pregunta. El mismo control global puede repetirse con otra etiqueta.</p>
                      </div>
                      <div className="builder-grid">
                        <label>
                          Seccion destino
                          <select
                            value={templateFieldDraft.sectionId}
                            onChange={(event) => setTemplateFieldDraft((current) => ({ ...current, sectionId: event.target.value, targetFieldId: "" }))}
                          >
                            {templateSections.map((section) => (
                              <option key={section.id} value={section.id}>{section.title}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Control de paleta
                          <select
                            value={templateFieldDraft.controlDefinitionId}
                            onChange={(event) => {
                              const control = controlPalette.find((item) => item.id === event.target.value);
                              setTemplateFieldDraft((current) => ({
                                ...current,
                                controlDefinitionId: event.target.value,
                                label: control?.label ?? current.label,
                                isRequired: control ? Boolean(control.default_required) : current.isRequired,
                                textValidation: control?.field_type === "text" ? textValidationFromConfig(control.default_config) ?? "none" : "none"
                              }));
                            }}
                          >
                            {controlPalette.map((control) => (
                              <option key={control.id} value={control.id}>
                                {control.label}{control.catalog_key ? ` - ${control.catalog_key}` : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Etiqueta visible
                          <input
                            value={templateFieldDraft.label}
                            onChange={(event) => setTemplateFieldDraft((current) => ({ ...current, label: event.target.value }))}
                            required
                          />
                        </label>
                        <label>
                          Posicion
                          <select
                            value={templateFieldDraft.position}
                            onChange={(event) => setTemplateFieldDraft((current) => ({ ...current, position: event.target.value }))}
                          >
                            <option value="end">Al final</option>
                            <option value="start">Al inicio</option>
                            <option value="before">Antes de</option>
                            <option value="after">Despues de</option>
                          </select>
                        </label>
                        <label>
                          Referencia
                          <select
                            value={templateFieldDraft.targetFieldId}
                            onChange={(event) => setTemplateFieldDraft((current) => ({ ...current, targetFieldId: event.target.value }))}
                            disabled={!["before", "after"].includes(templateFieldDraft.position)}
                          >
                            <option value="">Seleccione</option>
                            {targetFields.map((field) => (
                              <option key={field.id} value={field.id}>{field.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="check-field">
                          <input
                            checked={templateFieldDraft.isRequired}
                            onChange={(event) => setTemplateFieldDraft((current) => ({ ...current, isRequired: event.target.checked }))}
                            type="checkbox"
                          />
                          Obligatorio
                        </label>
                        {addFieldSupportsTextValidation ? (
                          <label>
                            Validacion de texto
                            <select
                              value={templateFieldDraft.textValidation}
                              onChange={(event) => setTemplateFieldDraft((current) => ({ ...current, textValidation: event.target.value }))}
                            >
                              <option value="none">Sin validacion especial</option>
                              <option value="letters">Solo texto</option>
                              <option value="numbers">Solo numeros</option>
                            </select>
                          </label>
                        ) : null}
                      </div>
                      <div className="actions">
                        <button className="button secondary" type="submit" disabled={editingTemplateStructure || templateSections.length === 0 || controlPalette.length === 0}>
                          Agregar control
                        </button>
                      </div>
                    </form>

                    {editingFieldId ? (
                      <form className="builder-card highlighted" onSubmit={saveTemplateFieldEdit}>
                        <div>
                          <h4>Editar control</h4>
                          <p>Actualice etiqueta, obligatoriedad o posicion del control dentro del modelo.</p>
                        </div>
                        <div className="builder-grid">
                          <label>
                            Seccion destino
                            <select
                              value={templateFieldEditDraft.sectionId}
                              onChange={(event) => setTemplateFieldEditDraft((current) => ({ ...current, sectionId: event.target.value, targetFieldId: "" }))}
                            >
                              {templateSections.map((section) => (
                                <option key={section.id} value={section.id}>{section.title}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Etiqueta visible
                            <input
                              value={templateFieldEditDraft.label}
                              onChange={(event) => setTemplateFieldEditDraft((current) => ({ ...current, label: event.target.value }))}
                              required
                            />
                          </label>
                          <label>
                            Posicion
                            <select
                              value={templateFieldEditDraft.position}
                              onChange={(event) => setTemplateFieldEditDraft((current) => ({ ...current, position: event.target.value }))}
                            >
                              <option value="same">Mantener posicion</option>
                              <option value="end">Al final</option>
                              <option value="start">Al inicio</option>
                              <option value="before">Antes de</option>
                              <option value="after">Despues de</option>
                            </select>
                          </label>
                          <label>
                            Referencia
                            <select
                              value={templateFieldEditDraft.targetFieldId}
                              onChange={(event) => setTemplateFieldEditDraft((current) => ({ ...current, targetFieldId: event.target.value }))}
                              disabled={!["before", "after"].includes(templateFieldEditDraft.position)}
                            >
                              <option value="">Seleccione</option>
                              {editTargetFields.map((field) => (
                                <option key={field.id} value={field.id}>{field.label}</option>
                              ))}
                            </select>
                          </label>
                          <label className="check-field">
                            <input
                              checked={templateFieldEditDraft.isRequired}
                              onChange={(event) => setTemplateFieldEditDraft((current) => ({ ...current, isRequired: event.target.checked }))}
                              type="checkbox"
                            />
                            Obligatorio
                          </label>
                          {editFieldSupportsTextValidation ? (
                            <label>
                              Validacion de texto
                              <select
                                value={templateFieldEditDraft.textValidation}
                                onChange={(event) => setTemplateFieldEditDraft((current) => ({ ...current, textValidation: event.target.value }))}
                              >
                                <option value="none">Sin validacion especial</option>
                                <option value="letters">Solo texto</option>
                                <option value="numbers">Solo numeros</option>
                              </select>
                            </label>
                          ) : null}
                        </div>
                        <div className="actions">
                          <button className="button" type="submit" disabled={editingTemplateStructure}>
                            Guardar control
                          </button>
                          <button className="button secondary" type="button" onClick={cancelTemplateFieldEdit}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>

                  <div className="form-structure">
                    {templateSections.map((section) => (
                      <div className="structure-section" key={section.id}>
                        <div className="structure-section-heading">
                          <h4>{section.title}</h4>
                          <button className="text-button danger" type="button" onClick={() => void removeSectionFromTemplate(section.id)}>
                            Quitar seccion
                          </button>
                        </div>
                        <div className="field-grid">
                          {section.fields.map((field) => (
                            <div className="field-chip" key={field.id}>
                              <div>
                                <strong>{field.label}</strong>
                                <span>
                                  {field.field_type}
                                  {field.catalog_key ? ` · ${field.catalog_key}` : ""}
                                  {field.is_required ? " · obligatorio" : ""}
                                  {field.field_type === "text" && textValidationLabel(textValidationForField(field)) ? ` · ${textValidationLabel(textValidationForField(field))}` : ""}
                                </span>
                              </div>
                              <div className="field-chip-actions">
                                <button className="text-button" type="button" onClick={() => editTemplateField(section, field)}>
                                  Editar
                                </button>
                                <button className="text-button danger" type="button" onClick={() => void removeFieldFromTemplate(field.id)}>
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="blocked-message">No hay modelos de formulario configurados.</p>
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

          <form className="admin-form-panel compact-form" onSubmit={createCatalog}>
            <div className="detail-heading">
              <div>
                <h3>Crear catalogo para nuevo select</h3>
                <p>El catalogo nuevo crea automaticamente un control tipo select en la paleta de modelos.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Clave del catalogo
                <input
                  value={newCatalogDraft.catalogKey}
                  onChange={(event) => setNewCatalogDraft((current) => ({ ...current, catalogKey: event.target.value }))}
                  placeholder="ejemplo: tipoinstitucion"
                  required
                />
              </label>
              <label>
                Nombre del catalogo
                <input
                  value={newCatalogDraft.catalogName}
                  onChange={(event) => setNewCatalogDraft((current) => ({ ...current, catalogName: event.target.value }))}
                  placeholder="Tipo de institucion"
                  required
                />
              </label>
              <label>
                Nombre en paleta
                <input
                  value={newCatalogDraft.controlLabel}
                  onChange={(event) => setNewCatalogDraft((current) => ({ ...current, controlLabel: event.target.value }))}
                  placeholder="Tipo de institucion"
                  required
                />
              </label>
              <label className="wide-field">
                Descripcion
                <input
                  value={newCatalogDraft.description}
                  onChange={(event) => setNewCatalogDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Descripcion opcional"
                />
              </label>
            </div>
            <div className="actions">
              <button className="button" type="submit" disabled={savingCatalog}>
                {savingCatalog ? "Creando..." : "Crear catalogo y control"}
              </button>
            </div>
          </form>

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
                  <small>{catalog.status}</small>
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
                    <button className="button secondary" type="button" onClick={() => void toggleCatalogStatus(selectedCatalog)}>
                      {selectedCatalog.status === "active" ? "Inactivar catalogo" : "Activar catalogo"}
                    </button>
                  </div>
                  <form className="admin-form-panel compact-form embedded-form" onSubmit={saveCatalogDetails}>
                    <div className="detail-heading">
                      <div>
                        <h4>Editar catalogo</h4>
                        <p>Actualice la clave, nombre descriptivo y nombre visible en la paleta de controles.</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label>
                        Clave del catalogo
                        <input
                          value={catalogEditDraft.catalogKey}
                          onChange={(event) => setCatalogEditDraft((current) => ({ ...current, catalogKey: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        Nombre del catalogo
                        <input
                          value={catalogEditDraft.catalogName}
                          onChange={(event) => setCatalogEditDraft((current) => ({ ...current, catalogName: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        Nombre en paleta
                        <input
                          value={catalogEditDraft.controlLabel}
                          onChange={(event) => setCatalogEditDraft((current) => ({ ...current, controlLabel: event.target.value }))}
                          required
                        />
                      </label>
                      <label className="wide-field">
                        Descripcion
                        <input
                          value={catalogEditDraft.description}
                          onChange={(event) => setCatalogEditDraft((current) => ({ ...current, description: event.target.value }))}
                        />
                      </label>
                    </div>
                    <div className="actions">
                      <button className="button secondary" type="submit" disabled={savingCatalog}>
                        {savingCatalog ? "Guardando..." : "Guardar catalogo"}
                      </button>
                    </div>
                  </form>
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
                        {editingCatalogItemId === item.id ? (
                          <>
                            <div className="catalog-item-edit">
                              <input
                                value={catalogItemEditDraft.name}
                                onChange={(event) => setCatalogItemEditDraft((current) => ({ ...current, name: event.target.value }))}
                                aria-label="Nombre del elemento"
                              />
                              <input
                                value={catalogItemEditDraft.description}
                                onChange={(event) => setCatalogItemEditDraft((current) => ({ ...current, description: event.target.value }))}
                                aria-label="Descripcion del elemento"
                              />
                            </div>
                            <div className="row-actions">
                              <button className="button secondary table-action" type="button" onClick={() => void saveCatalogItem(item.id)}>
                                Guardar
                              </button>
                              <button className="button secondary table-action" type="button" onClick={cancelCatalogItemEdit}>
                                Cancelar
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <strong>{item.name}</strong>
                              <span>{item.description}</span>
                            </div>
                            <div className="row-actions">
                              <button className="button secondary table-action" type="button" onClick={() => startCatalogItemEdit(item)}>
                                Editar
                              </button>
                              <button className="button secondary table-action" type="button" onClick={() => toggleCatalogItem(item)}>
                                {item.status === "active" ? "Inactivar" : "Activar"}
                              </button>
                            </div>
                          </>
                        )}
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

  function publicFieldByKey(fieldKey: string) {
    return data?.sections?.flatMap((section) => section.fields).find((field) => field.field_key === fieldKey);
  }

  function updateField(fieldKey: string, value: string) {
    const sanitizedValue = sanitizeFieldValue(fieldKey, value, publicFieldByKey(fieldKey));
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

  function sanitizeFieldValue(fieldKey: string, value: string, field?: PublicFormField) {
    const textValidation = field ? textValidationForField(field) : legacyTextValidation(fieldKey);

    if (textValidation === "numbers") {
      return value.replace(/\D/g, "");
    }

    if (textValidation === "letters") {
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

    if (currentPublicSection?.section_key === "datos_generales" && !isEmailValid(currentPublicSection)) {
      setMessage("Ingrese un correo electrónico válido, por ejemplo nombre@dominio.com.");
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

  function isEmailValid(section: PublicFormSection) {
    const emailField = section.fields.find((field) => field.field_key === "datos_generales_correo_electronico");
    if (!emailField) return true;

    const email = fields.datos_generales_correo_electronico?.trim() ?? "";
    if (!email) return !Boolean(emailField.is_required);

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function normalizedPublicText(value: string | null | undefined) {
    return cleanText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function isActivityProductField(field: PublicFormField | string) {
    const fieldKey = typeof field === "string" ? field : field.field_key;
    const label = typeof field === "string" ? "" : normalizedPublicText(field.label);

    return [
      "actividad_producto_agrario",
      "actividad_productos_pecuario",
      "actividad_productos_forestales"
    ].includes(fieldKey) || label === "principal producto";
  }

  function updateProducerAnswer(value: string) {
    setFields((current) => {
      if (value !== "SI") {
        const productFieldKeys = data?.sections
          ?.flatMap((section) => section.fields)
          .filter((field) => isActivityProductField(field))
          .map((field) => field.field_key) ?? [];
        const next: Record<string, string> = { ...current, actividad_es_productor_agrario_pecuario_forestal: value };

        productFieldKeys.forEach((fieldKey) => {
          delete next[fieldKey];
        });

        return next;
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

                  if (isActivityProductField(field) && fields.actividad_es_productor_agrario_pecuario_forestal !== "SI") {
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
                            Es Productor Agrícola, Pecuario o Forestal
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

function participantName(participant: PublicParticipant | null) {
  if (!participant) return "";
  return [participant.first_name, participant.paternal_last_name, participant.maternal_last_name].filter(Boolean).join(" ");
}

function QuestionParticipantView({ slug }: { slug: string }) {
  const [question, setQuestion] = React.useState<EventQuestion | null>(null);
  const [participantSummary, setParticipantSummary] = React.useState<QuestionSummaryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [documentType, setDocumentType] = React.useState("DNI/CEDULA");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [participant, setParticipant] = React.useState<PublicParticipant | null>(null);
  const [attendanceUrl, setAttendanceUrl] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [personalAnswers, setPersonalAnswers] = React.useState<string[]>([]);
  const [personalSelections, setPersonalSelections] = React.useState<QuestionSelectionItem[]>([]);
  const [message, setMessage] = React.useState("");
  const [selectionMessage, setSelectionMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadQuestion() {
      setLoading(true);
      const response = await fetch(`/api/public/questions/${slug}`);
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; question?: EventQuestion; message?: string } | null;
      setLoading(false);
      if (!response.ok || !payload?.ok || !payload.question) {
        setMessage(payload?.message ?? "Pregunta no disponible.");
        return;
      }
      setQuestion(payload.question);
    }

    void loadQuestion();
  }, [slug]);

  React.useEffect(() => {
    let active = true;

    async function loadParticipantCloud() {
      const response = await fetch(`/api/public/questions/${slug}/summary`);
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        question?: EventQuestion;
        summary?: QuestionSummaryItem[];
      } | null;

      if (!active || !response.ok || !payload?.ok || !payload.question) return;
      setQuestion(payload.question);
      setParticipantSummary(payload.summary ?? []);
    }

    void loadParticipantCloud();
    const interval = window.setInterval(loadParticipantCloud, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [slug]);

  async function identify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSelectionMessage("");
    setAttendanceUrl("");
    setParticipant(null);
    setPersonalAnswers([]);
    setPersonalSelections([]);

    const response = await fetch(`/api/public/questions/${slug}/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber })
    });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      canParticipate?: boolean;
      participant?: PublicParticipant | null;
      responses?: Array<{ answer_text: string }>;
      selections?: QuestionSelectionItem[];
      attendanceUrl?: string;
      message?: string;
    } | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "No se pudo validar el documento.");
      return;
    }

    if (!payload.canParticipate) {
      setAttendanceUrl(payload.attendanceUrl ?? "");
      setMessage("No encontramos una asistencia registrada para este evento. Primero registre su asistencia.");
      return;
    }

    setParticipant(payload.participant ?? null);
    setPersonalAnswers((payload.responses ?? []).map((item) => item.answer_text));
    setPersonalSelections(payload.selections ?? []);
  }

  async function submitAnswer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question || !participant) return;

    setSubmitting(true);
    setMessage("");
    const submittedAnswer = answer.trim();
    const response = await fetch(`/api/public/questions/${slug}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber, answer })
    });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      message?: string;
      response?: { answer_text: string };
    } | null;
    setSubmitting(false);

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "No se pudo registrar la respuesta.");
      return;
    }

    setAnswer("");
    setPersonalAnswers((current) => [...current, payload.response?.answer_text ?? submittedAnswer]);
    setMessage(payload.message ?? "Respuesta registrada correctamente.");
  }

  async function selectCloudConcept(item: QuestionSummaryItem) {
    if (!question || !participant) return;
    setSelectionMessage("");

    if (personalSelections.some((selection) => selection.normalized_answer === item.normalized_answer)) {
      setSelectionMessage("Este concepto ya fue seleccionado.");
      return;
    }

    if (personalSelections.length >= question.max_selectable_concepts) {
      setSelectionMessage("Ya seleccionaste el máximo de conceptos permitidos.");
      return;
    }

    const response = await fetch(`/api/public/questions/${slug}/selections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType,
        documentNumber,
        normalizedAnswer: item.normalized_answer,
        displayAnswer: item.answer
      })
    });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      message?: string;
      selection?: QuestionSelectionItem;
    } | null;

    if (!response.ok || !payload?.ok || !payload.selection) {
      setSelectionMessage(payload?.message ?? "No se pudo seleccionar el concepto.");
      return;
    }

    setPersonalSelections((current) => [...current, payload.selection as QuestionSelectionItem]);
  }

  async function removeCloudSelection(selection: QuestionSelectionItem) {
    if (!question || !participant) return;
    setSelectionMessage("");

    const response = await fetch(`/api/public/questions/${slug}/selections/${selection.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

    if (!response.ok || !payload?.ok) {
      setSelectionMessage(payload?.message ?? "No se pudo quitar el concepto.");
      return;
    }

    setPersonalSelections((current) => current.filter((item) => item.id !== selection.id));
  }

  if (loading) return <PublicMessage title="Cargando pregunta" message="Estamos preparando la interacción." />;
  if (!question) return <PublicMessage title="Pregunta no disponible" message={message || "No se pudo cargar la pregunta."} />;

  const isOpen = question.status === "open";
  const participantCloudMaxCount = participantSummary.reduce((max, item) => Math.max(max, item.count), 1);
  const participantCloudPalette = ["#2563eb", "#ef476f", "#06a77d", "#f59e0b", "#7c3aed", "#0891b2"];
  const personalAnswerLimit = question.allow_multiple_responses
    ? question.max_responses_per_participant?.toString() ?? "sin límite"
    : "1";

  return (
    <main className="question-participant-page">
      <section className="question-participant-stage">
        <p className="eyebrow">{question.event_title}</p>
        <h1>{question.question_text}</h1>
        {question.description ? <p className="presenter-description">{question.description}</p> : null}

        {!isOpen ? (
          <p className="blocked-message">Esta pregunta no está abierta para recibir respuestas.</p>
        ) : null}

        {isOpen && !participant ? (
          <div className="question-identify-panel">
            <p>Para participar debe haber registrado su asistencia. Identifíquese.</p>
            <form className="question-identify-form" onSubmit={identify}>
              <label>
                Tipo de documento
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} required>
                  <option value="DNI/CEDULA">DNI/CEDULA</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                  <option value="CARNET EXTRANJERIA">CARNET EXTRANJERIA</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </label>
              <label>
                Número de documento
                <input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} required />
              </label>
              <button className="button" type="submit">Continuar</button>
            </form>
          </div>
        ) : null}

        {isOpen && participant ? (
          <form className="question-answer-form" onSubmit={submitAnswer}>
            <p className="question-greeting">
              <strong>Hola, {participantName(participant)}</strong>. Escriba su respuesta para verla reflejada en la nube.
            </p>
            <label>
              Respuesta
              <textarea
                maxLength={question.max_answer_length}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Escriba una palabra o frase corta"
                required
              />
              <span className="field-hint">{answer.length} / {question.max_answer_length}</span>
            </label>
            <div className="form-navigation">
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setParticipant(null);
                  setPersonalAnswers([]);
                  setPersonalSelections([]);
                  setMessage("");
                  setSelectionMessage("");
                  setAnswer("");
                }}
                disabled={submitting}
              >
                Cambiar documento
              </button>
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar respuesta"}
              </button>
            </div>
          </form>
        ) : null}

        {message ? <p className={attendanceUrl ? "blocked-message" : "form-success"}>{message}</p> : null}
        {!attendanceUrl && participant ? (
          <div className="personal-answer-panel" aria-live="polite">
            <p>Respuestas individuales {personalAnswers.length} / {personalAnswerLimit}</p>
            {personalAnswers.length > 0 ? (
              <div className="personal-answers">
                {personalAnswers.map((item, index) => (
                  <div className="personal-answer" key={`${index}-${item}`}>
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {!attendanceUrl && participant && question.show_participant_cloud ? (
          <div className="participant-cloud-panel" aria-live="polite">
            {participantSummary.length > 0 ? (
              <div className="word-cloud participant-word-cloud" aria-label="Nube de respuestas de participantes">
                {participantSummary.map((item, index) => {
                  const size = 20 + Math.round((item.count / participantCloudMaxCount) * 42);
                  const selected = personalSelections.some((selection) => selection.normalized_answer === item.normalized_answer);
                  return (
                    <button
                      className={`cloud-selectable${selected ? " selected" : ""}`}
                      key={item.normalized_answer}
                      onClick={() => void selectCloudConcept(item)}
                      style={{ color: participantCloudPalette[index % participantCloudPalette.length], fontSize: `${size}px` }}
                      title={`${item.count} respuestas`}
                      type="button"
                    >
                      {item.answer}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="empty-cloud participant-empty-cloud">Esperando respuestas para construir la nube...</p>
            )}
            <div className="selection-panel">
              <p>Conceptos seleccionados {personalSelections.length} / {question.max_selectable_concepts}</p>
              {personalSelections.length > 0 ? (
                <div className="selected-concepts">
                  {personalSelections.map((selection) => (
                    <div className="selected-concept" key={selection.id}>
                      <span>{selection.display_answer}</span>
                      <button
                        aria-label={`Quitar ${selection.display_answer}`}
                        onClick={() => void removeCloudSelection(selection)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="selection-empty">Seleccione conceptos desde la nube.</span>
              )}
              {selectionMessage ? <span className="selection-message">{selectionMessage}</span> : null}
            </div>
          </div>
        ) : null}
        {attendanceUrl ? <a className="button secondary" href={attendanceUrl}>Registrar asistencia</a> : null}
      </section>
    </main>
  );
}

function QuestionPresenterView({ slug }: { slug: string }) {
  const [question, setQuestion] = React.useState<EventQuestion | null>(null);
  const [summary, setSummary] = React.useState<QuestionSummaryItem[]>([]);
  const [selectionGroups, setSelectionGroups] = React.useState<QuestionSelectionGroup[]>([]);
  const [selectionPage, setSelectionPage] = React.useState(0);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function loadSummary() {
      const response = await fetch(`/api/public/question-presenter/${slug}/summary`);
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        question?: EventQuestion;
        summary?: QuestionSummaryItem[];
        selectionGroups?: QuestionSelectionGroup[];
        message?: string;
      } | null;

      if (!active) return;
      if (!response.ok || !payload?.ok || !payload.question) {
        setMessage(payload?.message ?? "Pregunta no disponible.");
        return;
      }

      setQuestion(payload.question);
      setSummary(payload.summary ?? []);
      setSelectionGroups(payload.selectionGroups ?? []);
      setMessage("");
    }

    void loadSummary();
    const interval = window.setInterval(loadSummary, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [slug]);

  if (!question) return <PublicMessage title="Vista de presentación" message={message || "Cargando respuestas."} />;

  const maxCount = summary.reduce((max, item) => Math.max(max, item.count), 1);
  const palette = ["#2563eb", "#ef476f", "#06a77d", "#f59e0b", "#7c3aed", "#0891b2"];
  const selectionPageSize = 32;
  const totalSelectionPages = Math.max(1, Math.ceil(selectionGroups.length / selectionPageSize));
  const currentSelectionPage = Math.min(selectionPage, totalSelectionPages - 1);
  const visibleSelectionGroups = selectionGroups.slice(
    currentSelectionPage * selectionPageSize,
    currentSelectionPage * selectionPageSize + selectionPageSize
  );

  return (
    <main className="presenter-page">
      <section className="presenter-stage">
        <p className="eyebrow">{question.event_title}</p>
        <h1>{question.question_text}</h1>
        {question.description ? <p className="presenter-description">{question.description}</p> : null}
        {summary.length > 0 ? (
          <div
            className={`word-cloud${question.show_participant_cloud ? " compact-cloud" : ""}`}
            aria-label="Nube de respuestas"
          >
            {summary.map((item, index) => {
              const size = 22 + Math.round((item.count / maxCount) * 56);
              return (
                <span
                  key={item.normalized_answer}
                  style={{ color: palette[index % palette.length], fontSize: `${size}px` }}
                  title={`${item.count} respuestas`}
                >
                  {item.answer}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="empty-cloud">Esperando respuestas...</p>
        )}
        {question.show_participant_cloud ? (
          <section className="presenter-selection-board" aria-live="polite">
            <div className="presenter-selection-heading">
              <h2>Conceptos seleccionados</h2>
              <span>{selectionGroups.length} participantes</span>
            </div>
            {selectionGroups.length > 0 ? (
              <>
                <div className="presenter-selection-grid">
                  {visibleSelectionGroups.map((group) => (
                    <article className="presenter-selection-card" key={group.participant_id}>
                      <strong>{group.participant_name}</strong>
                      <div>
                        {group.selections
                          .split("||")
                          .filter(Boolean)
                          .map((selection, index) => (
                            <span key={`${group.participant_id}-${index}-${selection}`}>{selection}</span>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
                {totalSelectionPages > 1 ? (
                  <div className="presenter-pagination">
                    <button
                      type="button"
                      disabled={currentSelectionPage === 0}
                      onClick={() => setSelectionPage((current) => Math.max(0, current - 1))}
                    >
                      Anterior
                    </button>
                    <span>
                      {currentSelectionPage + 1} / {totalSelectionPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentSelectionPage >= totalSelectionPages - 1}
                      onClick={() => setSelectionPage((current) => Math.min(totalSelectionPages - 1, current + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="presenter-selection-empty">Esperando selecciones de participantes...</p>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
