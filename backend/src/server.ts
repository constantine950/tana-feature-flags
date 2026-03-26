import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { testConnection } from "./config/database";
import { testRedisConnection } from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import environmentRoutes from "./routes/environments";
import flagRoutes from "./routes/flags";
import evaluateRoutes from "./routes/evaluate";
import analyticsRoutes from "./routes/analytics";

const app: Application = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://tana-feature-flags-dashboard.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/environments", environmentRoutes);
app.use("/api/v1/flags", flagRoutes);
app.use("/api/v1/evaluate", evaluateRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

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
    console.log("Starting Tana API Server...\n");

    console.log("Testing database connection...");
    const dbOk = await testConnection();
    if (!dbOk) throw new Error("Database connection failed");

    console.log("Testing Redis connection...");
    const redisOk = await testRedisConnection();
    if (!redisOk) throw new Error("Redis connection failed");

    app.listen(config.port, () => {
      console.log("\nServer started successfully!");
      console.log(`API: ${config.apiUrl}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`\nTry: curl ${config.apiUrl}/health\n`);
    });
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  process.exit(0);
});

startServer();

export default app;
