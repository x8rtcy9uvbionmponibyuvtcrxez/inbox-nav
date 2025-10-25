import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redis: RedisClientType | null = null;
let isConnecting = false;
let isConnected = false;

export function getRedisClient(): RedisClientType | null {
  if (!redis && process.env.REDIS_URL && !isConnecting) {
    isConnecting = true;
    try {
      redis = createClient({
        url: process.env.REDIS_URL,
      });

      redis.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        isConnected = false;
      });

      redis.on('connect', () => {
        logger.info('Redis Client Connected');
        isConnected = true;
        isConnecting = false;
      });

      // Connect asynchronously
      redis.connect().catch((err) => {
        logger.error('Failed to connect to Redis:', err);
        isConnecting = false;
      });
    } catch (error) {
      logger.error('Failed to create Redis client:', error);
      isConnecting = false;
      return null;
    }
  }

  return redis;
}

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const client = getRedisClient();
  
  if (!client) {
    // Fallback to direct fetch if Redis is not available
    return await fetcher();
  }
  
  try {
    // Try to get from cache
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch fresh data
    const data = await fetcher();
    
    // Cache the data
    await client.setEx(key, ttlSeconds, JSON.stringify(data));
    
    return data;
  } catch (error) {
    logger.error('Redis cache error:', error);
    // Fallback to direct fetch
    return await fetcher();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient();

  if (!client) return;

  try {
    // Use SCAN instead of KEYS to avoid blocking Redis
    let cursor = 0;
    const keysToDelete: string[] = [];

    do {
      const reply = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = reply.cursor;

      if (reply.keys.length > 0) {
        keysToDelete.push(...reply.keys);
      }
    } while (cursor !== 0);

    if (keysToDelete.length > 0) {
      await client.del(keysToDelete);
      logger.debug(`Invalidated ${keysToDelete.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

export async function setCacheData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300
): Promise<void> {
  const client = getRedisClient();
  
  if (!client) return;
  
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}
