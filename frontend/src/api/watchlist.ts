import api from './client';
import type { Match } from './matches';

export type WatchlistItem = {
  id: string;
  matchId: string;
  match: Match;
};

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const { data } = await api.get<{ success: true; data: { items: WatchlistItem[] } }>('/watchlist');
  if (!data.success || !data.data) return [];
  return data.data.items;
}

export async function addToWatchlist(matchId: string): Promise<WatchlistItem> {
  const { data } = await api.post<{ success: true; data: { item: WatchlistItem } }>('/watchlist', { matchId });
  if (!data.success || !data.data?.item) throw new Error('Add failed');
  return data.data.item;
}

export async function removeFromWatchlist(matchId: string): Promise<void> {
  await api.delete(`/watchlist/${matchId}`);
}
