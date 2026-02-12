export type MatchGroup = 'BR' | 'INT';
export type MatchDay = 'today' | 'tomorrow';

export type GameDTO = {
  id: number;
  group: MatchGroup;
  competition: {
    id: number;
    name: string;
    areaName: string;
    areaCode?: string;
  };
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'PAUSED' | 'POSTPONED' | 'CANCELLED';
  kickoffUTC: string;
  kickoffBRT: string;
  home: { id: number; name: string; crest?: string };
  away: { id: number; name: string; crest?: string };
  score?: { home?: number; away?: number };
};
