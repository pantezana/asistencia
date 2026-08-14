-- Migration: autenticacion, roles y usuario administrador inicial
-- Target: Cloudflare D1 / SQLite

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  role_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT,
  revoked_at TEXT,
  user_agent TEXT,
  ip_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id, expires_at);

INSERT INTO roles (id, role_key, name, description, status) VALUES
  ('role_admin', 'administrador', 'Administrador', 'Acceso general al sistema y gestion de usuarios.', 'active'),
  ('role_supervisor', 'supervisor', 'Supervisor', 'Gestiona unicamente sus propios eventos.', 'active')
ON CONFLICT(role_key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO users (id, username, email, full_name, password_hash, status) VALUES (
  'user_admin_seed',
  'admin',
  'admin@asistencia.local',
  'Administrador General',
  'pbkdf2_sha256$100000$AB2ywdpT720nExbZUh/TRA==$1AYASQx9vcGh2ifSxpZLDybuEDXXoXz6fiOVvmE4/Z4=',
  'active'
)
ON CONFLICT(username) DO UPDATE SET
  email = excluded.email,
  full_name = excluded.full_name,
  password_hash = excluded.password_hash,
  status = excluded.status,
  updated_at = CURRENT_TIMESTAMP;

INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('user_admin_seed', 'role_admin');
