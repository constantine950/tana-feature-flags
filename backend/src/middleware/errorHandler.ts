import { Request, Response } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (err: ApiError, req: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "SERVER_ERROR";

  console.error("❌ Error:", {
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export const createError = (
  message: string,
  statusCode = 500,
  code?: string,
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};
