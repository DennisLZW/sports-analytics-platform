import { Router } from "express";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import * as matchController from "../controllers/matchController.js";

const router = Router();

router.get("/", matchController.list);
router.get("/:id/prediction-stats", matchController.getPredictionStats);
router.get("/:id", optionalAuthMiddleware, matchController.getById);
router.get("/:id/odds", matchController.getOdds);

export default router;
