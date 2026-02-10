import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { generateToken } from "../utils/jwt";
import { validatePassword } from "../utils/password";
import { RegisterRequest, LoginRequest } from "../types";

export class AuthController {
  // POST /auth/register
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name }: RegisterRequest = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: "MISSING_FIELDS",
            message: "Email and password are required",
          },
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: {
            code: "INVALID_EMAIL",
            message: "Invalid email format",
          },
        });
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: {
            code: "INVALID_PASSWORD",
            message: passwordValidation.error,
          },
        });
      }

      // Create user
      const user = await UserService.createUser({ email, password, name });

      // Generate token
      const token = generateToken(user.id, user.email);

      // Return response
      return res.status(201).json({
        user: UserService.toResponse(user),
        token,
        expiresIn: "7d",
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({
          error: {
            code: "USER_EXISTS",
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        error: {
          code: "REGISTRATION_FAILED",
          message: "Failed to register user",
        },
      });
    }
  }

  // POST /auth/login
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: "MISSING_FIELDS",
            message: "Email and password are required",
          },
        });
      }

      // Verify credentials
      const user = await UserService.verifyCredentials(email, password);

      if (!user) {
        return res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }

      // Update last login
      await UserService.updateLastLogin(user.id);

      // Generate token
      const token = generateToken(user.id, user.email);

      // Return response
      return res.status(200).json({
        user: UserService.toResponse(user),
        token,
        expiresIn: "7d",
      });
    } catch (error) {
      console.error("Login error:", error);

      return res.status(500).json({
        error: {
          code: "LOGIN_FAILED",
          message: "Failed to login",
        },
      });
    }
  }

  // GET /auth/me (protected route)
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          },
        });
      }

      const user = await UserService.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      return res.status(200).json({
        user: UserService.toResponse(user),
      });
    } catch (error) {
      console.error("Get profile error:", error);

      return res.status(500).json({
        error: {
          code: "PROFILE_FETCH_FAILED",
          message: "Failed to fetch profile",
        },
      });
    }
  }
}
