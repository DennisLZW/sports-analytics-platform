import type { Request, Response } from "express";
import * as predictionService from "../services/predictionService.js";

function getUserId(req: Request): string | null {
  return (req as Request & { userId?: string }).userId ?? null;
}

export async function list(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const matchId = typeof req.query.matchId === "string" ? req.query.matchId : undefined;
  const items = await predictionService.listByUser(userId, matchId);
  res.json({ success: true, data: { items } });
}

export async function upsert(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const matchId = typeof req.body?.matchId === "string" ? req.body.matchId.trim() : null;
  const predictedResult = typeof req.body?.predictedResult === "string" ? req.body.predictedResult.trim().toLowerCase() : null;
  const confidence = req.body?.confidence != null ? Number(req.body.confidence) : undefined;
  if (!matchId || !predictedResult) {
    res.status(400).json({ success: false, error: "MATCH_ID_AND_RESULT_REQUIRED" });
    return;
  }
  try {
    const item = await predictionService.upsert(userId, matchId, predictedResult, confidence);
    if (!item) {
      res.status(404).json({ success: false, error: "MATCH_NOT_FOUND" });
      return;
    }
    res.json({ success: true, data: { item } });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_RESULT") {
      res.status(400).json({ success: false, error: "INVALID_RESULT" });
      return;
    }
    throw e;
  }
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
  const removed = await predictionService.remove(userId, matchId);
  if (!removed) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  res.json({ success: true, data: { removed: true } });
}
