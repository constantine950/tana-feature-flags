import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { testConnection } from "./config/database";
import { testRedisConnection } from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health";

const app: Application = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/health", healthRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log("🚀 Starting Tana API Server...\n");

    console.log("📊 Testing database connection...");
    const dbOk = await testConnection();
    if (!dbOk) throw new Error("Database connection failed");

    console.log("🔴 Testing Redis connection...");
    const redisOk = await testRedisConnection();
    if (!redisOk) throw new Error("Redis connection failed");

    app.listen(config.port, () => {
      console.log("\n✅ Server started successfully!");
      console.log(`📍 API: ${config.apiUrl}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`\n💡 Try: curl ${config.apiUrl}/health\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
};

startServer();

export default app;
