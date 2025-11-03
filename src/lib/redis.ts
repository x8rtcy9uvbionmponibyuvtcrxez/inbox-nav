import { createClient, RedisClientType } from 'redis';

let redis: RedisClientType | null = null;

export function getRedisClient(): RedisClientType | null {
  if (!redis && process.env.REDIS_URL) {
    try {
      redis = createClient({
        url: process.env.REDIS_URL,
      });
      
      redis.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });
      
      redis.on('connect', () => {
        console.log('Redis Client Connected');
      });
      
      // Connect asynchronously
      redis.connect().catch(console.error);
    } catch (error) {
      console.error('Failed to create Redis client:', error);
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
    // Ensure Redis is connected before attempting operations
    if (!client.isOpen) {
      await client.connect();
    }
    
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
    console.error('Redis cache error:', error);
    // Fallback to direct fetch
    return await fetcher();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient();

  if (!client) {
    console.warn(`[Cache] Redis not available, skipping invalidation for: ${pattern}`);
    return;
  }

  try {
    // Ensure Redis is connected before attempting operations
    if (!client.isOpen) {
      console.log('[Cache] Redis not connected yet, attempting to connect...');
      await client.connect();
    }

    // Always attempt exact-key delete first (fast path)
    const deleted = await client.del(pattern);
    console.log(`[Cache] Deleted ${deleted} key(s) matching exact pattern: ${pattern}`);

    // If a wildcard pattern is provided, scan and delete matches
    const hasWildcard = pattern.includes('*') || pattern.includes('?') || pattern.includes('[');
    if (hasWildcard) {
      const keysToDelete: string[] = [];
      try {
        const iterator = client.scanIterator({ MATCH: pattern, COUNT: 100 }) as AsyncIterableIterator<string>;
        // Use SCAN to avoid blocking Redis on KEYS
        for await (const key of iterator) {
          keysToDelete.push(key);
        }
        if (keysToDelete.length > 0) {
          const deletedWildcard = await client.del(keysToDelete);
          console.log(`[Cache] Deleted ${deletedWildcard} key(s) matching wildcard pattern: ${pattern}`);
        }
      } catch (scanError) {
        console.error('[Cache] Error during wildcard scan:', scanError);
      }
    }
  } catch (error) {
    console.error('[Cache] Cache invalidation error:', error);
    // Don't throw - we don't want cache errors to fail the request
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
    console.error('Cache set error:', error);
  }
}
