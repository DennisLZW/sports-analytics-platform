import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token =
    header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (typeof payload.sub !== "string") {
      res.status(401).json({ success: false, error: "UNAUTHORIZED" });
      return;
    }
    (req as Request & { userId: string }).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }
}

/** Optional auth: set userId when token valid, do not 401 when missing/invalid */
export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (typeof payload.sub === "string") {
      (req as Request & { userId?: string }).userId = payload.sub;
    }
  } catch {
    // ignore invalid token
  }
  next();
}
