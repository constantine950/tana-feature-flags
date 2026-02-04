import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

// Test connection
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    console.log("✅ Redis test successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Redis test failed:", error);
    return false;
  }
};

// Cache helpers
export const setCache = async (
  key: string,
  value: string,
  ttl: number = 60,
) => {
  await redis.setex(key, ttl, value);
};

export const getCache = async (key: string): Promise<string | null> => {
  return redis.get(key);
};

export const deleteCache = async (key: string) => {
  await redis.del(key);
};

export default redis;
