import { NextResponse } from 'next/server';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function jsonError(error: unknown, fallbackMessage = 'Request failed') {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
  }

  if (error instanceof Error) {
    console.error(error.message);
    return NextResponse.json({ error: fallbackMessage }, { status: 500 });
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
