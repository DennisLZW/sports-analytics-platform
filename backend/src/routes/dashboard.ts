import { Router } from "express";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboardController.js";

const router = Router();
router.get("/", optionalAuthMiddleware, dashboardController.get);

export default router;
