import { Request, Response } from "express";
import { AuditService } from "../services/auditService";
import redis from "../config/redis";

export class AnalyticsController {
  // GET /api/v1/projects/:projectId/analytics/activity
  static async getActivity(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await AuditService.getProjectLogs(projectId, limit);

      return res.json({ logs });
    } catch (error) {
      console.error("Get activity error:", error);
      return res.status(500).json({
        error: { code: "FETCH_FAILED", message: "Failed to fetch activity" },
      });
    }
  }

  // GET /api/v1/flags/:flagId/analytics/activity
  static async getFlagActivity(req: Request, res: Response) {
    try {
      const { flagId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await AuditService.getFlagLogs(flagId, limit);

      return res.json({ logs });
    } catch (error) {
      console.error("Get flag activity error:", error);
      return res.status(500).json({
        error: { code: "FETCH_FAILED", message: "Failed to fetch activity" },
      });
    }
  }

  // GET /api/v1/flags/:flagId/analytics/stats
  static async getFlagStats(req: Request, res: Response) {
    try {
      const { flagId } = req.params;

      // Get evaluation counts from Redis
      const totalKey = `stats:flag:${flagId}:total`;
      const enabledKey = `stats:flag:${flagId}:enabled`;
      const disabledKey = `stats:flag:${flagId}:disabled`;

      const [total, enabled, disabled] = await Promise.all([
        redis.get(totalKey),
        redis.get(enabledKey),
        redis.get(disabledKey),
      ]);

      return res.json({
        stats: {
          totalEvaluations: parseInt(total || "0"),
          enabledCount: parseInt(enabled || "0"),
          disabledCount: parseInt(disabled || "0"),
        },
      });
    } catch (error) {
      console.error("Get flag stats error:", error);
      return res.status(500).json({
        error: { code: "FETCH_FAILED", message: "Failed to fetch stats" },
      });
    }
  }
}
