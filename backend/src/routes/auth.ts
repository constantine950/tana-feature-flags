import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes
router.get("/me", authenticate, AuthController.getProfile);

export default router;
