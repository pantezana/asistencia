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
