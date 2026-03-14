import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as watchlistController from "../controllers/watchlistController.js";

const router = Router();
router.use(authMiddleware);

router.get("/", watchlistController.list);
router.post("/", watchlistController.add);
router.delete("/:matchId", watchlistController.remove);

export default router;
