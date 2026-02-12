import { Router } from "express";
import { EvaluationController } from "../controllers/evaluationController";
import { authenticateApiKey } from "../middleware/authenticateApiKey";
import {
  evaluationLimiter,
  batchEvaluationLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// All routes require API key
router.use(authenticateApiKey);

// Single flag evaluation
router.post("/", evaluationLimiter, EvaluationController.evaluateSingle);

// Batch evaluation
router.post(
  "/batch",
  batchEvaluationLimiter,
  EvaluationController.evaluateBatch,
);

export default router;
