import rateLimit from "express-rate-limit";

// Evaluation endpoint rate limiter
export const evaluationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
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
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many batch requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
