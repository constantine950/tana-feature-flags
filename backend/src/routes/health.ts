import { Router, Request, Response } from "express";
import { query } from "../config/database";
import redis from "../config/redis";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    // Check database
    const dbStart = Date.now();
    await query("SELECT 1");
    const dbLatency = Date.now() - dbStart;

    // Check Redis
    const redisStart = Date.now();
    await redis.ping();
    const redisLatency = Date.now() - redisStart;

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "connected",
        latency: `${dbLatency}ms`,
      },
      redis: {
        status: "connected",
        latency: `${redisLatency}ms`,
      },
      environment: process.env.NODE_ENV,
      version: "1.0.0",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
