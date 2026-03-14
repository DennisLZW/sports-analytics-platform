import api from './client';

export type LeagueInfo = {
  id: string;
  name: string;
  sportType: string | null;
};

export type Match = {
  id: string;
  leagueId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchTime: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  league?: LeagueInfo;
};

export type MatchOdds = {
  id: string;
  matchId: string;
  source: string | null;
  homeOdds: number;
  drawOdds: number | null;
  awayOdds: number;
  recordedAt: string;
};

export type MatchesResult = {
  items: Match[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchMatches(params?: {
  leagueId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<MatchesResult> {
  const { data } = await api.get<{ success: true; data: MatchesResult }>('/matches', { params });
  if (!data.success || !data.data) return { items: [], total: 0, page: 1, limit: 20 };
  return data.data;
}

export type MatchDetail = {
  match: Match;
  inWatchlist?: boolean;
  userPrediction?: { predictedResult: string; confidence: number | null };
};

export async function fetchMatch(id: string): Promise<MatchDetail | null> {
  const { data } = await api.get<{
    success: true;
    data: { match: Match; inWatchlist?: boolean; userPrediction?: { predictedResult: string; confidence: number | null } };
  }>(`/matches/${id}`);
  if (!data.success || !data.data?.match) return null;
  return data.data;
}

export async function fetchMatchOdds(matchId: string): Promise<MatchOdds[]> {
  const { data } = await api.get<{ success: true; data: { odds: MatchOdds[] } }>(`/matches/${matchId}/odds`);
  if (!data.success || !data.data) return [];
  return data.data.odds;
}

export type MatchPredictionStats = {
  home: number;
  draw: number;
  away: number;
  total: number;
};

export async function fetchMatchPredictionStats(matchId: string): Promise<MatchPredictionStats> {
  const { data } = await api.get<{ success: true; data: MatchPredictionStats }>(
    `/matches/${matchId}/prediction-stats`
  );
  if (!data.success || !data.data) return { home: 0, draw: 0, away: 0, total: 0 };
  return data.data;
}
