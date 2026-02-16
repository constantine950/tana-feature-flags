import { Router } from "express";
import { AnalyticsController } from "../controllers/analyticsController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/projects/:projectId/activity", AnalyticsController.getActivity);
router.get("/flags/:flagId/activity", AnalyticsController.getFlagActivity);
router.get("/flags/:flagId/stats", AnalyticsController.getFlagStats);

export default router;
