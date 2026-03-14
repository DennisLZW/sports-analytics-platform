import { PrismaClient } from "../generated/prisma/client.js";
import { getActualResult, isPredictionCorrect } from "../utils/predictionResult.js";

const prisma = new PrismaClient();

const VALID_RESULTS = ["home", "draw", "away"] as const;

export async function listByUser(userId: string, matchId?: string) {
  const where: { userId: string; matchId?: string } = { userId };
  if (matchId) where.matchId = matchId;
  const list = await prisma.prediction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      match: {
        include: { league: { select: { id: true, name: true } } },
      },
    },
  });
  return list.map((p) => {
    const actualResult = getActualResult(p.match);
    return {
      ...p,
      actualResult,
      isCorrect: isPredictionCorrect(p.predictedResult, actualResult),
    };
  });
}

export async function upsert(
  userId: string,
  matchId: string,
  predictedResult: string,
  confidence?: number
) {
  if (!VALID_RESULTS.includes(predictedResult as (typeof VALID_RESULTS)[number])) {
    throw new Error("INVALID_RESULT");
  }
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return null;
  const conf =
    confidence != null && Number.isFinite(confidence)
      ? Math.max(1, Math.min(10, Math.round(confidence)))
      : null;
  return prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    create: { userId, matchId, predictedResult, confidence: conf },
    update: { predictedResult, confidence: conf },
    include: {
      match: {
        include: { league: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function remove(userId: string, matchId: string) {
  const deleted = await prisma.prediction.deleteMany({
    where: { userId, matchId },
  });
  return deleted.count > 0;
}

export async function getByUserAndMatch(userId: string, matchId: string) {
  return prisma.prediction.findUnique({
    where: { userId_matchId: { userId, matchId } },
    include: { match: true },
  });
}
