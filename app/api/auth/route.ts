import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { passcode } = (await request.json().catch(() => ({}))) as { passcode?: string };

  if (!process.env.APP_PASSCODE) {
    return NextResponse.json({ error: 'APP_PASSCODE is not set' }, { status: 500 });
  }

  if (passcode !== process.env.APP_PASSCODE) {
    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: 'session',
    value: 'ok',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });

  return response;
}

