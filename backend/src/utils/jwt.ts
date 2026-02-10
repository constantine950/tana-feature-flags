import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { JWTPayload } from "../types";

export const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiry,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
