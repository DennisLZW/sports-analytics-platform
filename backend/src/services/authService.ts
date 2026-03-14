import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const SALT_ROUNDS = 10;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<{ user: AuthUser; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name ?? null },
  });
  const token = jwt.sign(
    { sub: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const token = jwt.sign(
    { sub: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export async function getMe(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  return user;
}

export async function updateProfile(
  userId: string,
  name: string | null
): Promise<AuthUser | null> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name === "" ? null : name },
    select: { id: true, email: true, name: true },
  });
  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    throw new Error("WRONG_PASSWORD");
  }
  if (newPassword.length < 6) {
    throw new Error("PASSWORD_TOO_SHORT");
  }
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
