import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import type { AppContext, Env, SessionUser } from "./types";

const SESSION_COOKIE = "asistencia_session";
const SESSION_DAYS = 7;

type AuthContext = Context<AppContext>;

function bytesToBase64(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(digest);
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, saltText, hashText] = storedHash.split("$");

  if (algorithm !== "pbkdf2_sha256" || !iterationsText || !saltText || !hashText) {
    return false;
  }

  const iterations = Number(iterationsText);
  const salt = base64ToBytes(saltText);
  const expectedHash = base64ToBytes(hashText);
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations
    },
    passwordKey,
    expectedHash.length * 8
  );

  const actualHash = new Uint8Array(derivedBits);
  let diff = actualHash.length ^ expectedHash.length;

  for (let index = 0; index < actualHash.length && index < expectedHash.length; index += 1) {
    diff |= actualHash[index] ^ expectedHash[index];
  }

  return diff === 0;
}

export async function createSession(c: Context<AppContext>, userId: string) {
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = bytesToHex(tokenBytes);
  const tokenHash = await sha256(token);
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await c.env.DB.prepare(
    `INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      sessionId,
      userId,
      tokenHash,
      expiresAt.toISOString(),
      c.req.header("User-Agent") ?? null,
      c.req.header("CF-Connecting-IP") ?? null
    )
    .run();

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

export async function revokeCurrentSession(c: Context<AppContext>) {
  const token = getCookie(c, SESSION_COOKIE);

  if (token) {
    const tokenHash = await sha256(token);
    await c.env.DB.prepare(
      `UPDATE auth_sessions
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE token_hash = ? AND revoked_at IS NULL`
    )
      .bind(tokenHash)
      .run();
  }

  deleteCookie(c, SESSION_COOKIE, {
    path: "/"
  });
}

export async function getSessionUser(c: Context<AppContext>) {
  const token = getCookie(c, SESSION_COOKIE);

  if (!token) {
    return null;
  }

  const tokenHash = await sha256(token);
  const user = await c.env.DB.prepare(
    `SELECT
      u.id,
      u.username,
      u.email,
      u.full_name,
      u.status,
      GROUP_CONCAT(r.role_key) AS roles
     FROM auth_sessions s
     INNER JOIN users u ON u.id = s.user_id
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id AND r.status = 'active'
     WHERE s.token_hash = ?
       AND s.revoked_at IS NULL
       AND s.expires_at > CURRENT_TIMESTAMP
       AND u.status = 'active'
     GROUP BY u.id`
  )
    .bind(tokenHash)
    .first<SessionUser & { roles: string | null }>();

  if (!user) {
    return null;
  }

  await c.env.DB.prepare(
    `UPDATE auth_sessions
     SET last_seen_at = CURRENT_TIMESTAMP
     WHERE token_hash = ?`
  )
    .bind(tokenHash)
    .run();

  return {
    ...user,
    roles: typeof user.roles === "string" && user.roles.length > 0 ? user.roles.split(",") : []
  };
}

export function requireAuth() {
  return async (c: AuthContext, next: Next) => {
    const user = await getSessionUser(c);

    if (!user) {
      return c.json({ ok: false, message: "No autenticado." }, 401);
    }

    c.set("user", user);
    await next();
  };
}

export function requireRole(allowedRoles: string[]) {
  return async (c: AuthContext, next: Next) => {
    const user = c.get("user");
    const hasRole = user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return c.json({ ok: false, message: "No autorizado." }, 403);
    }

    await next();
  };
}
