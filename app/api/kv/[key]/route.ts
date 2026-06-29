import { NextResponse } from 'next/server';
import { getSqlClient } from '@/lib/neon';

type Envelope = {
  value: string;
  updatedAt: number;
};

type KvRow = {
  value: string;
  updated_at: number;
};

function decodeKey(key: string) {
  return decodeURIComponent(key);
}

async function ensureKvTable() {
  const sql = getSqlClient();
  await sql`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `;
  return sql;
}

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const { key } = params;
  const sql = await ensureKvTable();
  const rows = (await sql`SELECT value, updated_at FROM kv_store WHERE key = ${decodeKey(key)} LIMIT 1`) as KvRow[];
  const row = rows[0] ?? null;

  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    value: row.value,
    updatedAt: Number(row.updated_at),
  });
}

export async function PUT(request: Request, { params }: { params: { key: string } }) {
  const { key } = params;
  const body = (await request.json().catch(() => null)) as Envelope | null;

  if (typeof body?.value !== 'string' || typeof body?.updatedAt !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const sql = await ensureKvTable();
  await sql`
    INSERT INTO kv_store (key, value, updated_at)
    VALUES (${decodeKey(key)}, ${body.value}, ${body.updatedAt})
    ON CONFLICT (key)
    DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = EXCLUDED.updated_at
    WHERE EXCLUDED.updated_at >= kv_store.updated_at
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { key: string } }) {
  const { key } = params;
  const sql = await ensureKvTable();
  await sql`DELETE FROM kv_store WHERE key = ${decodeKey(key)}`;
  return NextResponse.json({ ok: true });
}
