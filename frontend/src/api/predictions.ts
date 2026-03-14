import api from './client';
import type { Match } from './matches';

export type Prediction = {
  id: string;
  matchId: string;
  predictedResult: string;
  confidence: number | null;
  /** Actual result when match is finished */
  actualResult: 'home' | 'draw' | 'away' | null;
  /** Whether prediction was correct (null if not finished) */
  isCorrect: boolean | null;
  match: Match;
};

export async function fetchPredictions(matchId?: string): Promise<Prediction[]> {
  const params = matchId ? { matchId } : {};
  const { data } = await api.get<{ success: true; data: { items: Prediction[] } }>('/predictions', { params });
  if (!data.success || !data.data) return [];
  return data.data.items;
}

export async function upsertPrediction(
  matchId: string,
  predictedResult: string,
  confidence?: number
): Promise<Prediction> {
  const { data } = await api.post<{ success: true; data: { item: Prediction } }>('/predictions', {
    matchId,
    predictedResult,
    confidence,
  });
  if (!data.success || !data.data?.item) throw new Error('Upsert failed');
  return data.data.item;
}

export async function removePrediction(matchId: string): Promise<void> {
  await api.delete(`/predictions/${matchId}`);
}
