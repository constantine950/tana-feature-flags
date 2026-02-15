import { Request, Response } from "express";
import { ProjectService } from "../services/projectService";

export class ProjectController {
  // GET /api/v1/projects
  static async listProjects(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const projects = await ProjectService.getProjectsByOwner(req.user.userId);

      return res.json({ projects });
    } catch (error) {
      console.error("List projects error:", error);
      return res.status(500).json({
        error: { code: "LIST_FAILED", message: "Failed to list projects" },
      });
    }
  }

  // POST /api/v1/projects
  static async createProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          error: { code: "MISSING_NAME", message: "Project name is required" },
        });
      }

      if (name.length > 255) {
        return res.status(400).json({
          error: { code: "NAME_TOO_LONG", message: "Project name too long" },
        });
      }

      const project = await ProjectService.createProject(
        name,
        req.user.userId,
        description,
      );

      return res.status(201).json({ project });
    } catch (error) {
      console.error("Create project error:", error);
      return res.status(500).json({
        error: { code: "CREATE_FAILED", message: "Failed to create project" },
      });
    }
  }

  // GET /api/v1/projects/:id
  static async getProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;

      const project = await ProjectService.getProjectById(id);

      if (!project) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found" },
        });
      }

      // Check ownership
      if (project.owner_id !== req.user.userId) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      return res.json({ project });
    } catch (error) {
      console.error("Get project error:", error);
      return res.status(500).json({
        error: { code: "GET_FAILED", message: "Failed to get project" },
      });
    }
  }

  // PUT /api/v1/projects/:id
  static async updateProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;
      const { name, description } = req.body;

      // Check ownership
      const isOwner = await ProjectService.isOwner(id, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const project = await ProjectService.updateProject(id, name, description);

      if (!project) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found" },
        });
      }

      return res.json({ project });
    } catch (error) {
      console.error("Update project error:", error);
      return res.status(500).json({
        error: { code: "UPDATE_FAILED", message: "Failed to update project" },
      });
    }
  }

  // DELETE /api/v1/projects/:id
  static async deleteProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
      }

      const { id } = req.params;

      // Check ownership
      const isOwner = await ProjectService.isOwner(id, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not project owner" },
        });
      }

      const deleted = await ProjectService.deleteProject(id);

      if (!deleted) {
        return res.status(404).json({
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found" },
        });
      }

      return res.json({
        message: "Project deleted successfully",
        projectId: id,
      });
    } catch (error) {
      console.error("Delete project error:", error);
      return res.status(500).json({
        error: { code: "DELETE_FAILED", message: "Failed to delete project" },
      });
    }
  }
}
