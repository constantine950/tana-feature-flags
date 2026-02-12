import rateLimit from "express-rate-limit";

// Evaluation endpoint rate limiter
export const evaluationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute per IP
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Batch evaluation has stricter limit
export const batchEvaluationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 batch requests per minute
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many batch requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
