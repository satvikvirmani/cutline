import { NextResponse } from 'next/server';

import { getSqlClient } from '@/lib/neon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async () => {
  try {
    const sql = getSqlClient();
    await sql`CREATE TABLE IF NOT EXISTS comments (comment TEXT)`;
    const rows = (await sql`SELECT comment FROM comments ORDER BY ctid DESC LIMIT 1`) as Array<{
      comment: string;
    }>;
    const result = rows[0]?.comment ?? null;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Failed to read from Postgres:', error);
    return NextResponse.json({ error: 'Failed to read from Postgres' }, { status: 500 });
  }
};
