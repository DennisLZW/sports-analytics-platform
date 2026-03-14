import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

type ListMatchesParams = {
  leagueId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function listMatches(params: ListMatchesParams = {}) {
  const { leagueId, status, from, to, page = 1, limit = 20 } = params;
  const where: Record<string, unknown> = {};
  if (leagueId) where.leagueId = leagueId;
  if (status) where.status = status;
  if (from || to) {
    where.matchTime = {};
    if (from) (where.matchTime as Record<string, Date>).gte = new Date(from);
    if (to) (where.matchTime as Record<string, Date>).lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    prisma.match.findMany({
      where,
      orderBy: { matchTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { league: { select: { id: true, name: true, sportType: true } } },
    }),
    prisma.match.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: { league: true },
  });
}

export async function getMatchOdds(matchId: string) {
  return prisma.matchOdds.findMany({
    where: { matchId },
    orderBy: { recordedAt: "asc" },
  });
}

export type MatchPredictionStats = {
  home: number;
  draw: number;
  away: number;
  total: number;
};

export async function getMatchPredictionStats(matchId: string): Promise<MatchPredictionStats> {
  const list = await prisma.prediction.findMany({
    where: { matchId },
    select: { predictedResult: true },
  });
  let home = 0;
  let draw = 0;
  let away = 0;
  for (const p of list) {
    if (p.predictedResult === "home") home += 1;
    else if (p.predictedResult === "draw") draw += 1;
    else if (p.predictedResult === "away") away += 1;
  }
  return { home, draw, away, total: list.length };
}
