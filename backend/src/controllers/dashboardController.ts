import type { Request, Response } from "express";
import * as dashboardService from "../services/dashboardService.js";

export async function get(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { userId?: string }).userId;
  const data = await dashboardService.getDashboard(userId);
  res.json({ success: true, data });
}
