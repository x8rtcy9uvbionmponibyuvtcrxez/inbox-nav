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
  
  if (!client) return;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
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
