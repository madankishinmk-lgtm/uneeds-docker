import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    input: body.password,
    env: process.env.ADMIN_PASSWORD,
    match: body.password === process.env.ADMIN_PASSWORD,
  });
}