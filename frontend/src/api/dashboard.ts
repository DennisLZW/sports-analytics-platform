import api from './client';

export type DashboardData = {
  upcomingCount: number;
  upcomingMatches: Array<{
    id: string;
    homeTeamName: string;
    awayTeamName: string;
    matchTime: string;
    league: { id: string; name: string } | null;
  }>;
  watchlistCount?: number;
  predictionCount?: number;
  /** Finished matches: total, correct, accuracy % */
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
    actualResult: 'home' | 'draw' | 'away' | null;
    isCorrect: boolean | null;
    match: {
      homeTeamName: string;
      awayTeamName: string;
      matchTime: string;
      status: string;
      homeScore: number | null;
      awayScore: number | null;
      league: { name: string } | null;
    };
  }>;
};

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<{ success: true; data: DashboardData }>('/dashboard');
  if (!data.success || !data.data) {
    return {
      upcomingCount: 0,
      upcomingMatches: [],
    };
  }
  return data.data;
}
