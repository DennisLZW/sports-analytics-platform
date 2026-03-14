import type { Request, Response } from "express";
import * as matchService from "../services/matchService.js";
import * as watchlistService from "../services/watchlistService.js";
import * as predictionService from "../services/predictionService.js";

export async function list(req: Request, res: Response): Promise<void> {
  const leagueId = typeof req.query.leagueId === "string" ? req.query.leagueId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const page = req.query.page != null ? Number(req.query.page) : 1;
  const limit = req.query.limit != null ? Number(req.query.limit) : 20;

  const params: Parameters<typeof matchService.listMatches>[0] = {
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? Math.min(limit, 100) : 20,
  };
  if (leagueId !== undefined) params.leagueId = leagueId;
  if (status !== undefined) params.status = status;
  if (from !== undefined) params.from = from;
  if (to !== undefined) params.to = to;

  const result = await matchService.listMatches(params);
  res.json({ success: true, data: result });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  if (!id) {
    res.status(400).json({ success: false, error: "BAD_REQUEST" });
    return;
  }
  const userId = (req as Request & { userId?: string }).userId;
  const match = await matchService.getMatchById(id);
  if (!match) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  const data: { match: typeof match; inWatchlist?: boolean; userPrediction?: { predictedResult: string; confidence: number | null } } = { match };
  if (userId) {
    data.inWatchlist = await watchlistService.isInWatchlist(userId, id);
    const pred = await predictionService.getByUserAndMatch(userId, id);
    if (pred) data.userPrediction = { predictedResult: pred.predictedResult, confidence: pred.confidence };
  }
  res.json({ success: true, data });
}

export async function getOdds(req: Request, res: Response): Promise<void> {
  const matchId = typeof req.params.id === "string" ? req.params.id : "";
  if (!matchId) {
    res.status(400).json({ success: false, error: "BAD_REQUEST" });
    return;
  }
  const match = await matchService.getMatchById(matchId);
  if (!match) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  const odds = await matchService.getMatchOdds(matchId);
  res.json({ success: true, data: { odds } });
}

export async function getPredictionStats(req: Request, res: Response): Promise<void> {
  const matchId = typeof req.params.id === "string" ? req.params.id : "";
  if (!matchId) {
    res.status(400).json({ success: false, error: "BAD_REQUEST" });
    return;
  }
  const match = await matchService.getMatchById(matchId);
  if (!match) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  const stats = await matchService.getMatchPredictionStats(matchId);
  res.json({ success: true, data: stats });
}
