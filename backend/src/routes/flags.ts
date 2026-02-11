import { Router } from "express";
import { FlagController } from "../controllers/flagController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Flag CRUD
router.get("/:id", FlagController.getFlag);
router.put("/:id", FlagController.updateFlag);
router.delete("/:id", FlagController.deleteFlag);

// Rule management
router.get("/:flagId/rules/:environmentId", FlagController.getRule);
router.put("/:flagId/rules/:environmentId", FlagController.updateRule);

export default router;
