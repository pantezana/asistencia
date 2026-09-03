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

type ResourceRegistrationResponse = PublicFormResponse & {
  registrationMode?: string;
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
  country_of_schedule: string | null;
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
  country_of_schedule: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  attendance_status: string;
  module_title: string;
  dashboard_items?: EventDashboardItem[];
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

const fallbackDocumentTypeOptions: CatalogItem[] = [
  { id: "DNI", name: "DNI", description: null, status: "active" },
  { id: "CE", name: "CE", description: null, status: "active" },
  { id: "PAS", name: "PAS", description: null, status: "active" },
  { id: "OTRO", name: "OTRO", description: null, status: "active" }
];

type EventSessionDraft = {
  moduleTitle: string;
  title: string;
  theme: string;
  countryOfSchedule: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  dashboardItems: DashboardItemDraft[];
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
  browser_title: string | null;
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

type EventBoardInstruction = {
  id?: string;
  language_label: string | null;
  content_html: string;
  content_text?: string;
  sort_order: number;
};

type EventBoard = {
  id: string;
  event_id: string;
  session_id: string | null;
  title: string;
  browser_title: string | null;
  status: string;
  participant_slug: string;
  presenter_slug: string;
  max_note_length: number;
  allow_multiple_notes: number;
  max_notes_per_participant: number | null;
  note_count: number;
  event_title?: string;
  event_slug?: string;
  instructions?: EventBoardInstruction[];
};

type EventBoardNote = {
  id: string;
  first_name: string;
  last_name: string;
  country_name: string;
  country_iso2: string | null;
  note_html: string;
  note_text: string;
  note_excerpt: string;
  created_at: string;
};

type EventSurveyOption = {
  id?: string;
  question_id?: string;
  option_text: string;
  sort_order: number;
  status: string;
  vote_count?: number;
};

type EventSurveyQuestion = {
  id?: string;
  survey_id?: string;
  question_text: string;
  description: string | null;
  allow_multiple_answers: number;
  max_answers_per_participant: number;
  chart_type: string;
  sort_order: number;
  status: string;
  vote_count?: number;
  participant_count?: number;
  options?: EventSurveyOption[];
};

type EventSurvey = {
  id: string;
  event_id: string;
  session_id: string | null;
  title: string;
  browser_title: string | null;
  participant_slug: string;
  status: string;
  question_count: number;
  vote_count: number;
  participant_count: number;
  event_title?: string;
  event_slug?: string;
  questions?: EventSurveyQuestion[];
};

type SurveyOptionDraft = {
  id?: string;
  optionText: string;
  sortOrder: number;
  status: string;
};

type SurveyQuestionDraft = {
  id?: string;
  questionText: string;
  description: string;
  allowMultipleAnswers: boolean;
  maxAnswersPerParticipant: string;
  chartType: string;
  sortOrder: number;
  status: string;
  options: SurveyOptionDraft[];
};

type EventDashboardInstruction = {
  id?: string;
  language_label: string | null;
  content_html: string;
  content_text?: string;
  sort_order: number;
  status: string;
};

type EventDashboardItem = {
  id?: string;
  session_id: string | null;
  scope: "event" | "session";
  name: string;
  icon_key?: string;
  value_type: "text" | "link";
  value: string;
  is_private?: number;
  visibility: "public" | "private";
  sort_order: number;
  status: string;
};

type DashboardItemDraft = {
  sessionId: string;
  name: string;
  iconKey: string;
  valueType: string;
  value: string;
  visibility: string;
  sortOrder: number;
  status: string;
};

const DASHBOARD_ITEM_ICONS = [
  { key: "none", label: "Ninguno", symbol: "" },
  { key: "photos", label: "Fotografías", symbol: "📷" },
  { key: "infographic", label: "Infografía", symbol: "📊" },
  { key: "presentations", label: "Ponencias", symbol: "📊" },
  { key: "video", label: "Video", symbol: "▶️" },
  { key: "pdf", label: "PDF", symbol: "📄" },
  { key: "word", label: "Word", symbol: "📝" },
  { key: "excel", label: "Excel", symbol: "📗" },
  { key: "image", label: "Imagen", symbol: "🖼️" },
  { key: "drive", label: "Drive", symbol: "☁️" },
  { key: "url", label: "URL", symbol: "🔗" },
  { key: "board", label: "Pizarra", symbol: "🗒️" },
  { key: "question", label: "Pregunta", symbol: "❓" },
  { key: "people", label: "Personas", symbol: "👥" },
  { key: "forum", label: "Foro", symbol: "💬" },
  { key: "cloud", label: "Nube", symbol: "☁️" },
  { key: "whatsapp", label: "WhatsApp", symbol: "", className: "brand-icon whatsapp-icon" },
  { key: "youtube", label: "YouTube", symbol: "📺" },
  { key: "email", label: "Correo", symbol: "✉️" },
  { key: "phone", label: "Celular", symbol: "📱" },
  { key: "videocall", label: "Videollamada", symbol: "📹" },
  { key: "zoom", label: "Zoom", symbol: "", className: "brand-icon zoom-icon" },
  { key: "meet", label: "Meet", symbol: "💻" },
  { key: "web", label: "Web", symbol: "🌐" },
  { key: "tree", label: "Árbol", symbol: "🌳" }
];

function getDashboardItemIcon(key?: string | null) {
  return DASHBOARD_ITEM_ICONS.find((icon) => icon.key === key) ?? DASHBOARD_ITEM_ICONS[0];
}

function getSessionStatusClass(status: string) {
  return status === "open" ? "open" : status === "inactive" ? "inactive" : "closed";
}

function getSessionStatusLabel(status: string, feminine = false) {
  if (status === "open") return feminine ? "Abierta" : "Abierto";
  if (status === "inactive") return "Inactiva";
  return feminine ? "Cerrada" : "Cerrado";
}

type EventDashboardSession = AdminSession & {
  module_order: number;
  items?: EventDashboardItem[];
};

type EventDashboard = {
  id: string;
  event_id: string;
  title: string;
  browser_title: string | null;
  short_link_slug: string;
  status: string;
  event_title?: string;
  event_slug?: string;
  instructions?: EventDashboardInstruction[];
  eventItems?: EventDashboardItem[];
  sessionItems?: EventDashboardItem[];
  sessions?: EventDashboardSession[];
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

function stripHtml(value: string) {
  const element = document.createElement("div");
  element.innerHTML = value;
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function formatSessionDateTime(sessionDate: string, startTime: string, endTime: string, countryOfSchedule?: string | null) {
  const datePart = cleanText(sessionDate).trim();
  const startPart = cleanText(startTime).trim();
  const endPart = cleanText(endTime).trim();
  const countryPart = cleanText(countryOfSchedule ?? "").trim();

  const timePart = [startPart, endPart].filter(Boolean).join(" - ");
  const base = [datePart, timePart].filter(Boolean).join(" ");

  return countryPart ? `${base} (${countryPart})` : base;
}

function sanitizeClientHtml(value: string) {
  const template = document.createElement("template");
  template.innerHTML = value;
  template.content.querySelectorAll("script, style, iframe, img, video, audio, object, embed, form").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (attribute.name.startsWith("on") || attribute.name === "style") node.removeAttribute(attribute.name);
      if (node.tagName.toLowerCase() === "a" && attribute.name === "href" && !/^https?:\/\//i.test(attribute.value)) {
        node.removeAttribute("href");
      }
    });
  });
  return template.innerHTML;
}

function countryFlag(countryName: string, iso2?: string | null) {
  const code = (iso2 || countryIsoMap[cleanText(countryName).toLowerCase()] || "").toUpperCase();
  if (code.length !== 2) return "🌎";
  return [...code].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("");
}

function countryCode(countryName: string, iso2?: string | null) {
  return (iso2 || countryIsoMap[cleanText(countryName).toLowerCase()] || "").toUpperCase();
}

function FlagMark({ countryName, iso2 }: { countryName: string; iso2?: string | null }) {
  const code = countryCode(countryName, iso2);
  const cssFlagCodes = new Set(["BO", "BR", "CL", "CO", "EC", "GY", "HN", "PE", "SR", "US", "VE"]);
  if (cssFlagCodes.has(code)) {
    return <span className={`flag-mark flag-css flag-${code.toLowerCase()}`} aria-label={`Bandera de ${countryName}`} title={countryName} />;
  }
  return <span className="flag-mark flag-emoji" aria-label={`Bandera de ${countryName}`}>{countryFlag(countryName, iso2)}</span>;
}

