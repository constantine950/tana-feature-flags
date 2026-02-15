import { Request, Response } from "express";
import { EvaluationService } from "../services/evaluationService";

export class EvaluationController {
  // POST /api/v1/evaluate
  static async evaluateSingle(req: Request, res: Response) {
    try {
      if (!req.environment) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { flagKey, userId } = req.body;

      if (!flagKey || !userId) {
        return res.status(400).json({
          error: {
            code: "MISSING_FIELDS",
            message: "flagKey and userId are required",
          },
        });
      }

      const result = await EvaluationService.evaluateWithCache(
        req.environment.project_id,
        req.environment.id,
        flagKey,
        userId,
      );

      return res.json({
        flagKey,
        userId,
        enabled: result.enabled,
        reason: result.reason,
        metadata: result.metadata,
      });
    } catch (error) {
      console.error("Evaluation error:", error);
      return res.status(500).json({
        error: {
          code: "EVALUATION_FAILED",
          message: "Failed to evaluate flag",
        },
      });
    }
  }

  // POST /api/v1/evaluate/batch
  static async evaluateBatch(req: Request, res: Response) {
    try {
      if (!req.environment) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { flagKeys, userId } = req.body;

      if (!flagKeys || !Array.isArray(flagKeys) || !userId) {
        return res.status(400).json({
          error: {
            code: "INVALID_INPUT",
            message: "flagKeys (array) and userId are required",
          },
        });
      }

      if (flagKeys.length > 50) {
        return res.status(400).json({
          error: {
            code: "TOO_MANY_FLAGS",
            message: "Maximum 50 flags per batch request",
          },
        });
      }

      const results = await EvaluationService.evaluateBatch(
        req.environment.project_id,
        req.environment.id,
        flagKeys,
        userId,
      );

      return res.json({
        userId,
        flags: results,
      });
    } catch (error) {
      console.error("Batch evaluation error:", error);
      return res.status(500).json({
        error: {
          code: "EVALUATION_FAILED",
          message: "Failed to evaluate flags",
        },
      });
    }
  }
}
