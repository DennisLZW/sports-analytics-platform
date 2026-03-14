import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as predictionController from "../controllers/predictionController.js";

const router = Router();
router.use(authMiddleware);

router.get("/", predictionController.list);
router.post("/", predictionController.upsert);
router.delete("/:matchId", predictionController.remove);

export default router;
