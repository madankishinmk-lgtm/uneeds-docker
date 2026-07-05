import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'uneeds-admin-session';
const COOKIE_TTL_MS = 1000 * 60 * 60 * 8;

export async function requireAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  console.log('========================');
  console.log('COOKIE:', token);
  console.log('ADMIN_PASSWORD EXISTS:', !!process.env.ADMIN_PASSWORD);
  console.log('SECRET EXISTS:', !!process.env.ADMIN_SESSION_SECRET);
  console.log('========================');

  if (!token) return false;

  const [user, sig] = token.split('.');
  if (!user || !sig) return false;

  const expected = createHmac(
    'sha256',
    process.env.ADMIN_SESSION_SECRET || 'dev-secret'
  )
    .update(user)
    .digest('hex');

  const provided = Buffer.from(sig, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    console.log('Signature mismatch');
    return false;
  }

  const payload = JSON.parse(
    Buffer.from(user, 'base64url').toString('utf8')
  );

  console.log(payload);

  if (!payload.admin) return false;
  if (payload.exp < Date.now()) return false;

  return true;
}

export async function createAdminSession() {
  const payload = {
    admin: true,
    exp: Date.now() + COOKIE_TTL_MS,
  };

  const encoded = Buffer.from(
    JSON.stringify(payload)
  ).toString('base64url');

  const signature = createHmac(
    'sha256',
    process.env.ADMIN_SESSION_SECRET || 'dev-secret'
  )
    .update(encoded)
    .digest('hex');

  return `${encoded}.${signature}`;
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 8,
});
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}