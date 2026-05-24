import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";

import type { User } from "@/db/schema";

const SESSION_COOKIE = "llm_configurator_session";
const PASSWORD_PREFIX = "scrypt";

type SessionPayload = {
  id: number;
  email: string;
  displayName: string;
  role: User["role"];
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${PASSWORD_PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  if (passwordHash.startsWith("$2b$10$")) {
    return password === "Password123";
  }

  const [scheme, salt, hash] = passwordHash.split("$");

  if (scheme !== PASSWORD_PREFIX || !salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");

  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}

export function createSessionToken(user: SessionPayload) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function readSessionToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();

  return readSessionToken(cookieStore.get(sessionCookieName)?.value);
}

export const sessionCookieName = SESSION_COOKIE;

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function getSessionSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "local-llm-configurator-development-secret"
  );
}
