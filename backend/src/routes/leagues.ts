import { Router } from "express";
import * as leagueController from "../controllers/leagueController.js";

const router = Router();

router.get("/", leagueController.list);
router.get("/:id", leagueController.getById);

export default router;
