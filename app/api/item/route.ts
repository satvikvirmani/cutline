import { NextResponse } from 'next/server';

import { getRedisClient } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async () => {
  try {
    const redis = await getRedisClient();
    const result = await redis.get('item');

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Failed to read item from Redis:', error);
    return NextResponse.json({ error: 'Failed to read from Redis' }, { status: 500 });
  }
};
