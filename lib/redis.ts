import { createClient, type RedisClientType } from 'redis';

type GlobalRedis = {
  client?: RedisClientType;
  clientPromise?: Promise<RedisClientType>;
};

const globalRedis = globalThis as typeof globalThis & GlobalRedis;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set');
  }

  if (globalRedis.client?.isOpen) {
    return globalRedis.client;
  }

  if (!globalRedis.clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    globalRedis.clientPromise = client.connect().then(() => {
      globalRedis.client = client;
      return client;
    });
  }

  return globalRedis.clientPromise;
}
