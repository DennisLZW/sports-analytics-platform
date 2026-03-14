import api from './client';

export type League = {
  id: string;
  name: string;
  sportType: string | null;
  country: string | null;
  _count?: { matches: number };
};

export async function fetchLeagues(sportType?: string): Promise<League[]> {
  const params = sportType ? { sportType } : {};
  const { data } = await api.get<{ success: true; data: { leagues: League[] } }>('/leagues', { params });
  if (!data.success || !data.data) return [];
  return data.data.leagues;
}

export async function fetchLeague(id: string): Promise<League | null> {
  const { data } = await api.get<{ success: true; data: { league: League } }>(`/leagues/${id}`);
  if (!data.success || !data.data?.league) return null;
  return data.data.league;
}
