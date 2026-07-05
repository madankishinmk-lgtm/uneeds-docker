import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  clearAdminSession,
  createAdminSession,
  getAdminPassword,
  setAdminSessionCookie,
} from '@/lib/auth';
import { HttpError, jsonError } from '@/lib/errors';

const loginSchema = z.object({
  password: z.string().trim().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid password payload');
    }

    const adminPassword = getAdminPassword();

    if (!adminPassword || parsed.data.password !== adminPassword) {
      throw new HttpError(401, 'Invalid password');
    }

    const token = await createAdminSession();

    if (!token) {
      throw new HttpError(500, 'Authentication unavailable');
    }

    await setAdminSessionCookie(token);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    await clearAdminSession();
    return jsonError(error, 'Login failed');
  }
}

export async function DELETE() {
  await clearAdminSession();

  return NextResponse.json({
    ok: true,
  });
}