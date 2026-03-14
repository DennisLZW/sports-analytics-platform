import type { Request, Response } from "express";
import * as watchlistService from "../services/watchlistService.js";

function getUserId(req: Request): string | null {
  return (req as Request & { userId?: string }).userId ?? null;
}

export async function list(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const items = await watchlistService.listByUser(userId);
  res.json({ success: true, data: { items } });
}

export async function add(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const matchId = typeof req.body?.matchId === "string" ? req.body.matchId.trim() : null;
  if (!matchId) {
    res.status(400).json({ success: false, error: "MATCH_ID_REQUIRED" });
    return;
  }
  const item = await watchlistService.add(userId, matchId);
  if (!item) {
    res.status(404).json({ success: false, error: "MATCH_NOT_FOUND" });
    return;
  }
  res.status(201).json({ success: true, data: { item } });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const matchId = typeof req.params.matchId === "string" ? req.params.matchId : "";
  if (!matchId) {
    res.status(400).json({ success: false, error: "BAD_REQUEST" });
    return;
  }
  const removed = await watchlistService.remove(userId, matchId);
  if (!removed) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  res.json({ success: true, data: { removed: true } });
}
