import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  apiUrl: string;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtExpiry: string;
  apiKeySecret: string;
}

// Validate required vars
const required = ["DATABASE_URL", "REDIS_URL", "JWT_SECRET", "API_KEY_SECRET"];
for (const envVar of required) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Missing environment variable: ${envVar}`);
  }
}

export const config: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),
  apiUrl: process.env.API_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiry: process.env.JWT_EXPIRY || "7d",
  apiKeySecret: process.env.API_KEY_SECRET!,
};

export default config;
