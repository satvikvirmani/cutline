import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

type Envelope = {
  value: string;
  updatedAt: number;
};

function decodeKey(key: string) {
  return decodeURIComponent(key);
}

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const { key } = params;
  const value = (await kv.get<Envelope>(decodeKey(key))) ?? null;

  if (!value) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(value);
}

export async function PUT(request: Request, { params }: { params: { key: string } }) {
  const { key } = params;
  const body = (await request.json().catch(() => null)) as Envelope | null;

  if (typeof body?.value !== 'string' || typeof body?.updatedAt !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await kv.set(decodeKey(key), body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { key: string } }) {
  const { key } = params;
  await kv.del(decodeKey(key));
  return NextResponse.json({ ok: true });
}
