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
      enableOfflineQueue: false, // Fail fast so OTP requests fall back to SQLite instantly if Redis is down
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 5) {
          if (!hasLoggedFailure) {
            console.warn('⚠️ [Auth Service Redis] Maximum reconnection attempts reached. Continuing with SQLite fallback.');
            hasLoggedFailure = true;
          }
          return 5000;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      console.log(`🔌 [Auth Service Redis] Connecting to ${REDIS_URL}...`);
    });

    redisClient.on('ready', () => {
      isConnected = true;
      hasLoggedFailure = false;
      console.log(`⚡ [Auth Service Redis] Connected & Ready for Ephemeral OTPs!`);
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      if (!hasLoggedFailure) {
        console.warn(`⚠️ [Auth Service Redis] Connection error (${err.message}). Falling back to SQLite database.`);
        hasLoggedFailure = true;
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });
  } catch (error: any) {
    console.warn(`⚠️ [Auth Service Redis] Failed to initialize client: ${error.message}. Running in fallback mode.`);
    redisClient = null;
    isConnected = false;
  }
} else {
  console.log('ℹ️ [Auth Service Redis] Disabled via REDIS_ENABLED=false. Using SQLite OtpVerification table.');
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

export async function setJson(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
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

export async function set(key: string, value: string, ttlSeconds: number = 60): Promise<boolean> {
  if (!isRedisAvailable() || !redisClient) return false;
  try {
    if (ttlSeconds > 0) {
      await redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function get(key: string): Promise<string | null> {
  if (!isRedisAvailable() || !redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    return null;
  }
}

export async function exists(key: string): Promise<boolean> {
  if (!isRedisAvailable() || !redisClient) return false;
  try {
    const count = await redisClient.exists(key);
    return count > 0;
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

export async function incr(key: string, ttlSeconds: number = 300): Promise<number | null> {
  if (!isRedisAvailable() || !redisClient) return null;
  try {
    const count = await redisClient.incr(key);
    if (count === 1 && ttlSeconds > 0) {
      await redisClient.expire(key, ttlSeconds);
    }
    return count;
  } catch (err) {
    return null;
  }
}

export async function getTtl(key: string): Promise<number> {
  if (!isRedisAvailable() || !redisClient) return -2;
  try {
    return await redisClient.ttl(key);
  } catch (err) {
    return -2;
  }
}

export { redisClient };
