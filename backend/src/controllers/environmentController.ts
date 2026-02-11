import { Request, Response } from "express";
import { EnvironmentService } from "../services/environmentService";
import { ProjectService } from "../services/projectService";

export class EnvironmentController {
  // GET /api/v1/projects/:projectId/environments
  static async listEnvironments(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { projectId } = req.params;

      // Check ownership
      const isOwner = await ProjectService.isOwner(projectId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const environments =
        await EnvironmentService.getEnvironmentsByProject(projectId);

      return res.json({ environments });
    } catch (error) {
      console.error("List environments error:", error);
      return res.status(500).json({
        error: { code: "LIST_FAILED", message: "Failed to list environments" },
      });
    }
  }

  // POST /api/v1/projects/:projectId/environments
  static async createEnvironment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { projectId } = req.params;
      const { name, key } = req.body;

      if (!name || !key) {
        return res.status(400).json({
          error: { code: "MISSING_FIELDS", message: "Name and key required" },
        });
      }

      // Validate key format (lowercase alphanumeric + dash)
      if (!/^[a-z0-9-]+$/.test(key)) {
        return res.status(400).json({
          error: {
            code: "INVALID_KEY",
            message: "Key must be lowercase alphanumeric with dashes",
          },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(projectId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const environment = await EnvironmentService.createEnvironment(
        projectId,
        name,
        key,
      );

      return res.status(201).json({
        environment,
        message: "Save the API key - it will not be shown again!",
      });
    } catch (error: any) {
      console.error("Create environment error:", error);

      if (error.code === "23505") {
        // Unique violation
        return res.status(409).json({
          error: {
            code: "DUPLICATE_KEY",
            message: "Environment key already exists",
          },
        });
      }

      return res.status(500).json({
        error: {
          code: "CREATE_FAILED",
          message: "Failed to create environment",
        },
      });
    }
  }

  // DELETE /api/v1/environments/:id
  static async deleteEnvironment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;

      // Get environment to check project ownership
      const environment = await EnvironmentService.getEnvironmentById(id);

      if (!environment) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Environment not found" },
        });
      }

      // Check project ownership
      const isOwner = await ProjectService.isOwner(
        environment.projectId,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      await EnvironmentService.deleteEnvironment(id);

      return res.json({
        message: "Environment deleted successfully",
        environmentId: id,
      });
    } catch (error) {
      console.error("Delete environment error:", error);
      return res.status(500).json({
        error: {
          code: "DELETE_FAILED",
          message: "Failed to delete environment",
        },
      });
    }
  }

  // POST /api/v1/environments/:id/rotate-key
  static async rotateApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;

      // Get environment
      const environment = await EnvironmentService.getEnvironmentById(id);

      if (!environment) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Environment not found" },
        });
      }

      // Check ownership
      const isOwner = await ProjectService.isOwner(
        environment.projectId,
        req.user.userId,
      );

      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const newApiKey = await EnvironmentService.rotateApiKey(id);

      return res.json({
        apiKey: newApiKey,
        message: "API key rotated. Save it - it will not be shown again!",
      });
    } catch (error) {
      console.error("Rotate API key error:", error);
      return res.status(500).json({
        error: { code: "ROTATE_FAILED", message: "Failed to rotate API key" },
      });
    }
  }
}
