import { PrismaClient } from "../generated/prisma/client.js";
import { getActualResult, isPredictionCorrect } from "../utils/predictionResult.js";

const prisma = new PrismaClient();

const NOW = new Date();
const UPCOMING_LIMIT = 5;
const RECENT_PREDICTIONS_LIMIT = 5;

export type DashboardData = {
  upcomingCount: number;
  upcomingMatches: Array<{
    id: string;
    homeTeamName: string;
    awayTeamName: string;
    matchTime: Date;
    league: { id: string; name: string } | null;
  }>;
  watchlistCount?: number;
  predictionCount?: number;
  /** 已结束比赛中的预测数、命中数、准确率（仅登录用户） */
  predictionStats?: {
    totalFinished: number;
    correct: number;
    accuracy: number | null;
  };
  recentPredictions?: Array<{
    id: string;
    matchId: string;
    predictedResult: string;
    confidence: number | null;
    actualResult: "home" | "draw" | "away" | null;
    isCorrect: boolean | null;
    match: {
      homeTeamName: string;
      awayTeamName: string;
      matchTime: Date;
      status: string;
      homeScore: number | null;
      awayScore: number | null;
      league: { name: string } | null;
    };
  }>;
};

export async function getDashboard(userId?: string): Promise<DashboardData> {
  const [upcomingCount, upcomingMatches] = await Promise.all([
    prisma.match.count({
      where: { status: "scheduled", matchTime: { gte: NOW } },
    }),
    prisma.match.findMany({
      where: { status: "scheduled", matchTime: { gte: NOW } },
      orderBy: { matchTime: "asc" },
      take: UPCOMING_LIMIT,
      include: { league: { select: { id: true, name: true } } },
    }),
  ]);

  const data: DashboardData = {
    upcomingCount,
    upcomingMatches: upcomingMatches.map((m) => ({
      id: m.id,
      homeTeamName: m.homeTeamName,
      awayTeamName: m.awayTeamName,
      matchTime: m.matchTime,
      league: m.league,
    })),
  };

  if (userId) {
    const [watchlistCount, predictionCount, allPredictionsForStats, recentPredictions] = await Promise.all([
      prisma.watchlistItem.count({ where: { userId } }),
      prisma.prediction.count({ where: { userId } }),
      prisma.prediction.findMany({
        where: { userId },
        select: {
          predictedResult: true,
          match: {
            select: { status: true, homeScore: true, awayScore: true },
          },
        },
      }),
      prisma.prediction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: RECENT_PREDICTIONS_LIMIT,
        include: {
          match: {
            include: { league: { select: { name: true } } },
          },
        },
      }),
    ]);
    data.watchlistCount = watchlistCount;
    data.predictionCount = predictionCount;

    let totalFinished = 0;
    let correct = 0;
    for (const p of allPredictionsForStats) {
      const actualResult = getActualResult(p.match);
      if (actualResult !== null) {
        totalFinished += 1;
        if (isPredictionCorrect(p.predictedResult, actualResult)) correct += 1;
      }
    }
    data.predictionStats = {
      totalFinished,
      correct,
      accuracy: totalFinished > 0 ? Math.round((correct / totalFinished) * 1000) / 10 : null,
    };

    data.recentPredictions = recentPredictions.map((p) => {
      const actualResult = getActualResult(p.match);
      return {
        id: p.id,
        matchId: p.matchId,
        predictedResult: p.predictedResult,
        confidence: p.confidence,
        actualResult,
        isCorrect: isPredictionCorrect(p.predictedResult, actualResult),
        match: {
          homeTeamName: p.match.homeTeamName,
          awayTeamName: p.match.awayTeamName,
          matchTime: p.match.matchTime,
          status: p.match.status,
          homeScore: p.match.homeScore,
          awayScore: p.match.awayScore,
          league: p.match.league,
        },
      };
    });
  }

  return data;
}
