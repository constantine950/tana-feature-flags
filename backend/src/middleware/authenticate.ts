import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserService } from "../services/userService";
import { JWTPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: {
          code: "NO_TOKEN",
          message: "No authorization token provided",
        },
      });
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN_FORMAT",
          message: "Authorization header must be: Bearer <token>",
        },
      });
      return;
    }

    const token = parts[1];

    let payload: JWTPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
      });
      return;
    }

    const user = await UserService.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User no longer exists",
        },
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: {
        code: "AUTH_ERROR",
        message: "Authentication failed",
      },
    });
  }
};
