import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export async function listByUser(userId: string) {
  return prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      match: {
        include: { league: { select: { id: true, name: true, sportType: true } } },
      },
    },
  });
}

export async function add(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return null;
  return prisma.watchlistItem.upsert({
    where: {
      userId_matchId: { userId, matchId },
    },
    create: { userId, matchId },
    update: {},
    include: {
      match: {
        include: { league: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function remove(userId: string, matchId: string) {
  const deleted = await prisma.watchlistItem.deleteMany({
    where: { userId, matchId },
  });
  return deleted.count > 0;
}

export async function isInWatchlist(userId: string, matchId: string) {
  const item = await prisma.watchlistItem.findUnique({
    where: { userId_matchId: { userId, matchId } },
  });
  return !!item;
}
