import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "uneeds-admin-session";
const COOKIE_TTL_MS = 1000 * 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-secret";
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export async function requireAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !getPassword()) {
    return null;
  }

  const [user, sig] = token.split(".");
  if (!user || !sig) return null;

  const expected = createHmac("sha256", getSecret())
    .update(user)
    .digest("hex");

  const provided = Buffer.from(sig, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(user, "base64url").toString("utf8")
  );

  if (!payload?.admin || payload.exp < Date.now()) {
    return null;
  }

  return true;
}

export async function createAdminSession() {
  if (!getPassword()) return null;

  const payload = {
    admin: true,
    exp: Date.now() + COOKIE_TTL_MS,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = createHmac("sha256", getSecret())
    .update(encoded)
    .digest("hex");

  return `${encoded}.${signature}`;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function getAdminPassword() {
  return getPassword();
}