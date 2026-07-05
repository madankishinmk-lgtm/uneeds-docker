import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    envExists: !!process.env.ADMIN_PASSWORD,
    envLength: process.env.ADMIN_PASSWORD?.length ?? 0,
    input: body.password ?? null,
    match: body.password === process.env.ADMIN_PASSWORD,
  });
}
export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({
    ok: true,
  });
}