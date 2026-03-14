import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export async function listLeagues(sportType?: string) {
  return prisma.league.findMany({
    ...(sportType ? { where: { sportType } } : {}),
    orderBy: { name: "asc" },
    include: { _count: { select: { matches: true } } },
  });
}

export async function getLeagueById(id: string) {
  return prisma.league.findUnique({
    where: { id },
    include: { _count: { select: { matches: true } } },
  });
}
