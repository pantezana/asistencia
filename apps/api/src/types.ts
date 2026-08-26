export type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ENV: string;
  CORS_ORIGIN: string;
};

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  status: string;
  roles: string[];
};

export type DbUserWithPassword = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  password_hash: string;
  status: string;
  roles: string | null;
};

export type AppContext = {
  Bindings: Env;
  Variables: {
    user: SessionUser;
  };
};

export type EventSummary = {
  id: string;
  title: string;
  source_title: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  short_link_slug: string | null;
};

export type OpenSession = {
  id: string;
  event_id: string;
  module_id: string;
  module_title: string;
  sequence: number;
  title: string;
  theme: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  attendance_status: string;
};

export type AdminEvent = EventSummary & {
  module_count: number;
  session_count: number;
  open_session_count: number;
  associated_form_id: string | null;
  associated_form_name: string | null;
  associated_template_id: string | null;
  associated_template_name: string | null;
};

export type AdminForm = {
  id: string;
  event_id: string;
  event_title: string;
  name: string;
  status: string;
  short_link_slug: string;
  welcome_title_template: string;
  cloned_from_form_id: string | null;
  form_template_id: string | null;
  template_name: string | null;
  is_event_publication: number;
  associated_event_id: string | null;
  associated_event_title: string | null;
  section_count: number;
  field_count: number;
};

export type FormTemplate = {
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

export type FormSection = {
  id: string;
  section_key: string;
  title: string;
  order_index: number;
};

export type FormField = {
  id: string;
  section_id: string;
  field_key: string;
  label: string;
  field_type: string;
  catalog_key: string | null;
  is_required: number;
  order_index: number;
  config: string;
};

export type FormSectionDefinition = {
  id: string;
  section_key: string;
  title: string;
  description: string | null;
  status: string;
};

export type FormControlDefinition = {
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

export type Catalog = {
  id: string;
  catalog_key: string;
  name: string;
  description: string | null;
  status: string;
  control_label: string;
  item_count: number;
  active_item_count: number;
};

export type CatalogItem = {
  id: string;
  catalog_id: string;
  parent_item_id: string | null;
  source_id: string | null;
  name: string;
  description: string | null;
  status: string;
};

export type EventQuestion = {
  id: string;
  event_id: string;
  session_id: string | null;
  question_text: string;
  description: string | null;
  interaction_type: string;
  status: string;
  allow_multiple_responses: number;
  allow_response_update: number;
  max_responses_per_participant: number | null;
  max_answer_length: number;
  max_selectable_concepts: number;
  show_participant_cloud: number;
  participant_slug: string;
  presenter_slug: string;
  created_by_user_id: string;
  response_count: number;
  unique_participant_count: number;
  created_at: string;
  updated_at: string;
};

export type EventQuestionSummaryItem = {
  answer: string;
  normalized_answer: string;
  count: number;
};

export type EventQuestionResponseItem = {
  id: string;
  answer_text: string;
  created_at: string;
};

export type EventQuestionSelectionItem = {
  id: string;
  normalized_answer: string;
  display_answer: string;
  selection_order: number;
  created_at: string;
};

export type EventQuestionSelectionGroup = {
  participant_id: string;
  participant_name: string;
  selections: string;
  selection_count: number;
};

export type EventBoard = {
  id: string;
  event_id: string;
  session_id: string | null;
  title: string;
  status: string;
  participant_slug: string;
  presenter_slug: string;
  max_note_length: number;
  allow_multiple_notes: number;
  max_notes_per_participant: number | null;
  created_by_user_id: string;
  note_count: number;
  created_at: string;
  updated_at: string;
  event_title?: string;
  event_slug?: string;
};

export type EventBoardInstruction = {
  id: string;
  board_id: string;
  language_label: string | null;
  content_html: string;
  content_text: string;
  sort_order: number;
  status: string;
};

export type EventBoardNote = {
  id: string;
  board_id: string;
  event_id: string;
  session_id: string | null;
  first_name: string;
  last_name: string;
  country_id: string | null;
  country_name: string;
  country_iso2: string | null;
  note_html: string;
  note_text: string;
  note_excerpt: string;
  status: string;
  created_at: string;
};

export type Participant = {
  id: string;
  document_type: string;
  document_number: string;
  first_name: string;
  paternal_last_name: string | null;
  maternal_last_name: string | null;
  email: string | null;
  phone: string | null;
};

export type LocationOption = {
  id: string;
  name: string;
};
