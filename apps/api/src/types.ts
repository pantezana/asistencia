export type Env = {
  DB: D1Database;
  APP_ENV: string;
  CORS_ORIGIN: string;
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
