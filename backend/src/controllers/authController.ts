import type { Request, Response } from "express";
import * as authService from "../services/authService.js";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({ success: false, error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ success: false, error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }
    const result = await authService.register(
      email.trim(),
      password,
      typeof name === "string" ? name.trim() : undefined
    );
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_IN_USE") {
      res.status(409).json({ success: false, error: "EMAIL_IN_USE" });
      return;
    }
    throw e;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({ success: false, error: "INVALID_CREDENTIALS" });
      return;
    }
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ success: false, error: "INVALID_CREDENTIALS" });
      return;
    }
    const result = await authService.login(email.trim(), password);
    res.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ success: false, error: "INVALID_CREDENTIALS" });
      return;
    }
    throw e;
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const user = await authService.getMe(userId);
  if (!user) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  res.json({ success: true, data: { user } });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const name =
    typeof req.body?.name === "string"
      ? req.body.name.trim()
      : req.body?.name === null
        ? null
        : undefined;
  if (name === undefined) {
    res.status(400).json({ success: false, error: "NAME_REQUIRED" });
    return;
  }
  const user = await authService.updateProfile(userId, name ?? null);
  if (!user) {
    res.status(404).json({ success: false, error: "NOT_FOUND" });
    return;
  }
  res.json({ success: true, data: { user } });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    return;
  }
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (
    !currentPassword ||
    !newPassword ||
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string"
  ) {
    res.status(400).json({ success: false, error: "CURRENT_AND_NEW_PASSWORD_REQUIRED" });
    return;
  }
  try {
    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    if (e instanceof Error && e.message === "WRONG_PASSWORD") {
      res.status(400).json({ success: false, error: "WRONG_PASSWORD" });
      return;
    }
    if (e instanceof Error && e.message === "PASSWORD_TOO_SHORT") {
      res.status(400).json({ success: false, error: "PASSWORD_TOO_SHORT" });
      return;
    }
    throw e;
  }
}
