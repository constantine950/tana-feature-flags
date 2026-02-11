import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { EnvironmentController } from "../controllers/environmentController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Project routes
router.get("/", ProjectController.listProjects);
router.post("/", ProjectController.createProject);
router.get("/:id", ProjectController.getProject);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

// Environment routes
router.get("/:projectId/environments", EnvironmentController.listEnvironments);
router.post(
  "/:projectId/environments",
  EnvironmentController.createEnvironment,
);

export default router;
