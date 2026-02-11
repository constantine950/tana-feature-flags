import { Request, Response } from "express";
import { FlagService } from "../services/flagService";
import { RuleService } from "../services/ruleService";
import { ProjectService } from "../services/projectService";

export class FlagController {
  // GET /api/v1/projects/:projectId/flags
  static async listFlags(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { projectId } = req.params;
      const { environmentId } = req.query;

      // Check ownership
      const isOwner = await ProjectService.isOwner(projectId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      let flags;
      if (environmentId) {
        // Get flags with rules for specific environment
        flags = await FlagService.getFlagsWithRules(
          projectId,
          environmentId as string,
        );
      } else {
        // Get all flags
        flags = await FlagService.getFlagsByProject(projectId);
      }

      return res.json({ flags });
    } catch (error) {
      console.error("List flags error:", error);
      return res.status(500).json({
        error: { code: "LIST_FAILED", message: "Failed to list flags" },
      });
    }
  }

  // POST /api/v1/projects/:projectId/flags
  static async createFlag(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { projectId } = req.params;
      const { key, name, description } = req.body;

      if (!key || !name) {
        return res.status(400).json({
          error: { code: "MISSING_FIELDS", message: "Key and name required" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(projectId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      // Check if flag key already exists
      const existing = await FlagService.getFlagByKey(projectId, key);
      if (existing) {
        return res.status(409).json({
          error: { code: "DUPLICATE_KEY", message: "Flag key already exists" },
        });
      }

      const flag = await FlagService.createFlag(
        projectId,
        key,
        name,
        description || null,
        req.user.userId,
      );

      return res.status(201).json({ flag });
    } catch (error: any) {
      console.error("Create flag error:", error);

      if (error.message.includes("must be lowercase")) {
        return res.status(400).json({
          error: { code: "INVALID_KEY", message: error.message },
        });
      }

      return res.status(500).json({
        error: { code: "CREATE_FAILED", message: "Failed to create flag" },
      });
    }
  }

  // GET /api/v1/flags/:id
  static async getFlag(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;

      const flag = await FlagService.getFlagById(id);

      if (!flag) {
        return res.status(404).json({
          error: { code: "FLAG_NOT_FOUND", message: "Flag not found" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(
        flag.project_id,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      return res.json({ flag });
    } catch (error) {
      console.error("Get flag error:", error);
      return res.status(500).json({
        error: { code: "GET_FAILED", message: "Failed to get flag" },
      });
    }
  }

  // PUT /api/v1/flags/:id
  static async updateFlag(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;
      const { name, description, status } = req.body;

      const flag = await FlagService.getFlagById(id);

      if (!flag) {
        return res.status(404).json({
          error: { code: "FLAG_NOT_FOUND", message: "Flag not found" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(
        flag.project_id,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const updatedFlag = await FlagService.updateFlag(id, {
        name,
        description,
        status,
      });

      return res.json({ flag: updatedFlag });
    } catch (error) {
      console.error("Update flag error:", error);
      return res.status(500).json({
        error: { code: "UPDATE_FAILED", message: "Failed to update flag" },
      });
    }
  }

  // DELETE /api/v1/flags/:id
  static async deleteFlag(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;

      const flag = await FlagService.getFlagById(id);

      if (!flag) {
        return res.status(404).json({
          error: { code: "FLAG_NOT_FOUND", message: "Flag not found" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(
        flag.project_id,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      await FlagService.deleteFlag(id);

      return res.json({
        message: "Flag deleted successfully",
        flagId: id,
      });
    } catch (error) {
      console.error("Delete flag error:", error);
      return res.status(500).json({
        error: { code: "DELETE_FAILED", message: "Failed to delete flag" },
      });
    }
  }

  // PUT /api/v1/flags/:flagId/rules/:environmentId
  static async updateRule(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { flagId, environmentId } = req.params;
      const { enabled, percentage, userWhitelist, userBlacklist } = req.body;

      const flag = await FlagService.getFlagById(flagId);

      if (!flag) {
        return res.status(404).json({
          error: { code: "FLAG_NOT_FOUND", message: "Flag not found" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(
        flag.project_id,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const rule = await RuleService.updateRule(flagId, environmentId, {
        enabled,
        percentage,
        userWhitelist,
        userBlacklist,
      });

      return res.json({ rule });
    } catch (error: any) {
      console.error("Update rule error:", error);

      if (error.message.includes("between 0 and 100")) {
        return res.status(400).json({
          error: { code: "INVALID_PERCENTAGE", message: error.message },
        });
      }

      return res.status(500).json({
        error: { code: "UPDATE_FAILED", message: "Failed to update rule" },
      });
    }
  }

  // GET /api/v1/flags/:flagId/rules/:environmentId
  static async getRule(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { flagId, environmentId } = req.params;

      const flag = await FlagService.getFlagById(flagId);

      if (!flag) {
        return res.status(404).json({
          error: { code: "FLAG_NOT_FOUND", message: "Flag not found" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(
        flag.project_id,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const rule = await RuleService.getOrCreateRule(flagId, environmentId);

      return res.json({ rule });
    } catch (error) {
      console.error("Get rule error:", error);
      return res.status(500).json({
        error: { code: "GET_FAILED", message: "Failed to get rule" },
      });
    }
  }
}
