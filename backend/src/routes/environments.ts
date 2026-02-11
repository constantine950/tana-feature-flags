import { Router } from "express";
import { EnvironmentController } from "../controllers/environmentController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.delete("/:id", EnvironmentController.deleteEnvironment);
router.post("/:id/rotate-key", EnvironmentController.rotateApiKey);

export default router;