const countryIsoMap: Record<string, string> = {
  argentina: "AR",
  bolivia: "BO",
  brasil: "BR",
  brazil: "BR",
  canada: "CA",
  chile: "CL",
  colombia: "CO",
  "costa rica": "CR",
  cuba: "CU",
  ecuador: "EC",
  "el salvador": "SV",
  "estados unidos": "US",
  "estados unidos de america": "US",
  guatemala: "GT",
  guyana: "GY",
  honduras: "HN",
  mexico: "MX",
  nicaragua: "NI",
  panama: "PA",
  paraguay: "PY",
  peru: "PE",
  "perú": "PE",
  "puerto rico": "PR",
  "republica dominicana": "DO",
  "república dominicana": "DO",
  surinam: "SR",
  suriname: "SR",
  uruguay: "UY",
  venezuela: "VE",
  alemania: "DE",
  espana: "ES",
  españa: "ES",
  francia: "FR",
  italia: "IT",
  portugal: "PT",
  "reino unido": "GB",
  china: "CN",
  india: "IN",
  indonesia: "ID",
  japon: "JP",
  japón: "JP"
};

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

  if (path.startsWith("/b/p/")) {
    return <BoardPresenterView slug={path.replace("/b/p/", "")} />;
  }

  if (path.startsWith("/b/")) {
    return <BoardParticipantView slug={path.replace("/b/", "")} />;
  }

  if (path.startsWith("/s/")) {
    return <SurveyPublicView slug={path.replace("/s/", "")} />;
  }

  if (path.startsWith("/t/")) {
    return <DashboardPublicView slug={path.replace("/t/", "")} />;
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
  const [eventBoards, setEventBoards] = React.useState<EventBoard[]>([]);
  const [eventSurveys, setEventSurveys] = React.useState<EventSurvey[]>([]);
  const [eventDashboard, setEventDashboard] = React.useState<EventDashboard | null>(null);
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
    countryOfSchedule: "",
    startDate: "",
    endDate: "",
    startTime: "08:00",
    endTime: "17:00"
  });
  const [sessionDrafts, setSessionDrafts] = React.useState<EventSessionDraft[]>([
    { moduleTitle: "MÃ³dulo general", title: "SesiÃ³n 1", theme: "", countryOfSchedule: "", sessionDate: "", startTime: "08:00", endTime: "17:00", dashboardItems: [] }
  ]);
  const [eventEditDraft, setEventEditDraft] = React.useState({
    title: "",
    shortLinkSlug: "",
    theme: "",
    countryOfSchedule: "",
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
    countryOfSchedule: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    status: "closed",
    dashboardItems: [] as DashboardItemDraft[]
  });
  const [questionDraft, setQuestionDraft] = React.useState({
    questionText: "",
    browserTitle: "",
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
    browserTitle: "",
    description: "",
    sessionId: "",
    allowMultipleResponses: false,
    maxResponsesPerParticipant: "",
    maxAnswerLength: "80",
    maxSelectableConcepts: "5",
    participantSlug: ""
  });
  const emptyBoardInstruction = { languageLabel: "Espanol", contentHtml: "<p></p>", sortOrder: 1 };
  const [boardDraft, setBoardDraft] = React.useState({
    title: "",
    browserTitle: "",
    sessionId: "",
    participantSlug: "",
    maxNoteLength: "800",
    allowMultipleNotes: false,
    maxNotesPerParticipant: "1",
    instructions: [emptyBoardInstruction]
  });
  const [editingBoardId, setEditingBoardId] = React.useState<string | null>(null);
  const [boardEditDraft, setBoardEditDraft] = React.useState({
    title: "",
    browserTitle: "",
    sessionId: "",
    participantSlug: "",
    maxNoteLength: "800",
    allowMultipleNotes: false,
    maxNotesPerParticipant: "1",
    instructions: [emptyBoardInstruction]
  });
  const emptySurveyQuestion = (): SurveyQuestionDraft => ({
    questionText: "",
    description: "",
    allowMultipleAnswers: false,
    maxAnswersPerParticipant: "1",
    chartType: "bar",
    sortOrder: 1,
    status: "active",
    options: [
      { optionText: "", sortOrder: 1, status: "active" },
      { optionText: "", sortOrder: 2, status: "active" }
    ]
  });
  const [surveyDraft, setSurveyDraft] = React.useState({
    title: "",
    browserTitle: "",
    sessionId: "",
    participantSlug: "",
    questions: [emptySurveyQuestion()]
  });
  const [editingSurveyId, setEditingSurveyId] = React.useState<string | null>(null);
  const [surveyEditDraft, setSurveyEditDraft] = React.useState({
    title: "",
    browserTitle: "",
    sessionId: "",
    participantSlug: "",
    status: "draft",
    questions: [emptySurveyQuestion()]
  });
  const emptyDashboardInstruction = { languageLabel: "", contentHtml: "<p></p>", sortOrder: 1, status: "active" };
  const emptyDashboardItem: DashboardItemDraft = { sessionId: "", name: "", iconKey: "none", valueType: "text", value: "", visibility: "public", sortOrder: 1, status: "active" };
  const [dashboardDraft, setDashboardDraft] = React.useState({
    title: "",
    browserTitle: "",
    shortLinkSlug: "",
    status: "draft",
    instructions: [] as Array<typeof emptyDashboardInstruction>,
    eventItems: [] as Array<typeof emptyDashboardItem>,
    sessionItems: [] as Array<typeof emptyDashboardItem>
  });
  const [savingDashboard, setSavingDashboard] = React.useState(false);

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
      setEditingBoardId(null);
      setEditingSurveyId(null);
      void loadSessions(selectedEventId);
      void loadEventQuestions(selectedEventId);
      void loadEventBoards(selectedEventId);
      void loadEventSurveys(selectedEventId);
      void loadEventDashboard(selectedEventId);
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
      countryOfSchedule: session.country_of_schedule ?? "",
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.attendance_status,
      dashboardItems: (session.dashboard_items ?? []).map((item, index) => ({
        sessionId: item.session_id ?? session.id,
        name: cleanText(item.name),
        iconKey: item.icon_key ?? "none",
        valueType: item.value_type,
        value: item.value,
        visibility: item.visibility ?? "public",
        sortOrder: item.sort_order || index + 1,
        status: item.status || "active"
      }))
    });
  }, [sessions, selectedSessionId]);

  React.useEffect(() => {
    const event = events.find((item) => item.id === selectedEventId);
    if (!event) return;

    setEventEditDraft({
      title: event.title,
      shortLinkSlug: event.short_link_slug,
      theme: event.theme ?? "",
      countryOfSchedule: event.country_of_schedule ?? "",
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      status: event.status
    });
    setAssociatedTemplateDraftId(event.associated_template_id ?? "");
    setDashboardDraft((current) => ({
      ...current,
      title: current.title || `Tablero - ${event.title}`,
      browserTitle: current.browserTitle || `Tablero - ${event.title}`,
      shortLinkSlug: current.shortLinkSlug || `${event.short_link_slug}-tablero`
    }));
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

  async function loadEventBoards(eventId: string) {
    const response = await fetch(`/api/admin/events/${eventId}/boards`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { boards: EventBoard[] };
    setEventBoards(payload.boards);
  }

  async function loadEventSurveys(eventId: string) {
    const response = await fetch(`/api/admin/events/${eventId}/surveys`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { surveys: EventSurvey[] };
    setEventSurveys(payload.surveys);
  }

  async function loadEventDashboard(eventId: string) {
    const response = await fetch(`/api/admin/events/${eventId}/dashboard`, { credentials: "include" });
    if (!response.ok) return;
    const payload = (await response.json()) as { dashboard: EventDashboard | null };
    setEventDashboard(payload.dashboard);
    const event = events.find((item) => item.id === eventId);
    if (!payload.dashboard) {
      setDashboardDraft({
        title: event ? `Tablero - ${cleanText(event.title)}` : "",
        browserTitle: event ? `Tablero - ${cleanText(event.title)}` : "",
        shortLinkSlug: event ? `${event.short_link_slug}-tablero` : "",
        status: "draft",
        instructions: [],
        eventItems: [],
        sessionItems: []
      });
      return;
    }
    setDashboardDraft({
      title: cleanText(payload.dashboard.title),
      browserTitle: cleanText(payload.dashboard.browser_title ?? payload.dashboard.title),
      shortLinkSlug: payload.dashboard.short_link_slug,
      status: payload.dashboard.status,
      instructions: (payload.dashboard.instructions ?? []).map((instruction, index) => ({
        languageLabel: cleanText(instruction.language_label ?? ""),
        contentHtml: instruction.content_html,
        sortOrder: instruction.sort_order || index + 1,
        status: instruction.status || "active"
      })),
      eventItems: (payload.dashboard.eventItems ?? []).map((item, index) => ({
        sessionId: "",
        name: cleanText(item.name),
        iconKey: item.icon_key ?? "none",
        valueType: item.value_type,
        value: item.value,
        visibility: item.visibility ?? "public",
        sortOrder: item.sort_order || index + 1,
        status: item.status || "active"
      })),
      sessionItems: (payload.dashboard.sessionItems ?? []).map((item, index) => ({
        sessionId: item.session_id ?? "",
        name: cleanText(item.name),
        iconKey: item.icon_key ?? "none",
        valueType: item.value_type,
        value: item.value,
        visibility: item.visibility ?? "public",
        sortOrder: item.sort_order || index + 1,
        status: item.status || "active"
      }))
    });
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
      countryOfSchedule: session.country_of_schedule ?? "",
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.attendance_status,
      dashboardItems: (session.dashboard_items ?? []).map((item, index) => ({
        sessionId: item.session_id ?? session.id,
        name: cleanText(item.name),
        iconKey: item.icon_key ?? "none",
        valueType: item.value_type,
        value: item.value,
        visibility: item.visibility ?? "public",
        sortOrder: item.sort_order || index + 1,
        status: item.status || "active"
      }))
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

    if (!response.ok || !payload.ok) {
      setSavingSession(false);
      setActionMessage(payload.message ?? "No se pudo actualizar la sesion.");
      return;
    }

    const itemsResponse = await fetch(`/api/admin/events/${selectedEventId}/sessions/${selectedSessionId}/dashboard-items`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: sessionEditDraft.dashboardItems })
    });
    const itemsPayload = (await itemsResponse.json()) as { ok: boolean; message?: string };
    setSavingSession(false);
    if (!itemsResponse.ok || !itemsPayload.ok) {
      setActionMessage(itemsPayload.message ?? "La sesion se actualizo, pero no se pudo guardar la informacion del tablero.");
      return;
    }

    await loadSessions(selectedEventId);
    await loadEventDashboard(selectedEventId);
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
        browserTitle: questionDraft.browserTitle || questionDraft.questionText,
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
      browserTitle: "",
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
      browserTitle: question.browser_title ?? question.question_text,
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
      browserTitle: "",
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
        browserTitle: questionEditDraft.browserTitle || questionEditDraft.questionText,
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

  function boardPayload(draft: typeof boardDraft) {
    return {
      title: draft.title,
      browserTitle: draft.browserTitle || draft.title,
      sessionId: draft.sessionId || null,
      participantSlug: draft.participantSlug,
      maxNoteLength: Number(draft.maxNoteLength) || 800,
      allowMultipleNotes: draft.allowMultipleNotes,
      maxNotesPerParticipant: draft.allowMultipleNotes ? Number(draft.maxNotesPerParticipant) || 1 : 1,
      instructions: draft.instructions.map((instruction, index) => ({
        languageLabel: instruction.languageLabel,
        contentHtml: sanitizeClientHtml(instruction.contentHtml),
        sortOrder: index + 1
      }))
    };
  }

  function resetBoardDraft() {
    setBoardDraft({
      title: "",
      browserTitle: "",
      sessionId: "",
      participantSlug: "",
      maxNoteLength: "800",
      allowMultipleNotes: false,
      maxNotesPerParticipant: "1",
      instructions: [{ ...emptyBoardInstruction }]
    });
  }

  async function createBoard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId || !boardDraft.title.trim()) return;

    setActionMessage(null);
    const response = await fetch(`/api/admin/events/${selectedEventId}/boards`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boardPayload(boardDraft))
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo crear la pizarra.");
      return;
    }

    resetBoardDraft();
    await loadEventBoards(selectedEventId);
    setActionMessage("Pizarra interactiva creada correctamente.");
  }

  function startBoardEdit(board: EventBoard) {
    setEditingBoardId(board.id);
    setBoardEditDraft({
      title: board.title,
      browserTitle: board.browser_title ?? board.title,
      sessionId: board.session_id ?? "",
      participantSlug: board.participant_slug,
      maxNoteLength: board.max_note_length.toString(),
      allowMultipleNotes: Boolean(board.allow_multiple_notes),
      maxNotesPerParticipant: board.max_notes_per_participant?.toString() ?? "1",
      instructions: board.instructions?.length
        ? board.instructions.map((instruction, index) => ({
          languageLabel: instruction.language_label ?? "",
          contentHtml: instruction.content_html,
          sortOrder: index + 1
        }))
        : [{ ...emptyBoardInstruction }]
    });
    setActionMessage(null);
  }

  function cancelBoardEdit() {
    setEditingBoardId(null);
    setBoardEditDraft({
      title: "",
      browserTitle: "",
      sessionId: "",
      participantSlug: "",
      maxNoteLength: "800",
      allowMultipleNotes: false,
      maxNotesPerParticipant: "1",
      instructions: [{ ...emptyBoardInstruction }]
    });
  }

  async function saveBoardEdit(board: EventBoard, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/boards/${board.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boardPayload(boardEditDraft))
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la pizarra.");
      return;
    }
    await loadEventBoards(selectedEventId);
    cancelBoardEdit();
    setActionMessage("Pizarra actualizada correctamente.");
  }

  async function changeBoardStatus(board: EventBoard, status: string) {
    if (!selectedEventId) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/boards/${board.id}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la pizarra.");
      return;
    }
    await loadEventBoards(selectedEventId);
    setActionMessage("Estado de pizarra actualizado.");
  }

  function surveyPayload(draft: typeof surveyDraft | typeof surveyEditDraft) {
    return {
      title: draft.title,
      browserTitle: draft.browserTitle || draft.title,
      sessionId: draft.sessionId || null,
      participantSlug: draft.participantSlug,
      status: "status" in draft ? draft.status : undefined,
      questions: draft.questions.map((question, questionIndex) => ({
        id: question.id,
        questionText: question.questionText,
        description: question.description,
        allowMultipleAnswers: question.allowMultipleAnswers,
        maxAnswersPerParticipant: question.allowMultipleAnswers ? Number(question.maxAnswersPerParticipant) || 2 : 1,
        chartType: question.chartType,
        sortOrder: questionIndex + 1,
        status: question.status,
        options: question.options.map((option, optionIndex) => ({
          id: option.id,
          optionText: option.optionText,
          sortOrder: optionIndex + 1,
          status: option.status
        }))
      }))
    };
  }

  function resetSurveyDraft() {
    setSurveyDraft({
      title: "",
      browserTitle: "",
      sessionId: "",
      participantSlug: "",
      questions: [emptySurveyQuestion()]
    });
  }

  function surveyQuestionFromApi(question: EventSurveyQuestion, index: number): SurveyQuestionDraft {
    return {
      id: question.id,
      questionText: question.question_text,
      description: question.description ?? "",
      allowMultipleAnswers: Boolean(question.allow_multiple_answers),
      maxAnswersPerParticipant: question.max_answers_per_participant?.toString() ?? "1",
      chartType: question.chart_type || "bar",
      sortOrder: question.sort_order || index + 1,
      status: question.status || "active",
      options: question.options?.length
        ? question.options.map((option, optionIndex) => ({
          id: option.id,
          optionText: option.option_text,
          sortOrder: option.sort_order || optionIndex + 1,
          status: option.status || "active"
        }))
        : [
          { optionText: "", sortOrder: 1, status: "active" },
          { optionText: "", sortOrder: 2, status: "active" }
        ]
    };
  }

  async function createSurvey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId || !surveyDraft.title.trim()) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/surveys`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyPayload(surveyDraft))
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo crear la encuesta.");
      return;
    }
    resetSurveyDraft();
    await loadEventSurveys(selectedEventId);
    setActionMessage("Encuesta interactiva creada correctamente.");
  }

  function startSurveyEdit(survey: EventSurvey) {
    setEditingSurveyId(survey.id);
    setSurveyEditDraft({
      title: survey.title,
      browserTitle: survey.browser_title ?? survey.title,
      sessionId: survey.session_id ?? "",
      participantSlug: survey.participant_slug,
      status: survey.status,
      questions: survey.questions?.length ? survey.questions.map(surveyQuestionFromApi) : [emptySurveyQuestion()]
    });
    setActionMessage(null);
  }

  function cancelSurveyEdit() {
    setEditingSurveyId(null);
    setSurveyEditDraft({
      title: "",
      browserTitle: "",
      sessionId: "",
      participantSlug: "",
      status: "draft",
      questions: [emptySurveyQuestion()]
    });
  }

  async function saveSurveyEdit(survey: EventSurvey, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/surveys/${survey.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyPayload(surveyEditDraft))
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la encuesta.");
      return;
    }
    await loadEventSurveys(selectedEventId);
    cancelSurveyEdit();
    setActionMessage("Encuesta actualizada correctamente.");
  }

  async function changeSurveyStatus(survey: EventSurvey, status: string) {
    if (!selectedEventId) return;
    const response = await fetch(`/api/admin/events/${selectedEventId}/surveys/${survey.id}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo actualizar la encuesta.");
      return;
    }
    await loadEventSurveys(selectedEventId);
    setActionMessage("Estado de encuesta actualizado.");
  }

  function updateSurveyQuestion(mode: "create" | "edit", index: number, field: keyof SurveyQuestionDraft, value: string | boolean) {
    const update = <T extends { questions: SurveyQuestionDraft[] }>(current: T): T => ({
      ...current,
      questions: current.questions.map((question, itemIndex) =>
        itemIndex === index ? { ...question, [field]: value } : question
      )
    });
    if (mode === "create") setSurveyDraft(update);
    else setSurveyEditDraft(update);
  }

  function updateSurveyOption(mode: "create" | "edit", questionIndex: number, optionIndex: number, field: keyof SurveyOptionDraft, value: string) {
    const update = <T extends { questions: SurveyQuestionDraft[] }>(current: T): T => ({
      ...current,
      questions: current.questions.map((question, itemIndex) => itemIndex === questionIndex
        ? {
          ...question,
          options: question.options.map((option, nestedIndex) => nestedIndex === optionIndex ? { ...option, [field]: value } : option)
        }
        : question)
    });
    if (mode === "create") setSurveyDraft(update);
    else setSurveyEditDraft(update);
  }

  function addSurveyQuestion(mode: "create" | "edit") {
    const update = <T extends { questions: SurveyQuestionDraft[] }>(current: T): T => ({
      ...current,
      questions: [...current.questions, { ...emptySurveyQuestion(), sortOrder: current.questions.length + 1 }]
    });
    if (mode === "create") setSurveyDraft(update);
    else setSurveyEditDraft(update);
  }

  function removeSurveyQuestion(mode: "create" | "edit", index: number) {
    const update = <T extends { questions: SurveyQuestionDraft[] }>(current: T): T => ({
      ...current,
      questions: current.questions.length > 1 ? current.questions.filter((_, itemIndex) => itemIndex !== index) : current.questions
    });
    if (mode === "create") setSurveyDraft(update);
    else setSurveyEditDraft(update);
  }

  function addSurveyOption(mode: "create" | "edit", questionIndex: number) {
    const update = <T extends { questions: SurveyQuestionDraft[] }>(current: T): T => ({
      ...current,
      questions: current.questions.map((question, itemIndex) => itemIndex === questionIndex
        ? { ...question, options: [...question.options, { optionText: "", sortOrder: question.options.length + 1, status: "active" }] }
        : question)
    });
    if (mode === "create") setSurveyDraft(update);
    else setSurveyEditDraft(update);
  }

  function removeSurveyOption(mode: "create" | "edit", questionIndex: number, optionIndex: number) {
    const update = <T extends { questions: SurveyQuestionDraft[] }>(current: T): T => ({
      ...current,
      questions: current.questions.map((question, itemIndex) => itemIndex === questionIndex
        ? { ...question, options: question.options.length > 2 ? question.options.filter((_, nestedIndex) => nestedIndex !== optionIndex) : question.options }
        : question)
    });
    if (mode === "create") setSurveyDraft(update);
    else setSurveyEditDraft(update);
  }

  function updateInstruction(
    mode: "create" | "edit",
    index: number,
    field: "languageLabel" | "contentHtml",
    value: string
  ) {
    const setter = mode === "create" ? setBoardDraft : setBoardEditDraft;
    setter((current) => ({
      ...current,
      instructions: current.instructions.map((instruction, itemIndex) =>
        itemIndex === index ? { ...instruction, [field]: value } : instruction
      )
    }));
  }

  function addInstruction(mode: "create" | "edit") {
    const setter = mode === "create" ? setBoardDraft : setBoardEditDraft;
    setter((current) => ({
      ...current,
      instructions: [
        ...current.instructions,
        { languageLabel: "", contentHtml: "<p></p>", sortOrder: current.instructions.length + 1 }
      ]
    }));
  }

  function removeInstruction(mode: "create" | "edit", index: number) {
    const setter = mode === "create" ? setBoardDraft : setBoardEditDraft;
    setter((current) => ({
      ...current,
      instructions: current.instructions.length > 1
        ? current.instructions.filter((_, itemIndex) => itemIndex !== index)
        : current.instructions
    }));
  }

  function addDashboardInstruction() {
    setDashboardDraft((current) => ({
      ...current,
      instructions: [
        ...current.instructions,
        { languageLabel: "", contentHtml: "<p></p>", sortOrder: current.instructions.length + 1, status: "active" }
      ]
    }));
  }

  function updateDashboardInstruction(index: number, field: "languageLabel" | "contentHtml" | "status", value: string) {
    setDashboardDraft((current) => ({
      ...current,
      instructions: current.instructions.map((instruction, itemIndex) =>
        itemIndex === index ? { ...instruction, [field]: value } : instruction
      )
    }));
  }

  function removeDashboardInstruction(index: number) {
    setDashboardDraft((current) => ({
      ...current,
      instructions: current.instructions.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function addDashboardItem(scope: "event" | "session") {
    setDashboardDraft((current) => {
      const key = scope === "event" ? "eventItems" : "sessionItems";
      return {
        ...current,
        [key]: [
          ...current[key],
          {
            sessionId: scope === "session" ? sessions[0]?.id ?? "" : "",
            name: "",
            iconKey: "none",
            valueType: "text",
            value: "",
            visibility: "public",
            sortOrder: current[key].length + 1,
            status: "active"
          }
        ]
      };
    });
  }

  function updateDashboardItem(scope: "event" | "session", index: number, field: "sessionId" | "name" | "iconKey" | "valueType" | "value" | "visibility" | "sortOrder" | "status", value: string) {
    setDashboardDraft((current) => {
      const key = scope === "event" ? "eventItems" : "sessionItems";
      return {
        ...current,
        [key]: current[key].map((item, itemIndex) => itemIndex === index
          ? { ...item, [field]: field === "sortOrder" ? Number(value) || 1 : value }
          : item)
      };
    });
  }

  function removeDashboardItem(scope: "event" | "session", index: number) {
    setDashboardDraft((current) => {
      const key = scope === "event" ? "eventItems" : "sessionItems";
      return {
        ...current,
        [key]: current[key].filter((_, itemIndex) => itemIndex !== index)
      };
    });
  }

  async function saveDashboard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;
    setSavingDashboard(true);
    setActionMessage(null);
    const response = await fetch(`/api/admin/events/${selectedEventId}/dashboard`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: dashboardDraft.title,
        browserTitle: dashboardDraft.browserTitle || dashboardDraft.title,
        shortLinkSlug: dashboardDraft.shortLinkSlug,
        status: dashboardDraft.status,
        instructions: dashboardDraft.instructions.map((instruction, index) => ({
          languageLabel: instruction.languageLabel,
          contentHtml: sanitizeClientHtml(instruction.contentHtml),
          sortOrder: index + 1,
          status: instruction.status
        })),
        eventItems: dashboardDraft.eventItems.map((item) => ({
          name: item.name,
          iconKey: item.iconKey,
          valueType: item.valueType,
          value: item.value,
          visibility: item.visibility,
          sortOrder: item.sortOrder,
          status: item.status
        }))
      })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; dashboard?: EventDashboard };
    setSavingDashboard(false);
    if (!response.ok || !payload.ok) {
      setActionMessage(payload.message ?? "No se pudo guardar el tablero.");
      return;
    }
    await loadEventDashboard(selectedEventId);
    setActionMessage("Tablero guardado correctamente.");
  }

  function updateSessionDraft(index: number, field: Exclude<keyof EventSessionDraft, "dashboardItems">, value: string) {
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
        countryOfSchedule: "",
        sessionDate: "",
        startTime: eventDraft.startTime,
        endTime: eventDraft.endTime,
        dashboardItems: []
      }
    ]);
  }

  function addSessionDraftDashboardItem(sessionIndex: number) {
    setSessionDrafts((current) => current.map((session, index) => index === sessionIndex
      ? {
        ...session,
        dashboardItems: [
          ...session.dashboardItems,
          { sessionId: "", name: "", iconKey: "none", valueType: "text", value: "", visibility: "public", sortOrder: session.dashboardItems.length + 1, status: "active" }
        ]
      }
      : session));
  }

  function updateSessionDraftDashboardItem(sessionIndex: number, itemIndex: number, field: "name" | "iconKey" | "valueType" | "value" | "visibility" | "sortOrder" | "status", value: string) {
    setSessionDrafts((current) => current.map((session, index) => index === sessionIndex
      ? {
        ...session,
        dashboardItems: session.dashboardItems.map((item, nestedIndex) => nestedIndex === itemIndex
          ? { ...item, [field]: field === "sortOrder" ? Number(value) || 1 : value }
          : item)
      }
      : session));
  }

  function removeSessionDraftDashboardItem(sessionIndex: number, itemIndex: number) {
    setSessionDrafts((current) => current.map((session, index) => index === sessionIndex
      ? { ...session, dashboardItems: session.dashboardItems.filter((_, nestedIndex) => nestedIndex !== itemIndex) }
      : session));
  }

  function addSessionEditDashboardItem() {
    setSessionEditDraft((current) => ({
      ...current,
      dashboardItems: [
        ...current.dashboardItems,
        { sessionId: selectedSessionId ?? "", name: "", iconKey: "none", valueType: "text", value: "", visibility: "public", sortOrder: current.dashboardItems.length + 1, status: "active" }
      ]
    }));
  }

  function updateSessionEditDashboardItem(index: number, field: "name" | "iconKey" | "valueType" | "value" | "visibility" | "sortOrder" | "status", value: string) {
    setSessionEditDraft((current) => ({
      ...current,
      dashboardItems: current.dashboardItems.map((item, itemIndex) => itemIndex === index
        ? { ...item, [field]: field === "sortOrder" ? Number(value) || 1 : value }
        : item)
    }));
  }

  function removeSessionEditDashboardItem(index: number) {
    setSessionEditDraft((current) => ({
      ...current,
      dashboardItems: current.dashboardItems.filter((_, itemIndex) => itemIndex !== index)
    }));
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
                  País del Horario
                  <input value={eventDraft.countryOfSchedule} onChange={(event) => setEventDraft((current) => ({ ...current, countryOfSchedule: event.target.value }))} placeholder="Ejemplo: Perú" />
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
                      País del Horario
                      <input value={session.countryOfSchedule} onChange={(event) => updateSessionDraft(index, "countryOfSchedule", event.target.value)} placeholder="Ejemplo: Perú" />
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
                    <div className="session-dashboard-inline">
                      <DashboardItemsEditor
                        compact
                        items={session.dashboardItems}
                        onAdd={() => addSessionDraftDashboardItem(index)}
                        onRemove={(itemIndex) => removeSessionDraftDashboardItem(index, itemIndex)}
                        onUpdate={(itemIndex, field, value) => {
                          if (field !== "sessionId") updateSessionDraftDashboardItem(index, itemIndex, field, value);
                        }}
                        title="Informacion para tablero"
                      />
                    </div>
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
                    País del Horario
                    <input value={eventEditDraft.countryOfSchedule} onChange={(event) => setEventEditDraft((current) => ({ ...current, countryOfSchedule: event.target.value }))} placeholder="Ejemplo: Perú" />
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
                    Nombre Navegador
                    <input
                      value={questionDraft.browserTitle}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, browserTitle: event.target.value }))}
                      placeholder="Ejemplo: Nube gobernanza OTCA"
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
                              Nombre Navegador
                              <input
                                value={questionEditDraft.browserTitle}
                                onChange={(event) => setQuestionEditDraft((current) => ({ ...current, browserTitle: event.target.value }))}
                                placeholder="Título visible en la pestaña del navegador"
                              />
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

          {selectedEvent ? (
            <div className="admin-form-panel">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">Pizarra abierta</p>
                  <h3>Pizarras interactivas</h3>
                  <p>Publique instrucciones y reciba notas libres de participantes sin validación documental.</p>
                </div>
              </div>

              <form className="builder-card" onSubmit={createBoard}>
                <div className="builder-grid">
                  <label>
                    Título
                    <input
                      value={boardDraft.title}
                      onChange={(event) => setBoardDraft((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Ejemplo: Presentación de participantes"
                      required
                    />
                  </label>
                  <label>
                    Nombre Navegador
                    <input
                      value={boardDraft.browserTitle}
                      onChange={(event) => setBoardDraft((current) => ({ ...current, browserTitle: event.target.value }))}
                      placeholder="Ejemplo: Pizarra presentaciones OTCA"
                    />
                  </label>
                  <label>
                    Sesión asociada
                    <select value={boardDraft.sessionId} onChange={(event) => setBoardDraft((current) => ({ ...current, sessionId: event.target.value }))}>
                      <option value="">Todo el evento</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>{session.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Enlace corto de pizarra
                    <input
                      value={boardDraft.participantSlug}
                      onChange={(event) => setBoardDraft((current) => ({ ...current, participantSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                      placeholder="opcional"
                    />
                  </label>
                  <label>
                    Máximo caracteres nota
                    <input
                      min="20"
                      max="5000"
                      type="number"
                      value={boardDraft.maxNoteLength}
                      onChange={(event) => setBoardDraft((current) => ({ ...current, maxNoteLength: event.target.value }))}
                    />
                  </label>
                  <label>
                    Máximo notas por participante
                    <input
                      min="1"
                      type="number"
                      value={boardDraft.maxNotesPerParticipant}
                      onChange={(event) => setBoardDraft((current) => ({ ...current, maxNotesPerParticipant: event.target.value }))}
                      disabled={!boardDraft.allowMultipleNotes}
                    />
                  </label>
                  <label className="check-field">
                    <input
                      checked={boardDraft.allowMultipleNotes}
                      onChange={(event) => setBoardDraft((current) => ({ ...current, allowMultipleNotes: event.target.checked }))}
                      type="checkbox"
                    />
                    Permitir más de una nota
                  </label>
                </div>
                <div className="instruction-editor-list">
                  {boardDraft.instructions.map((instruction, index) => (
                    <div className="instruction-editor" key={`new-${index}`}>
                      <label>
                        Etiqueta / idioma
                        <input value={instruction.languageLabel} onChange={(event) => updateInstruction("create", index, "languageLabel", event.target.value)} />
                      </label>
                      <RichEditable
                        onChange={(value) => updateInstruction("create", index, "contentHtml", value)}
                        placeholder="Escriba o pegue la instrucción con formato"
                        value={instruction.contentHtml}
                      />
                      <button className="text-button danger" type="button" onClick={() => removeInstruction("create", index)}>Quitar instrucción</button>
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="button secondary" type="button" onClick={() => addInstruction("create")}>Agregar instrucción</button>
                  <button className="button" type="submit">Crear pizarra</button>
                </div>
              </form>

              <div className="question-list">
                {eventBoards.map((board) => {
                  const participantUrl = `${window.location.origin}/b/${board.participant_slug}`;
                  const presenterUrl = `${window.location.origin}/b/p/${board.presenter_slug}`;
                  const isEditingBoard = editingBoardId === board.id;
                  const hasNotes = board.note_count > 0;
                  return (
                    <div className={`question-card${isEditingBoard ? " editing" : ""}`} key={board.id}>
                      {!isEditingBoard ? (
                        <>
                          <div>
                            <strong>{board.title}</strong>
                            <span>{board.note_count} notas · {board.status}</span>
                            <a href={participantUrl}>{participantUrl}</a>
                            <a href={presenterUrl}>{presenterUrl}</a>
                          </div>
                          <div className="row-actions">
                            <button className="button secondary table-action" type="button" onClick={() => startBoardEdit(board)}>Editar</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeBoardStatus(board, "open")}>Abrir</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeBoardStatus(board, "closed")}>Cerrar</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeBoardStatus(board, "archived")}>Archivar</button>
                          </div>
                        </>
                      ) : (
                        <form className="question-edit-form" onSubmit={(event) => void saveBoardEdit(board, event)}>
                          <div className="builder-grid">
                            <label>
                              Título
                              <input value={boardEditDraft.title} onChange={(event) => setBoardEditDraft((current) => ({ ...current, title: event.target.value }))} required />
                            </label>
                            <label>
                              Nombre Navegador
                              <input value={boardEditDraft.browserTitle} onChange={(event) => setBoardEditDraft((current) => ({ ...current, browserTitle: event.target.value }))} placeholder="Título visible en la pestaña del navegador" />
                            </label>
                            <label>
                              Sesión asociada
                              <select value={boardEditDraft.sessionId} onChange={(event) => setBoardEditDraft((current) => ({ ...current, sessionId: event.target.value }))}>
                                <option value="">Todo el evento</option>
                                {sessions.map((session) => (
                                  <option key={session.id} value={session.id}>{session.title}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Enlace corto
                              <input
                                value={boardEditDraft.participantSlug}
                                onChange={(event) => setBoardEditDraft((current) => ({ ...current, participantSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                                disabled={hasNotes}
                                required
                              />
                            </label>
                            <label>
                              Máximo caracteres nota
                              <input type="number" min="20" max="5000" value={boardEditDraft.maxNoteLength} onChange={(event) => setBoardEditDraft((current) => ({ ...current, maxNoteLength: event.target.value }))} />
                            </label>
                            <label>
                              Máximo notas por participante
                              <input type="number" min="1" value={boardEditDraft.maxNotesPerParticipant} onChange={(event) => setBoardEditDraft((current) => ({ ...current, maxNotesPerParticipant: event.target.value }))} disabled={!boardEditDraft.allowMultipleNotes} />
                            </label>
                            <label className="check-field">
                              <input checked={boardEditDraft.allowMultipleNotes} onChange={(event) => setBoardEditDraft((current) => ({ ...current, allowMultipleNotes: event.target.checked }))} type="checkbox" />
                              Permitir más de una nota
                            </label>
                          </div>
                          <div className="instruction-editor-list">
                            {boardEditDraft.instructions.map((instruction, index) => (
                              <div className="instruction-editor" key={`edit-${index}`}>
                                <label>
                                  Etiqueta / idioma
                                  <input value={instruction.languageLabel} onChange={(event) => updateInstruction("edit", index, "languageLabel", event.target.value)} />
                                </label>
                                <RichEditable
                                  onChange={(value) => updateInstruction("edit", index, "contentHtml", value)}
                                  placeholder="Escriba o pegue la instrucción con formato"
                                  value={instruction.contentHtml}
                                />
                                <button className="text-button danger" type="button" onClick={() => removeInstruction("edit", index)}>Quitar instrucción</button>
                              </div>
                            ))}
                          </div>
                          <div className="question-edit-note">
                            <span>{board.note_count} notas registradas</span>
                            {hasNotes ? <span>El enlace corto está bloqueado por trazabilidad.</span> : <span>El enlace corto aún puede modificarse.</span>}
                          </div>
                          <div className="actions">
                            <button className="button secondary" type="button" onClick={() => addInstruction("edit")}>Agregar instrucción</button>
                            <button className="button" type="submit">Guardar pizarra</button>
                            <button className="button secondary" type="button" onClick={cancelBoardEdit}>Cancelar</button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
                {eventBoards.length === 0 ? <p className="blocked-message">No hay pizarras interactivas para este evento.</p> : null}
              </div>
            </div>
          ) : null}

          {selectedEvent ? (
            <div className="admin-form-panel">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">Votación en vivo</p>
                  <h3>Encuestas interactivas</h3>
                  <p>Configure preguntas cerradas y publique resultados dinámicos con gráficos.</p>
                </div>
              </div>

              <form className="builder-card" onSubmit={createSurvey}>
                <div className="builder-grid">
                  <label>
                    Título de la encuesta
                    <input value={surveyDraft.title} onChange={(event) => setSurveyDraft((current) => ({ ...current, title: event.target.value }))} required />
                  </label>
                  <label>
                    Nombre Navegador
                    <input value={surveyDraft.browserTitle} onChange={(event) => setSurveyDraft((current) => ({ ...current, browserTitle: event.target.value }))} />
                  </label>
                  <label>
                    Sesión asociada
                    <select value={surveyDraft.sessionId} onChange={(event) => setSurveyDraft((current) => ({ ...current, sessionId: event.target.value }))}>
                      <option value="">Todo el evento</option>
                      {sessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}
                    </select>
                  </label>
                  <label>
                    Enlace corto de encuesta
                    <input value={surveyDraft.participantSlug} onChange={(event) => setSurveyDraft((current) => ({ ...current, participantSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="opcional" />
                    <span className="field-hint">{window.location.origin}/s/{surveyDraft.participantSlug || "enlace-encuesta"}</span>
                  </label>
                </div>
                <div className="survey-question-editor-list">
                  {surveyDraft.questions.map((question, questionIndex) => (
                    <div className="survey-question-editor" key={`survey-new-${questionIndex}`}>
                      <div className="mini-section-heading">
                        <strong>Pregunta {questionIndex + 1}</strong>
                        <button className="text-button danger" type="button" onClick={() => removeSurveyQuestion("create", questionIndex)}>Quitar pregunta</button>
                      </div>
                      <div className="builder-grid">
                        <label>
                          Pregunta
                          <input value={question.questionText} onChange={(event) => updateSurveyQuestion("create", questionIndex, "questionText", event.target.value)} required />
                        </label>
                        <label>
                          Descripción
                          <input value={question.description} onChange={(event) => updateSurveyQuestion("create", questionIndex, "description", event.target.value)} />
                        </label>
                        <label>
                          Tipo de gráfico
                          <select value={question.chartType} onChange={(event) => updateSurveyQuestion("create", questionIndex, "chartType", event.target.value)}>
                            <option value="bar">Barras</option>
                            <option value="pie">Círculo</option>
                          </select>
                        </label>
                        <label>
                          Máximo de respuestas
                          <input type="number" min="1" value={question.maxAnswersPerParticipant} onChange={(event) => updateSurveyQuestion("create", questionIndex, "maxAnswersPerParticipant", event.target.value)} disabled={!question.allowMultipleAnswers} />
                        </label>
                        <label className="check-field">
                          <input checked={question.allowMultipleAnswers} onChange={(event) => updateSurveyQuestion("create", questionIndex, "allowMultipleAnswers", event.target.checked)} type="checkbox" />
                          Permitir más de una respuesta
                        </label>
                      </div>
                      <div className="survey-option-list">
                        {question.options.map((option, optionIndex) => (
                          <div className="survey-option-editor" key={`survey-new-${questionIndex}-${optionIndex}`}>
                            <input value={option.optionText} onChange={(event) => updateSurveyOption("create", questionIndex, optionIndex, "optionText", event.target.value)} placeholder={`Alternativa ${optionIndex + 1}`} required />
                            <select value={option.status} onChange={(event) => updateSurveyOption("create", questionIndex, optionIndex, "status", event.target.value)}>
                              <option value="active">Activa</option>
                              <option value="inactive">Inactiva</option>
                            </select>
                            <button className="text-button danger" type="button" onClick={() => removeSurveyOption("create", questionIndex, optionIndex)}>Quitar</button>
                          </div>
                        ))}
                      </div>
                      <button className="button secondary table-action" type="button" onClick={() => addSurveyOption("create", questionIndex)}>Agregar alternativa</button>
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="button secondary" type="button" onClick={() => addSurveyQuestion("create")}>Agregar pregunta</button>
                  <button className="button" type="submit">Crear encuesta</button>
                </div>
              </form>

              <div className="question-list">
                {eventSurveys.map((survey) => {
                  const surveyUrl = `${window.location.origin}/s/${survey.participant_slug}`;
                  const isEditingSurvey = editingSurveyId === survey.id;
                  const hasVotes = survey.vote_count > 0;
                  return (
                    <div className={`question-card${isEditingSurvey ? " editing" : ""}`} key={survey.id}>
                      {!isEditingSurvey ? (
                        <>
                          <div>
                            <strong>{survey.title}</strong>
                            <span>{survey.question_count} preguntas · {survey.vote_count} votos · {survey.status}</span>
                            <a href={surveyUrl}>{surveyUrl}</a>
                          </div>
                          <div className="row-actions">
                            <button className="button secondary table-action" type="button" onClick={() => startSurveyEdit(survey)}>Editar</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeSurveyStatus(survey, "open")}>Abrir</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeSurveyStatus(survey, "closed")}>Cerrar</button>
                            <button className="button secondary table-action" type="button" onClick={() => void changeSurveyStatus(survey, "archived")}>Archivar</button>
                          </div>
                        </>
                      ) : (
                        <form className="question-edit-form" onSubmit={(event) => void saveSurveyEdit(survey, event)}>
                          <div className="builder-grid">
                            <label>
                              Título de la encuesta
                              <input value={surveyEditDraft.title} onChange={(event) => setSurveyEditDraft((current) => ({ ...current, title: event.target.value }))} required />
                            </label>
                            <label>
                              Nombre Navegador
                              <input value={surveyEditDraft.browserTitle} onChange={(event) => setSurveyEditDraft((current) => ({ ...current, browserTitle: event.target.value }))} />
                            </label>
                            <label>
                              Sesión asociada
                              <select value={surveyEditDraft.sessionId} onChange={(event) => setSurveyEditDraft((current) => ({ ...current, sessionId: event.target.value }))}>
                                <option value="">Todo el evento</option>
                                {sessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}
                              </select>
                            </label>
                            <label>
                              Enlace corto
                              <input value={surveyEditDraft.participantSlug} onChange={(event) => setSurveyEditDraft((current) => ({ ...current, participantSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} disabled={hasVotes} required />
                            </label>
                            <label>
                              Estado
                              <select value={surveyEditDraft.status} onChange={(event) => setSurveyEditDraft((current) => ({ ...current, status: event.target.value }))}>
                                <option value="draft">Borrador</option>
                                <option value="open">Abierta</option>
                                <option value="closed">Cerrada</option>
                                <option value="archived">Archivada</option>
                              </select>
                            </label>
                          </div>
                          <div className="survey-question-editor-list">
                            {surveyEditDraft.questions.map((question, questionIndex) => (
                              <div className="survey-question-editor" key={`survey-edit-${question.id ?? questionIndex}`}>
                                <div className="mini-section-heading">
                                  <strong>Pregunta {questionIndex + 1}</strong>
                                  <button className="text-button danger" type="button" onClick={() => removeSurveyQuestion("edit", questionIndex)}>Quitar pregunta</button>
                                </div>
                                <div className="builder-grid">
                                  <label>
                                    Pregunta
                                    <input value={question.questionText} onChange={(event) => updateSurveyQuestion("edit", questionIndex, "questionText", event.target.value)} required />
                                  </label>
                                  <label>
                                    Descripción
                                    <input value={question.description} onChange={(event) => updateSurveyQuestion("edit", questionIndex, "description", event.target.value)} />
                                  </label>
                                  <label>
                                    Tipo de gráfico
                                    <select value={question.chartType} onChange={(event) => updateSurveyQuestion("edit", questionIndex, "chartType", event.target.value)}>
                                      <option value="bar">Barras</option>
                                      <option value="pie">Círculo</option>
                                    </select>
                                  </label>
                                  <label>
                                    Estado
                                    <select value={question.status} onChange={(event) => updateSurveyQuestion("edit", questionIndex, "status", event.target.value)}>
                                      <option value="active">Activa</option>
                                      <option value="inactive">Inactiva</option>
                                    </select>
                                  </label>
                                  <label>
                                    Máximo de respuestas
                                    <input type="number" min="1" value={question.maxAnswersPerParticipant} onChange={(event) => updateSurveyQuestion("edit", questionIndex, "maxAnswersPerParticipant", event.target.value)} disabled={!question.allowMultipleAnswers} />
                                  </label>
                                  <label className="check-field">
                                    <input checked={question.allowMultipleAnswers} onChange={(event) => updateSurveyQuestion("edit", questionIndex, "allowMultipleAnswers", event.target.checked)} type="checkbox" />
                                    Permitir más de una respuesta
                                  </label>
                                </div>
                                <div className="survey-option-list">
                                  {question.options.map((option, optionIndex) => (
                                    <div className="survey-option-editor" key={`survey-edit-${questionIndex}-${option.id ?? optionIndex}`}>
                                      <input value={option.optionText} onChange={(event) => updateSurveyOption("edit", questionIndex, optionIndex, "optionText", event.target.value)} placeholder={`Alternativa ${optionIndex + 1}`} required />
                                      <select value={option.status} onChange={(event) => updateSurveyOption("edit", questionIndex, optionIndex, "status", event.target.value)}>
                                        <option value="active">Activa</option>
                                        <option value="inactive">Inactiva</option>
                                      </select>
                                      <button className="text-button danger" type="button" onClick={() => removeSurveyOption("edit", questionIndex, optionIndex)}>Quitar</button>
                                    </div>
                                  ))}
                                </div>
                                <button className="button secondary table-action" type="button" onClick={() => addSurveyOption("edit", questionIndex)}>Agregar alternativa</button>
                              </div>
                            ))}
                          </div>
                          <div className="question-edit-note">
                            <span>{survey.vote_count} votos registrados</span>
                            {hasVotes ? <span>El enlace corto está bloqueado por trazabilidad.</span> : <span>El enlace corto aún puede modificarse.</span>}
                          </div>
                          <div className="actions">
                            <button className="button secondary" type="button" onClick={() => addSurveyQuestion("edit")}>Agregar pregunta</button>
                            <button className="button" type="submit">Guardar encuesta</button>
                            <button className="button secondary" type="button" onClick={cancelSurveyEdit}>Cancelar</button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
                {eventSurveys.length === 0 ? <p className="blocked-message">No hay encuestas interactivas para este evento.</p> : null}
              </div>
            </div>
          ) : null}

          {selectedEvent ? (
            <div className="admin-form-panel">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">Difusión del evento</p>
                  <h3>Tablero general</h3>
                  <p>Organice información pública del evento y de cada sesión en un enlace único para participantes.</p>
                </div>
                {eventDashboard ? <span className={`status ${eventDashboard.status === "active" ? "open" : "closed"}`}>{eventDashboard.status}</span> : null}
              </div>

              <form className="builder-card" onSubmit={saveDashboard}>
                <div className="builder-grid">
                  <label>
                    Título del tablero
                    <input
                      value={dashboardDraft.title}
                      onChange={(event) => setDashboardDraft((current) => ({ ...current, title: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Nombre Navegador
                    <input
                      value={dashboardDraft.browserTitle}
                      onChange={(event) => setDashboardDraft((current) => ({ ...current, browserTitle: event.target.value }))}
                    />
                  </label>
                  <label>
                    Enlace corto
                    <input
                      value={dashboardDraft.shortLinkSlug}
                      onChange={(event) => setDashboardDraft((current) => ({ ...current, shortLinkSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                      required
                    />
                    <span className="field-hint">{window.location.origin}/t/{dashboardDraft.shortLinkSlug || "enlace-tablero"}</span>
                  </label>
                  <label>
                    Estado
                    <select value={dashboardDraft.status} onChange={(event) => setDashboardDraft((current) => ({ ...current, status: event.target.value }))}>
                      <option value="draft">Borrador</option>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </label>
                </div>

                <div className="dashboard-admin-section">
                  <div className="mini-section-heading">
                    <strong>Instrucciones</strong>
                    <button className="button secondary table-action" type="button" onClick={addDashboardInstruction}>Agregar instrucción</button>
                  </div>
                  {dashboardDraft.instructions.length === 0 ? <p className="blocked-message">El tablero puede publicarse sin instrucciones.</p> : null}
                  <div className="instruction-editor-list">
                    {dashboardDraft.instructions.map((instruction, index) => (
                      <div className="instruction-editor" key={`dashboard-instruction-${index}`}>
                        <div className="builder-grid">
                          <label>
                            Etiqueta / idioma
                            <input value={instruction.languageLabel} onChange={(event) => updateDashboardInstruction(index, "languageLabel", event.target.value)} />
                          </label>
                          <label>
                            Estado
                            <select value={instruction.status} onChange={(event) => updateDashboardInstruction(index, "status", event.target.value)}>
                              <option value="active">Activo</option>
                              <option value="inactive">Inactivo</option>
                            </select>
                          </label>
                        </div>
                        <RichEditable
                          onChange={(value) => updateDashboardInstruction(index, "contentHtml", value)}
                          placeholder="Escriba o pegue la instrucción con formato"
                          value={instruction.contentHtml}
                        />
                        <button className="text-button danger" type="button" onClick={() => removeDashboardInstruction(index)}>Quitar instrucción</button>
                      </div>
                    ))}
                  </div>
                </div>

                <DashboardItemsEditor
                  items={dashboardDraft.eventItems}
                  onAdd={() => addDashboardItem("event")}
                  onRemove={(index) => removeDashboardItem("event", index)}
                  onUpdate={(index, field, value) => updateDashboardItem("event", index, field, value)}
                  title="Información del evento"
                />

                <div className="dashboard-admin-section">
                  <div className="mini-section-heading">
                    <strong>Información de sesiones</strong>
                  </div>
                  <p className="blocked-message">
                    La información específica de cada sesión se crea y edita desde el cronograma, dentro de cada sesión.
                  </p>
                </div>

                <div className="actions">
                  <button className="button" type="submit" disabled={savingDashboard}>{savingDashboard ? "Guardando..." : "Guardar tablero"}</button>
                  {eventDashboard ? <a className="button secondary" href={`/t/${eventDashboard.short_link_slug}`}>Abrir tablero</a> : null}
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
                <span className={`status ${getSessionStatusClass(sessionEditDraft.status)}`}>
                  {getSessionStatusLabel(sessionEditDraft.status, true)}
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
                  País del Horario
                  <input value={sessionEditDraft.countryOfSchedule} onChange={(event) => setSessionEditDraft((current) => ({ ...current, countryOfSchedule: event.target.value }))} placeholder="Ejemplo: Perú" />
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
                    <option value="inactive">Inactiva</option>
                  </select>
                </label>
                <div className="session-dashboard-inline">
                  <DashboardItemsEditor
                    compact
                    items={sessionEditDraft.dashboardItems}
                    onAdd={addSessionEditDashboardItem}
                    onRemove={removeSessionEditDashboardItem}
                    onUpdate={(index, field, value) => {
                      if (field !== "sessionId") updateSessionEditDashboardItem(index, field, value);
                    }}
                    title="Información para tablero"
                  />
                </div>
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
                      <span className={`status ${getSessionStatusClass(session.attendance_status)}`}>
                        {getSessionStatusLabel(session.attendance_status)}
                      </span>
                    </td>
                    <td>
                      <button className="button secondary table-action" type="button" onClick={() => editSession(session)}>
                        Editar
                      </button>
                      {session.attendance_status === "inactive" ? null : session.attendance_status === "open" ? (
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

function DashboardItemsEditor({
  title,
  items,
  sessions = [],
  compact = false,
  onAdd,
  onRemove,
  onUpdate
}: {
  title: string;
  items: DashboardItemDraft[];
  sessions?: AdminSession[];
  compact?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: "sessionId" | "name" | "iconKey" | "valueType" | "value" | "visibility" | "sortOrder" | "status", value: string) => void;
}) {
  return (
    <div className={`dashboard-admin-section${compact ? " compact" : ""}`}>
      <div className="mini-section-heading">
        <strong>{title}</strong>
        <button className="button secondary table-action" type="button" onClick={onAdd}>Agregar información</button>
      </div>
      {items.length === 0 ? <p className="blocked-message">No hay información configurada.</p> : null}
      <div className="dashboard-item-list">
        {items.map((item, index) => (
          <div className="dashboard-item-editor" key={`${title}-${index}`}>
            <label>
              Orden
              <input min="1" type="number" value={item.sortOrder} onChange={(event) => onUpdate(index, "sortOrder", event.target.value)} />
            </label>
            {sessions.length ? (
              <label>
                Sesión
                <select value={item.sessionId} onChange={(event) => onUpdate(index, "sessionId", event.target.value)} required>
                  <option value="">Seleccione sesión</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>{session.title} - {session.theme}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              Nombre
              <input value={item.name} onChange={(event) => onUpdate(index, "name", event.target.value)} placeholder="Ejemplo: Enlace Zoom" required />
            </label>
            <label>
              Icono
              <select value={item.iconKey} onChange={(event) => onUpdate(index, "iconKey", event.target.value)}>
                {DASHBOARD_ITEM_ICONS.map((icon) => (
                  <option key={icon.key} value={icon.key}>{icon.symbol ? `${icon.symbol} ${icon.label}` : icon.label}</option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select value={item.valueType} onChange={(event) => {
                onUpdate(index, "valueType", event.target.value);
                if (event.target.value !== "link") onUpdate(index, "visibility", "public");
              }}>
                <option value="text">Texto</option>
                <option value="link">Enlace</option>
              </select>
            </label>
            <label>
              Visibilidad
              <select value={item.visibility} onChange={(event) => onUpdate(index, "visibility", event.target.value)} disabled={item.valueType !== "link"}>
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </label>
            <label className="wide-field">
              Valor
              <input value={item.value} onChange={(event) => onUpdate(index, "value", event.target.value)} placeholder={item.valueType === "link" ? "https://..." : "Texto a mostrar"} required />
            </label>
            <label>
              Estado
              <select value={item.status} onChange={(event) => onUpdate(index, "status", event.target.value)}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>
            <button className="text-button danger" type="button" onClick={() => onRemove(index)}>Quitar</button>
          </div>
        ))}
      </div>
    </div>
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

function RichEditable({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      className="rich-editor"
      contentEditable
      data-placeholder={placeholder}
      onBlur={(event) => onChange(sanitizeClientHtml(event.currentTarget.innerHTML))}
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
      ref={ref}
      suppressContentEditableWarning
    />
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
  const [documentType, setDocumentType] = React.useState("DNI");
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

  const documentTypeOptions = data?.catalogs?.tipodocumento?.filter((item) => item.status === "active") ?? fallbackDocumentTypeOptions;

  React.useEffect(() => {
    if (documentTypeOptions.length > 0 && !documentTypeOptions.some((item) => item.name === documentType)) {
      setDocumentType(documentTypeOptions[0].name);
    }
  }, [documentType, documentTypeOptions]);

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
              {documentTypeOptions.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
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
  const [documentType, setDocumentType] = React.useState("DNI");
  const [documentTypeOptions, setDocumentTypeOptions] = React.useState<CatalogItem[]>(fallbackDocumentTypeOptions);
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
    fetch("/api/public/catalogs/tipodocumento/items")
      .then((response) => (response.ok ? response.json() as Promise<{ items: CatalogItem[] }> : Promise.reject()))
      .then((payload) => {
        const items = payload.items.length > 0 ? payload.items : fallbackDocumentTypeOptions;
        setDocumentTypeOptions(items);
        setDocumentType((current) => items.some((item) => item.name === current) ? current : items[0].name);
      })
      .catch(() => setDocumentTypeOptions(fallbackDocumentTypeOptions));
  }, []);

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

  React.useEffect(() => {
    if (!question) return;
    const previousTitle = document.title;
    document.title = question.browser_title?.trim() || question.question_text || "Pregunta interactiva";
    return () => {
      document.title = previousTitle;
    };
  }, [question]);

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
                  {documentTypeOptions.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
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
        {attendanceUrl ? (
          <a className="button attendance-cta" href={attendanceUrl}>
            <span aria-hidden="true">+</span>
            Registrar asistencia
          </a>
        ) : null}
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

  React.useEffect(() => {
    if (!question) return;
    const previousTitle = document.title;
    document.title = question.browser_title?.trim() || question.question_text || "Nube de respuestas";
    return () => {
      document.title = previousTitle;
    };
  }, [question]);

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

function BoardParticipantView({ slug }: { slug: string }) {
  const [board, setBoard] = React.useState<EventBoard | null>(null);
  const [countries, setCountries] = React.useState<CatalogItem[]>([]);
  const [form, setForm] = React.useState({ firstName: "", lastName: "", countryId: "", noteHtml: "" });
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [showBoard, setShowBoard] = React.useState(true);
  const [notes, setNotes] = React.useState<EventBoardNote[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    fetch(`/api/public/boards/${slug}`)
      .then((response) => response.ok ? response.json() as Promise<{ board: EventBoard }> : Promise.reject())
      .then((payload: { board: EventBoard }) => setBoard(payload.board))
      .catch(() => setMessage("Pizarra no disponible."));
    fetch("/api/public/catalogs/pais/items")
      .then((response) => response.ok ? response.json() as Promise<{ items: CatalogItem[] }> : Promise.reject())
      .then((payload) => setCountries(payload.items))
      .catch(() => setCountries([]));
  }, [slug]);

  const loadPublicNotes = React.useCallback(async () => {
    const response = await fetch(`/api/public/boards/${slug}/notes?page=${page}&pageSize=48`);
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      board?: EventBoard;
      notes?: EventBoardNote[];
      totalPages?: number;
      total?: number;
      message?: string;
    } | null;
    if (!response.ok || !payload?.ok || !payload.board) {
      setMessage(payload?.message ?? "No se pudo cargar la pizarra.");
      return;
    }
    setBoard(payload.board);
    setNotes(payload.notes ?? []);
    setTotalPages(payload.totalPages ?? 1);
    setTotal(payload.total ?? 0);
  }, [page, slug]);

  React.useEffect(() => {
    if (!showBoard) return;
    let active = true;
    const loadIfActive = async () => {
      if (!active) return;
      await loadPublicNotes();
    };
    void loadIfActive();
    const interval = window.setInterval(loadIfActive, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [loadPublicNotes, showBoard]);

  React.useEffect(() => {
    if (!board) return;
    const previousTitle = document.title;
    document.title = board.browser_title?.trim() || board.title || "Pizarra interactiva";
    return () => {
      document.title = previousTitle;
    };
  }, [board]);

  if (!board) return <PublicMessage title="Pizarra interactiva" message={message || "Cargando pizarra."} />;

  const selectedCountry = countries.find((country) => country.id === form.countryId);
  const noteText = stripHtml(form.noteHtml);
  const canSubmit = board.status === "open";

  async function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!board || !selectedCountry) return;
    setSubmitting(true);
    setMessage("");
    const response = await fetch(`/api/public/boards/${slug}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        countryId: selectedCountry.id,
        countryName: selectedCountry.name,
        countryIso2: countryIsoMap[cleanText(selectedCountry.name).toLowerCase()] ?? null,
        noteHtml: sanitizeClientHtml(form.noteHtml)
      })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    setSubmitting(false);
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "No se pudo registrar la nota.");
      return;
    }
    setForm((current) => ({ ...current, noteHtml: "" }));
    setMessage("Nota registrada correctamente.");
  }

  if (showBoard) {
    return (
      <main className="board-presenter-page">
        <section className="board-presenter-stage participant-board-stage">
          <p className="eyebrow">{board.event_title}</p>
          <h1>{board.title}</h1>
          <div className="actions centered-actions board-view-action">
            <button className="button board-view-button" type="button" onClick={() => setShowBoard(false)}>Registrar Respuesta</button>
          </div>
          <div className="board-toolbar">
            <strong>{total} notas</strong>
            <span className={`status ${board.status === "open" ? "open" : "closed"}`}>{board.status}</span>
          </div>
          {notes.length > 0 ? (
            <div className="postit-grid">
              {notes.map((note, index) => {
                const isExpanded = Boolean(expanded[note.id]);
                return (
                  <article className={`postit-card tone-${index % 5}`} key={note.id}>
                    <div className="postit-head">
                      <FlagMark countryName={note.country_name} iso2={note.country_iso2} />
                      <strong>{note.first_name.split(" ")[0]} {note.last_name.split(" ")[0]}</strong>
                    </div>
                    <div
                      className={isExpanded ? "postit-body expanded" : "postit-body"}
                      dangerouslySetInnerHTML={{ __html: isExpanded ? note.note_html : cleanText(note.note_excerpt) }}
                    />
                    {note.note_text.length > 50 ? (
                      <button className="text-button" type="button" onClick={() => setExpanded((current) => ({ ...current, [note.id]: !isExpanded }))}>
                        {isExpanded ? "Ver menos" : "..."}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-cloud">Esperando notas...</p>
          )}
          {totalPages > 1 ? (
            <div className="presenter-pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
              <span>{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Siguiente</button>
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="board-public-page">
      <section className="board-public-stage">
        <p className="eyebrow">{board.event_title}</p>
        <h1>{board.title}</h1>
        <div className="instruction-card-row">
          {board.instructions?.map((instruction) => (
            <article className="instruction-card" key={instruction.id ?? instruction.sort_order}>
              {instruction.language_label ? <strong>{instruction.language_label}</strong> : null}
              <div dangerouslySetInnerHTML={{ __html: instruction.content_html }} />
            </article>
          ))}
        </div>
        {!canSubmit ? <p className="blocked-message">La pizarra ya no recibe nuevas notas.</p> : null}
        {canSubmit ? (
          <form className="board-note-form" onSubmit={submitNote}>
            <div className="builder-grid">
              <label>
                Nombre
                <input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required />
              </label>
              <label>
                Apellido
                <input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} required />
              </label>
              <label>
                País
                <select value={form.countryId} onChange={(event) => setForm((current) => ({ ...current, countryId: event.target.value }))} required>
                  <option value="">Seleccione</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
                {selectedCountry ? (
                  <span className="country-preview">
                    <FlagMark countryName={selectedCountry.name} />
                    {selectedCountry.name}
                  </span>
                ) : null}
              </label>
            </div>
            <label className="rich-label">
              Nota
              <RichEditable value={form.noteHtml} onChange={(value) => setForm((current) => ({ ...current, noteHtml: value }))} placeholder="Escriba o pegue su nota" />
              <span className="field-hint">{noteText.length} / {board.max_note_length}</span>
            </label>
            <div className="actions centered-actions">
              <button className="button" type="submit" disabled={submitting || noteText.length > board.max_note_length}>
                {submitting ? "Registrando..." : "Publicar respuesta"}
              </button>
            </div>
          </form>
        ) : null}
        <div className="actions centered-actions board-view-action">
          <button className="secondary-button" type="button" onClick={() => { setPage(1); setShowBoard(true); }}>
            Regresar a pizarra de respuestas
          </button>
        </div>
        {message ? <p className={message.includes("correctamente") ? "form-success" : "form-error"}>{message}</p> : null}
      </section>
    </main>
  );
}

function BoardPresenterView({ slug }: { slug: string }) {
  const [board, setBoard] = React.useState<EventBoard | null>(null);
  const [notes, setNotes] = React.useState<EventBoardNote[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState("");

  const loadNotes = React.useCallback(async () => {
    const response = await fetch(`/api/public/board-presenter/${slug}/notes?page=${page}&pageSize=48`);
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      board?: EventBoard;
      notes?: EventBoardNote[];
      totalPages?: number;
      total?: number;
      message?: string;
    } | null;
    if (!response.ok || !payload?.ok || !payload.board) {
      setMessage(payload?.message ?? "Pizarra no disponible.");
      return;
    }
    setBoard(payload.board);
    setNotes(payload.notes ?? []);
    setTotalPages(payload.totalPages ?? 1);
    setTotal(payload.total ?? 0);
    setMessage("");
  }, [page, slug]);

  React.useEffect(() => {
    let active = true;
    const loadIfActive = async () => {
      if (!active) return;
      await loadNotes();
    };
    void loadIfActive();
    const interval = window.setInterval(loadIfActive, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [loadNotes]);

  React.useEffect(() => {
    if (!board) return;
    const previousTitle = document.title;
    document.title = board.browser_title?.trim() || board.title || "Pizarra";
    return () => {
      document.title = previousTitle;
    };
  }, [board]);

  async function moderateNote(note: EventBoardNote) {
    const participant = `${note.first_name} ${note.last_name}`.trim();
    const ok = window.confirm(`¿Está seguro de eliminar la nota de ${participant}?`);
    if (!ok) return;
    const response = await fetch(`/api/public/board-presenter/${slug}/notes/${note.id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "No se pudo eliminar la nota.");
      return;
    }
    setExpanded((current) => {
      const next = { ...current };
      delete next[note.id];
      return next;
    });
    await loadNotes();
  }

  if (!board) return <PublicMessage title="Vista de pizarra" message={message || "Cargando notas."} />;

  return (
    <main className="board-presenter-page">
      <section className="board-presenter-stage">
        <p className="eyebrow">{board.event_title}</p>
        <h1>{board.title}</h1>
        <div className="instruction-card-row compact">
          {board.instructions?.map((instruction) => (
            <article className="instruction-card" key={instruction.id ?? instruction.sort_order}>
              {instruction.language_label ? <strong>{instruction.language_label}</strong> : null}
              <div dangerouslySetInnerHTML={{ __html: instruction.content_html }} />
            </article>
          ))}
        </div>
        <div className="board-toolbar">
          <strong>{total} notas</strong>
          <span className={`status ${board.status === "open" ? "open" : "closed"}`}>{board.status}</span>
        </div>
        {notes.length > 0 ? (
          <div className="postit-grid">
            {notes.map((note, index) => {
              const isExpanded = Boolean(expanded[note.id]);
              return (
                <article className={`postit-card tone-${index % 5}`} key={note.id}>
                  <button
                    aria-label="Eliminar nota"
                    className="postit-delete"
                    onClick={() => void moderateNote(note)}
                    title="Eliminar nota"
                    type="button"
                  >
                    ×
                  </button>
                  <div className="postit-head">
                    <FlagMark countryName={note.country_name} iso2={note.country_iso2} />
                    <strong>{note.first_name.split(" ")[0]} {note.last_name.split(" ")[0]}</strong>
                  </div>
                  <div
                    className={isExpanded ? "postit-body expanded" : "postit-body"}
                    dangerouslySetInnerHTML={{ __html: isExpanded ? note.note_html : cleanText(note.note_excerpt) }}
                  />
                  {note.note_text.length > 50 ? (
                    <button className="text-button" type="button" onClick={() => setExpanded((current) => ({ ...current, [note.id]: !isExpanded }))}>
                      {isExpanded ? "Ver menos" : "..."}
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-cloud">Esperando notas...</p>
        )}
        {totalPages > 1 ? (
          <div className="presenter-pagination">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
            <span>{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Siguiente</button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function SurveyPublicView({ slug }: { slug: string }) {
  const [survey, setSurvey] = React.useState<EventSurvey | null>(null);
  const [message, setMessage] = React.useState("Cargando encuesta.");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const loadSurvey = React.useCallback(async () => {
    const response = await fetch(`/api/public/surveys/${slug}`);
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; survey?: EventSurvey; message?: string } | null;
    if (!response.ok || !payload?.ok || !payload.survey) {
      setMessage(payload?.message ?? "Encuesta no disponible.");
      return;
    }
    setSurvey(payload.survey);
  }, [slug]);

  React.useEffect(() => {
    void loadSurvey();
  }, [loadSurvey]);

  React.useEffect(() => {
    const timer = window.setInterval(() => void loadSurvey(), 4000);
    return () => window.clearInterval(timer);
  }, [loadSurvey]);

  React.useEffect(() => {
    if (!survey) return;
    document.title = cleanText(survey.browser_title ?? survey.title);
  }, [survey]);

  const questions = survey?.questions ?? [];
  const question = questions[currentIndex] ?? questions[0];
  const totalVotes = Number(question?.vote_count ?? 0);
  const canVote = survey?.status === "open";

  React.useEffect(() => {
    setSelectedOptions([]);
    setShowForm(false);
  }, [currentIndex]);

  if (!survey) return <PublicMessage title="Encuesta interactiva" message={message} />;
  if (!question) return <PublicMessage title={survey.title} message="La encuesta aun no tiene preguntas activas." />;

  function getParticipantKey() {
    const storageKey = `survey-participant-${slug}`;
    let value = window.localStorage.getItem(storageKey);
    if (!value) {
      value = crypto.randomUUID();
      window.localStorage.setItem(storageKey, value);
    }
    return value;
  }

  function toggleOption(optionId: string) {
    if (!question) return;
    const maxAnswers = question.allow_multiple_answers ? Math.max(question.max_answers_per_participant, 1) : 1;
    setSelectedOptions((current) => {
      if (!question.allow_multiple_answers) return [optionId];
      if (current.includes(optionId)) return current.filter((item) => item !== optionId);
      if (current.length >= maxAnswers) return current;
      return [...current, optionId];
    });
  }

  async function submitVote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question || selectedOptions.length === 0) return;
    setSubmitting(true);
    const response = await fetch(`/api/public/surveys/${slug}/questions/${question.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIds: selectedOptions, participantKey: getParticipantKey() })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; survey?: EventSurvey } | null;
    setSubmitting(false);
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "No se pudo registrar la respuesta.");
      return;
    }
    if (payload.survey) setSurvey(payload.survey);
    setMessage("Respuesta registrada correctamente.");
    setShowForm(false);
  }

  const optionRows = question.options ?? [];

  return (
    <main className="survey-public-page">
      <section className="survey-public-stage">
        <p className="eyebrow">{cleanText(survey.event_title)}</p>
        <h1>{cleanText(survey.title)}</h1>
        <div className="survey-progress">
          <span>Pregunta {currentIndex + 1} de {questions.length}</span>
          <span className={`status ${survey.status === "open" ? "open" : "closed"}`}>{survey.status}</span>
        </div>

        {!showForm ? (
          <section className="survey-results-panel">
            <h2>{cleanText(question.question_text)}</h2>
            {question.description ? <p>{cleanText(question.description)}</p> : null}
            <div className="actions centered-actions">
              <button className="button survey-register-button" type="button" onClick={() => setShowForm(true)} disabled={!canVote}>
                Registrar Respuesta
              </button>
            </div>
            {!canVote ? <p className="blocked-message">La encuesta ya no recibe respuestas.</p> : null}
            <SurveyChart question={question} />
            <p className="survey-total">{totalVotes} voto{totalVotes === 1 ? "" : "s"} registrados</p>
          </section>
        ) : (
          <form className="survey-vote-form" onSubmit={submitVote}>
            <h2>{cleanText(question.question_text)}</h2>
            {question.description ? <p>{cleanText(question.description)}</p> : null}
            <div className="survey-option-choice-list">
              {optionRows.map((option) => {
                const selected = selectedOptions.includes(option.id ?? "");
                return (
                  <label className={`survey-option-choice${selected ? " selected" : ""}`} key={option.id}>
                    <input
                      checked={selected}
                      name="survey-option"
                      onChange={() => option.id && toggleOption(option.id)}
                      type={question.allow_multiple_answers ? "checkbox" : "radio"}
                    />
                    <span>{cleanText(option.option_text)}</span>
                  </label>
                );
              })}
            </div>
            {question.allow_multiple_answers ? <span className="field-hint">Seleccionadas {selectedOptions.length} / {question.max_answers_per_participant}</span> : null}
            <div className="actions centered-actions">
              <button className="button" disabled={submitting || selectedOptions.length === 0} type="submit">Registrar respuesta</button>
              <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Regresar a resultados</button>
            </div>
          </form>
        )}

        <div className="survey-navigation">
          <button className="secondary-button" type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => Math.max(value - 1, 0))}>
            Pregunta anterior
          </button>
          <button className="button secondary" type="button" disabled={currentIndex >= questions.length - 1} onClick={() => setCurrentIndex((value) => Math.min(value + 1, questions.length - 1))}>
            Siguiente pregunta
          </button>
        </div>
      </section>
    </main>
  );
}

function SurveyChart({ question }: { question: EventSurveyQuestion }) {
  const options = question.options ?? [];
  const total = options.reduce((sum, option) => sum + Number(option.vote_count ?? 0), 0);
  const colors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d", "#4b5563"];

  if (question.chart_type === "pie") {
    let cumulative = 0;
    const gradient = options.map((option, index) => {
      const percentage = total ? (Number(option.vote_count ?? 0) / total) * 100 : 0;
      const start = cumulative;
      cumulative += percentage;
      return `${colors[index % colors.length]} ${start}% ${cumulative}%`;
    }).join(", ");
    return (
      <div className="survey-pie-layout">
        <div className="survey-pie" style={{ background: total ? `conic-gradient(${gradient})` : "#e2e8f0" }} />
        <div className="survey-legend">
          {options.map((option, index) => {
            const votes = Number(option.vote_count ?? 0);
            const percentage = total ? Math.round((votes / total) * 100) : 0;
            return (
              <div className="survey-legend-row" key={option.id ?? option.option_text}>
                <span className="survey-color-dot" style={{ background: colors[index % colors.length] }} />
                <strong>{cleanText(option.option_text)}</strong>
                <span>{votes} · {percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="survey-bar-chart">
      {options.map((option, index) => {
        const votes = Number(option.vote_count ?? 0);
        const percentage = total ? Math.round((votes / total) * 100) : 0;
        return (
          <div className="survey-bar-row" key={option.id ?? option.option_text}>
            <div className="survey-bar-label">
              <strong>{cleanText(option.option_text)}</strong>
              <span>{votes} · {percentage}%</span>
            </div>
            <div className="survey-bar-track">
              <span className="survey-bar-fill" style={{ width: `${percentage}%`, background: colors[index % colors.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardPublicView({ slug }: { slug: string }) {
  const [dashboard, setDashboard] = React.useState<EventDashboard | null>(null);
  const [message, setMessage] = React.useState("Cargando tablero.");
  const [page, setPage] = React.useState(1);
  const [privateResource, setPrivateResource] = React.useState<EventDashboardItem | null>(null);
  const pageSize = 18;

  React.useEffect(() => {
    fetch(`/api/public/dashboards/${slug}`)
      .then((response) => response.ok ? response.json() as Promise<{ dashboard: EventDashboard }> : Promise.reject())
      .then((payload) => {
        setDashboard(payload.dashboard);
        document.title = cleanText(payload.dashboard.browser_title ?? payload.dashboard.title);
      })
      .catch(() => setMessage("No se pudo cargar el tablero."));
  }, [slug]);

  if (!dashboard) return <PublicMessage title="Tablero no disponible" message={message} />;

  const sessions = dashboard.sessions ?? [];
  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize));
  const visibleSessions = sessions.slice((page - 1) * pageSize, page * pageSize);
  const moduleIds = Array.from(new Set(sessions.map((session) => session.module_id)));

  return (
    <main className="dashboard-public-page">
      <section className="dashboard-public-stage">
        <div className="dashboard-hero-panel">
          <p className="eyebrow">{cleanText(dashboard.event_title)}</p>
          <h1>{cleanText(dashboard.title)}</h1>

          {dashboard.instructions?.length ? (
            <div className="instruction-card-row dashboard-instructions">
              {dashboard.instructions.map((instruction) => (
                <article className="instruction-card" key={instruction.id ?? instruction.sort_order}>
                  {instruction.language_label ? <strong>{cleanText(instruction.language_label)}</strong> : null}
                  <div dangerouslySetInnerHTML={{ __html: instruction.content_html }} />
                </article>
              ))}
            </div>
          ) : null}
        </div>

        {dashboard.eventItems?.length ? (
          <section className="dashboard-info-band">
            <h2>Información General</h2>
            <DashboardInfoList dashboard={dashboard} items={dashboard.eventItems} onPrivateResource={setPrivateResource} />
          </section>
        ) : null}

        <section className="dashboard-sessions-section">
          <h2>Sesiones</h2>
          <div className="dashboard-session-grid">
            {visibleSessions.map((session) => {
              const tone = moduleIds.indexOf(session.module_id) % 6;
              return (
                <article className={`dashboard-session-card module-tone-${tone}`} key={session.id}>
                  <div className="session-card-header">
                    <span className="session-module">{cleanText(session.module_title)}</span>
                  </div>
                  <h3 className="session-card-title">{cleanText(session.title)}</h3>
                  <p>{cleanText(session.theme)}</p>
                  <div className="session-meta">
                    <span>{formatSessionDateTime(session.session_date, session.start_time, session.end_time, session.country_of_schedule)}</span>
                  </div>
                  {session.items?.length ? <DashboardInfoList dashboard={dashboard} items={session.items} compact onPrivateResource={setPrivateResource} /> : null}
                </article>
              );
            })}
          </div>
          {sessions.length === 0 ? <p className="empty-cloud">No hay sesiones configuradas.</p> : null}
          {totalPages > 1 ? (
            <div className="presenter-pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
              <span>{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Siguiente</button>
            </div>
          ) : null}
        </section>
        {privateResource ? (
          <PrivateResourceModal
            dashboard={dashboard}
            item={privateResource}
            onClose={() => setPrivateResource(null)}
            slug={slug}
          />
        ) : null}
      </section>
    </main>
  );
}

function DashboardInfoList({
  dashboard,
  items,
  compact = false,
  onPrivateResource
}: {
  dashboard: EventDashboard;
  items: EventDashboardItem[];
  compact?: boolean;
  onPrivateResource: (item: EventDashboardItem) => void;
}) {
  return (
    <div className={compact ? "dashboard-info-list compact" : "dashboard-info-list"}>
      {[...items].sort((a, b) => a.sort_order - b.sort_order).map((item) => {
        const icon = getDashboardItemIcon(item.icon_key);
        const label = (
          <strong>
            {icon.className ? <span className={`dashboard-info-icon ${icon.className}`} aria-hidden="true" /> : icon.symbol ? <span className="dashboard-info-icon" aria-hidden="true">{icon.symbol}</span> : null}
            {cleanText(item.name)}
          </strong>
        );
        if (item.value_type === "link" && (item.visibility === "private" || item.is_private)) {
          return (
            <button className="dashboard-info-row dashboard-info-link private-resource-button" key={item.id ?? `${item.name}-${item.sort_order}`} onClick={() => onPrivateResource(item)} type="button">
              {label}
              <span className="private-resource-badge">Privado</span>
            </button>
          );
        }
        return item.value_type === "link" ? (
          <a className="dashboard-info-row dashboard-info-link" href={item.value} key={item.id ?? `${item.name}-${item.sort_order}`} target="_blank" rel="noreferrer">
            {label}
          </a>
        ) : (
          <div className="dashboard-info-row dashboard-info-text" key={item.id ?? `${item.name}-${item.sort_order}`}>
            {label}
            <span>{cleanText(item.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function PrivateResourceModal({
  dashboard,
  item,
  onClose,
  slug
}: {
  dashboard: EventDashboard;
  item: EventDashboardItem;
  onClose: () => void;
  slug: string;
}) {
  const [documentType, setDocumentType] = React.useState("DNI");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [registrationForm, setRegistrationForm] = React.useState<ResourceRegistrationResponse | null>(null);
  const [fields, setFields] = React.useState<Record<string, string>>({});
  const [message, setMessage] = React.useState("Este recurso es para personas registradas en la comunidad del evento. Identifíquese para abrirlo.");
  const [needsRegistration, setNeedsRegistration] = React.useState(false);
  const [resourceSectionIndex, setResourceSectionIndex] = React.useState(0);
  const [departments, setDepartments] = React.useState<LocationOption[]>([]);
  const [provinces, setProvinces] = React.useState<LocationOption[]>([]);
  const [districts, setDistricts] = React.useState<LocationOption[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState("");
  const [selectedProvinceId, setSelectedProvinceId] = React.useState("");
  const [organizationProvinces, setOrganizationProvinces] = React.useState<LocationOption[]>([]);
  const [organizationDistricts, setOrganizationDistricts] = React.useState<LocationOption[]>([]);
  const [selectedOrganizationDepartmentId, setSelectedOrganizationDepartmentId] = React.useState("");
  const [selectedOrganizationProvinceId, setSelectedOrganizationProvinceId] = React.useState("");
  const [registrationLoading, setRegistrationLoading] = React.useState(false);
  const [registrationLoadError, setRegistrationLoadError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const eventSlug = dashboard.event_slug ?? "";
  const documentTypeOptions = registrationForm?.catalogs?.tipodocumento?.filter((catalogItem) => catalogItem.status === "active") ?? fallbackDocumentTypeOptions;

  React.useEffect(() => {
    if (!eventSlug) {
      setRegistrationLoadError("No se encontró el enlace de registro asociado al evento.");
      return;
    }
    setRegistrationLoading(true);
    setRegistrationLoadError("");
    fetch(`/api/public/events/${eventSlug}/registration-form`)
      .then((response) => response.ok ? response.json() as Promise<ResourceRegistrationResponse> : Promise.reject())
      .then(setRegistrationForm)
      .catch(() => setRegistrationLoadError("No se pudo preparar el formulario de registro del evento. Intente nuevamente en unos segundos."))
      .finally(() => setRegistrationLoading(false));
  }, [eventSlug]);

  React.useEffect(() => {
    fetch("/api/public/location/departments")
      .then((response) => (response.ok ? response.json() as Promise<{ departments: LocationOption[] }> : Promise.reject()))
      .then((payload) => setDepartments(payload.departments))
      .catch(() => setDepartments([]));
  }, []);

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  async function identify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setNeedsRegistration(false);
    const response = await fetch(`/api/public/dashboards/${slug}/resources/${item.id}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; url?: string; message?: string; needsRegistration?: boolean } | null;
    setSubmitting(false);

    if (response.ok && payload?.url) {
      openUrl(payload.url);
      return;
    }

    setFields((current) => ({
      ...current,
      datos_generales_tipo_docidentidad: documentType,
      datos_generales_numero_documento: documentNumber
    }));
    setNeedsRegistration(Boolean(payload?.needsRegistration));
    setResourceSectionIndex(0);
    setMessage(payload?.message ?? "Aún no encontramos su registro. Puede registrarse en un momento y acceder al recurso.");
  }

  function updateField(fieldKey: string, value: string, field?: PublicFormField) {
    const textValidation = field ? textValidationForField(field) : legacyTextValidation(fieldKey);
    let nextValue = value;
    if (textValidation === "numbers") nextValue = value.replace(/\D/g, "");
    if (textValidation === "letters") nextValue = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
    setFields((current) => ({ ...current, [fieldKey]: nextValue }));
  }

  function isResourcePeru(value: string | undefined) {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase() === "PERU";
  }

  function isResourceOptionalForeignLocationField(fieldKey: string) {
    return (
      ["ubicacion_departamento", "ubicacion_provincia", "ubicacion_distrito"].includes(fieldKey) &&
      !isResourcePeru(fields.ubicacion_pais)
    );
  }

  function isResourceOptionalOrganizationLocationField(fieldKey: string) {
    return (
      ["organizacion_departamento", "organizacion_provincia", "organizacion_distrito"].includes(fieldKey) &&
      !isResourcePeru(fields.organizacion_pais)
    );
  }

  function isResourceOrganizationDetailField(fieldKey: string) {
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

  function normalizedResourceText(value: string | null | undefined) {
    return cleanText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function isResourceActivityProductField(field: PublicFormField) {
    const label = normalizedResourceText(field.label);

    return [
      "actividad_producto_agrario",
      "actividad_productos_pecuario",
      "actividad_productos_forestales"
    ].includes(field.field_key) || label === "principal producto";
  }

  function updateResourceProducerAnswer(value: string) {
    setFields((current) => {
      if (value !== "SI") {
        const productFieldKeys = registrationForm?.sections
          ?.flatMap((section) => section.fields)
          .filter((field) => isResourceActivityProductField(field))
          .map((field) => field.field_key) ?? [];
        const next: Record<string, string> = { ...current, actividad_es_productor_agrario_pecuario_forestal: value };

        productFieldKeys.forEach((fieldKey) => {
          delete next[fieldKey];
        });

        return next;
      }

      return { ...current, actividad_es_productor_agrario_pecuario_forestal: value };
    });
    setMessage("");
  }

  function updateResourceOrganizationAnswer(value: string) {
    setFields((current) => {
      if (value !== "SI") {
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

        return { ...rest, organizacion_pertenece_a_organizacion: value };
      }

      return { ...current, organizacion_pertenece_a_organizacion: value };
    });
    setSelectedOrganizationDepartmentId("");
    setSelectedOrganizationProvinceId("");
    setOrganizationProvinces([]);
    setOrganizationDistricts([]);
    setMessage("");
  }

  function updateResourceCountry(fieldKey: string, value: string, field: PublicFormField) {
    updateField(fieldKey, value, field);

    if (fieldKey === "ubicacion_pais" && !isResourcePeru(value)) {
      setSelectedDepartmentId("");
      setSelectedProvinceId("");
      setProvinces([]);
      setDistricts([]);
      setFields((current) => ({
        ...current,
        ubicacion_pais: value,
        ubicacion_departamento: "",
        ubicacion_provincia: "",
        ubicacion_distrito: ""
      }));
    }

    if (fieldKey === "organizacion_pais" && !isResourcePeru(value)) {
      setSelectedOrganizationDepartmentId("");
      setSelectedOrganizationProvinceId("");
      setOrganizationProvinces([]);
      setOrganizationDistricts([]);
      setFields((current) => ({
        ...current,
        organizacion_pais: value,
        organizacion_departamento: "",
        organizacion_provincia: "",
        organizacion_distrito: ""
      }));
    }
  }

  async function selectResourceDepartment(departmentId: string) {
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

  async function selectResourceProvince(provinceId: string) {
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

  function selectResourceDistrict(districtId: string) {
    const district = districts.find((item) => item.id === districtId);
    updateField("ubicacion_distrito", district?.name ?? "");
  }

  async function selectResourceOrganizationDepartment(departmentId: string) {
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

  async function selectResourceOrganizationProvince(provinceId: string) {
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

  function selectResourceOrganizationDistrict(districtId: string) {
    const district = organizationDistricts.find((item) => item.id === districtId);
    updateField("organizacion_distrito", district?.name ?? "");
  }

  function validEmail() {
    const emailField = registrationForm?.sections
      ?.flatMap((section) => section.fields)
      .find((field) => field.field_key === "datos_generales_correo_electronico");
    if (!emailField) return true;
    const email = fields.datos_generales_correo_electronico?.trim() ?? "";
    if (!email) return !Boolean(emailField.is_required);
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function validEmailForSection(section: PublicFormSection | undefined) {
    if (!section) return true;
    const emailField = section.fields.find((field) => field.field_key === "datos_generales_correo_electronico");
    if (!emailField) return true;

    const email = fields.datos_generales_correo_electronico?.trim() ?? "";
    if (!email) return !Boolean(emailField.is_required);

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function previousResourceSection() {
    if (resourceSectionIndex === 0) {
      setNeedsRegistration(false);
      setMessage("Este recurso es para personas registradas en la comunidad del evento. Identifíquese para abrirlo.");
      return;
    }

    setResourceSectionIndex((current) => Math.max(0, current - 1));
    setMessage("");
  }

  function submitResourceSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sections = registrationForm?.sections ?? [];
    const currentSection = sections[resourceSectionIndex];

    if (!validEmailForSection(currentSection)) {
      setMessage("Ingrese un correo electrónico válido, por ejemplo nombre@dominio.com.");
      return;
    }

    if (resourceSectionIndex < sections.length - 1) {
      setResourceSectionIndex((current) => current + 1);
      setMessage("");
      return;
    }

    void register(event);
  }

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validEmail()) {
      setMessage("Ingrese un correo electrónico válido, por ejemplo nombre@dominio.com.");
      return;
    }

    if (!eventSlug || !registrationForm) {
      setMessage("No se pudo preparar el formulario de registro del evento.");
      return;
    }

    setSubmitting(true);
    const response = await fetch(`/api/public/events/${eventSlug}/resource-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber, fields })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (!response.ok || !payload?.ok) {
      setSubmitting(false);
      setMessage(payload?.message ?? "No se pudo completar el registro.");
      return;
    }

    const accessResponse = await fetch(`/api/public/dashboards/${slug}/resources/${item.id}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, documentNumber })
    });
    const accessPayload = (await accessResponse.json().catch(() => null)) as { url?: string; message?: string } | null;
    setSubmitting(false);

    if (accessResponse.ok && accessPayload?.url) {
      openUrl(accessPayload.url);
      return;
    }

    setMessage(accessPayload?.message ?? "Registro completado, pero no se pudo abrir el recurso.");
  }

  const registrationSections = registrationForm?.sections ?? [];
  const currentRegistrationSection = registrationSections[resourceSectionIndex];
  const registrationProgressSteps = ["Documento", ...registrationSections.map((section) => cleanText(section.title))];
  const currentRegistrationProgressIndex = needsRegistration ? resourceSectionIndex + 1 : 0;
  const showRegistration = needsRegistration;

  return (
    <div className="resource-modal-backdrop" role="dialog" aria-modal="true">
      <section className="resource-modal">
        <button className="resource-modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <p className="eyebrow">Recurso privado</p>
        <h2>{cleanText(item.name)}</h2>
        <p>{message}</p>

        <form className="resource-identify-form" onSubmit={identify}>
          <label>
            Tipo de documento
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
              {documentTypeOptions.map((catalogItem) => (
                <option key={catalogItem.id} value={catalogItem.name}>{cleanText(catalogItem.name)}</option>
              ))}
            </select>
          </label>
          <label>
            Número de documento
            <input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} required />
          </label>
          <button className="button" type="submit" disabled={submitting || !item.id}>
            {submitting ? "Validando..." : "Continuar"}
          </button>
        </form>

        {showRegistration ? (
          <div className="resource-registration-intro">
            <strong>Complete su registro para acceder a este recurso.</strong>
            <span>El registro toma un momento y le permitirá acceder a los contenidos privados del evento.</span>
          </div>
        ) : null}

        {showRegistration && registrationLoading ? (
          <p className="resource-registration-status">Preparando el formulario de registro...</p>
        ) : null}

        {showRegistration && registrationLoadError ? (
          <p className="resource-registration-status error">{registrationLoadError}</p>
        ) : null}

        {showRegistration && registrationForm ? (
          <form className="resource-registration-form" onSubmit={submitResourceSection}>
            <h3>Registro para acceder a recursos del evento</h3>
            <p>Complete sus datos una sola vez. Con este registro podrá acceder a recursos privados del evento y registrar su asistencia cuando exista una sesión abierta.</p>
            <div className="progress-steps resource-progress-steps" aria-label="Avance del registro">
              {registrationProgressSteps.map((label, index) => (
                <div className={`progress-step ${index === currentRegistrationProgressIndex ? "current" : ""} ${index < currentRegistrationProgressIndex ? "done" : ""}`} key={`${index}-${label}`}>
                  <span>{index + 1}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
            {currentRegistrationSection ? (
              <fieldset className="public-section" key={currentRegistrationSection.id}>
                <legend>{cleanText(currentRegistrationSection.title)}</legend>
                {currentRegistrationSection.fields.map((field) => {
                  if (field.field_key === "datos_generales_tipo_docidentidad" || field.field_key === "datos_generales_numero_documento") return null;
                  if (isResourceOptionalForeignLocationField(field.field_key) || isResourceOptionalOrganizationLocationField(field.field_key)) return null;
                  if (isResourceActivityProductField(field) && fields.actividad_es_productor_agrario_pecuario_forestal !== "SI") return null;
                  if (isResourceOrganizationDetailField(field.field_key) && fields.organizacion_pertenece_a_organizacion !== "SI") return null;

                  if (field.field_key === "ubicacion_pais" && fields.ubicacion_pais && !isResourcePeru(fields.ubicacion_pais)) {
                    return (
                      <React.Fragment key={field.id}>
                        <p className="field-note">Para países distintos de Perú no se requiere departamento, provincia ni distrito.</p>
                        <label>
                          {publicFieldLabel(field)}
                          <SearchableSelect
                            options={registrationForm.catalogs?.[field.catalog_key ?? ""] ?? []}
                            value={fields[field.field_key] ?? ""}
                            onChange={(value) => {
                              const options = registrationForm.catalogs?.[field.catalog_key ?? ""] ?? [];
                              const selectedOption = options.find((option) => option.id === value);
                              updateResourceCountry(field.field_key, cleanText(selectedOption?.name ?? value), field);
                            }}
                            placeholder="Buscar país"
                            required={Boolean(field.is_required)}
                          />
                        </label>
                      </React.Fragment>
                    );
                  }

                  if (field.field_key === "ubicacion_departamento") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={departments}
                          value={selectedDepartmentId}
                          onChange={(value) => void selectResourceDepartment(value)}
                          placeholder="Buscar departamento"
                          required={isResourcePeru(fields.ubicacion_pais)}
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
                          onChange={(value) => void selectResourceProvince(value)}
                          placeholder="Buscar provincia"
                          required={isResourcePeru(fields.ubicacion_pais)}
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
                          onChange={selectResourceDistrict}
                          placeholder="Buscar distrito"
                          required={isResourcePeru(fields.ubicacion_pais)}
                          disabled={!selectedProvinceId}
                        />
                      </label>
                    );
                  }

                  if (field.field_key === "organizacion_pais" && fields.organizacion_pais && !isResourcePeru(fields.organizacion_pais)) {
                    return (
                      <React.Fragment key={field.id}>
                        <p className="field-note">Ubicación de la sede de su organización</p>
                        <p className="field-note">Para sedes fuera de Perú no se requiere departamento, provincia ni distrito.</p>
                        <label>
                          {publicFieldLabel(field)}
                          <SearchableSelect
                            options={registrationForm.catalogs?.[field.catalog_key ?? ""] ?? []}
                            value={fields[field.field_key] ?? ""}
                            onChange={(value) => {
                              const options = registrationForm.catalogs?.[field.catalog_key ?? ""] ?? [];
                              const selectedOption = options.find((option) => option.id === value);
                              updateResourceCountry(field.field_key, cleanText(selectedOption?.name ?? value), field);
                            }}
                            placeholder="Buscar país"
                            required={Boolean(field.is_required)}
                          />
                        </label>
                      </React.Fragment>
                    );
                  }

                  if (field.field_key === "organizacion_departamento") {
                    return (
                      <label key={field.id}>
                        {publicFieldLabel(field)}
                        <SearchableSelect
                          options={departments}
                          value={selectedOrganizationDepartmentId}
                          onChange={(value) => void selectResourceOrganizationDepartment(value)}
                          placeholder="Buscar departamento"
                          required={isResourcePeru(fields.organizacion_pais)}
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
                          onChange={(value) => void selectResourceOrganizationProvince(value)}
                          placeholder="Buscar provincia"
                          required={isResourcePeru(fields.organizacion_pais)}
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
                          onChange={selectResourceOrganizationDistrict}
                          placeholder="Buscar distrito"
                          required={isResourcePeru(fields.organizacion_pais)}
                          disabled={!selectedOrganizationProvinceId}
                        />
                      </label>
                    );
                  }

                  if (field.field_type === "select" || field.field_type === "radio") {
                    const options = field.field_type === "radio"
                      ? [{ id: "si", name: "SI" }, { id: "no", name: "NO" }]
                      : registrationForm.catalogs?.[field.catalog_key ?? ""] ?? [];
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
                              updateResourceCountry(field.field_key, cleanText(selectedOption?.name ?? value), field);
                            }}
                            placeholder="Buscar país"
                            required={Boolean(field.is_required)}
                          />
                        ) : (
                          <select
                            value={fields[field.field_key] ?? ""}
                            onChange={(event) => {
                              if (field.field_key === "organizacion_pertenece_a_organizacion") {
                                updateResourceOrganizationAnswer(event.target.value);
                                return;
                              }
                              updateField(field.field_key, event.target.value, field);
                            }}
                            required={Boolean(field.is_required) && field.field_key !== "organizacion_ruc"}
                          >
                            <option value="">Seleccione</option>
                            {options.map((option) => (
                              <option key={option.id} value={cleanText(option.name)}>{cleanText(option.name)}</option>
                            ))}
                          </select>
                        )}
                      </label>
                      {field.field_key === "actividad_actividad_del_productor" ? (
                        <label>
                          Es Productor Agrícola, Pecuario o Forestal
                          <select
                            value={fields.actividad_es_productor_agrario_pecuario_forestal ?? ""}
                            onChange={(event) => updateResourceProducerAnswer(event.target.value)}
                            required
                          >
                            <option value="">Seleccione</option>
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                          </select>
                        </label>
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
                        onChange={(event) => updateField(field.field_key, event.target.value, field)}
                        required={Boolean(field.is_required) && field.field_key !== "organizacion_ruc"}
                      />
                    </label>
                  );
                })}
              </fieldset>
            ) : null}
            <div className="form-navigation">
              <button className="button secondary" type="button" onClick={previousResourceSection}>
                Atrás
              </button>
              <button className="button private-register-button" type="submit" disabled={submitting}>
                {submitting ? "Registrando..." : resourceSectionIndex >= registrationSections.length - 1 ? "Registrarme y acceder" : "Siguiente"}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
