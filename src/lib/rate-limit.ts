import { NextRequest } from 'next/server';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}
