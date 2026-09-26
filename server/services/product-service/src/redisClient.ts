import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;
let isConnected = false;
let hasLoggedFailure = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

if (REDIS_ENABLED) {
  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false, // Fail fast if disconnected so HTTP requests don't hang
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 5) {
          if (!hasLoggedFailure) {
            console.warn('⚠️ [Product Service Redis] Maximum reconnection attempts reached. Continuing with SQLite fallback.');
            hasLoggedFailure = true;
          }
          return 5000; // Retry every 5s silently in background
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      console.log(`🔌 [Product Service Redis] Connecting to ${REDIS_URL}...`);
    });

    redisClient.on('ready', () => {
      isConnected = true;
      hasLoggedFailure = false;
      console.log(`⚡ [Product Service Redis] Connected & Ready for Catalog Caching!`);
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      if (!hasLoggedFailure) {
        console.warn(`⚠️ [Product Service Redis] Connection error (${err.message}). Falling back to SQLite database.`);
        hasLoggedFailure = true;
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });
  } catch (error: any) {
    console.warn(`⚠️ [Product Service Redis] Failed to initialize client: ${error.message}. Running in fallback mode.`);
    redisClient = null;
    isConnected = false;
  }
} else {
  console.log('ℹ️ [Product Service Redis] Disabled via REDIS_ENABLED=false. Using direct SQLite storage.');
}

export function isRedisAvailable(): boolean {
  return isConnected && redisClient !== null && redisClient.status === 'ready';
}

export async function getJson<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable() || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    return null;
  }
}

export async function setJson(key: string, value: any, ttlSeconds: number = 600): Promise<boolean> {
  if (!isRedisAvailable() || !redisClient) return false;
  try {
    const stringified = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redisClient.set(key, stringified, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, stringified);
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function del(key: string): Promise<boolean> {
  if (!isRedisAvailable() || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Safely delete keys matching a pattern using SCAN to avoid blocking Redis event loop
 */
export async function delPattern(pattern: string): Promise<number> {
  if (!isRedisAvailable() || !redisClient) return 0;
  try {
    let cursor = '0';
    let totalDeleted = 0;
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== '0');
    return totalDeleted;
  } catch (err) {
    return 0;
  }
}

export { redisClient };
