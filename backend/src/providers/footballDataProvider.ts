import { footballDataRequest } from './footballDataClient.js';

export type FootballDataCompetition = {
  id: number;
  name: string;
  area?: { name?: string; code?: string };
};

export type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  competition: { id: number; name: string; area?: { name?: string; code?: string } };
  homeTeam: { id: number; name: string; crest?: string };
  awayTeam: { id: number; name: string; crest?: string };
  score?: { fullTime?: { home?: number | null; away?: number | null } };
};

export async function listCompetitions() {
  const data = await footballDataRequest<{ competitions: FootballDataCompetition[] }>('/competitions');
  return data.competitions;
}

export async function getCompetitionMatches(competitionId: number, dateFrom: string, dateTo: string) {
  const data = await footballDataRequest<{ matches: FootballDataMatch[] }>(`/competitions/${competitionId}/matches`, {
    query: { dateFrom, dateTo }
  });
  return data.matches;
}
