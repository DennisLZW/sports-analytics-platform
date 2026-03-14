import type { Request, Response } from "express";
import * as leagueService from "../services/leagueService.js";

export async function list(req: Request, res: Response): Promise<void> {
  const sportType = typeof req.query.sportType === "string" ? req.query.sportType : undefined;
  const leagues = await leagueService.listLeagues(sportType);
  res.json({ success: true, data: { leagues } });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  if (!id) {
    res.status(400).json({ success: false, error: "BAD_REQUEST" });
    return;
  }
  const league = await leagueService.getLeagueById(id);
  if (!league) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  res.json({ success: true, data: { league } });
}
