import { Request, Response, NextFunction } from "express";
import { EnvironmentService } from "../services/environmentService";
import { Environment } from "../types";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      environment?: Environment;
    }
  }
}

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get API key from header
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(401).json({
        error: {
          code: "NO_API_KEY",
          message: "API key required in X-API-Key header",
        },
      });
      return;
    }

    // Verify API key
    const environment = await EnvironmentService.verifyApiKey(apiKey);

    if (!environment) {
      res.status(401).json({
        error: {
          code: "INVALID_API_KEY",
          message: "Invalid API key",
        },
      });
      return;
    }

    // Attach environment to request
    req.environment = environment;

    next();
  } catch (error) {
    console.error("API key authentication error:", error);
    res.status(500).json({
      error: {
        code: "AUTH_ERROR",
        message: "Authentication failed",
      },
    });
  }
};
