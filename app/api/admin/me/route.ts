import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';

export async function GET() {
  const authorized = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
