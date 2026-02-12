import { query } from '../../db/pool.js';
import { getCompetitionMatches } from '../../providers/footballDataProvider.js';
import { GameDTO, MatchDay, MatchGroup } from './types.js';

type CompetitionConfig = {
  competition_id: number;
  group: MatchGroup;
  enabled: 0 | 1;
  display_name?: string | null;
};

function toYmd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayToDate(day: MatchDay) {
  const now = new Date();
  if (day === 'today') return toYmd(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toYmd(tomorrow);
}

function toBrt(utcDate: string) {
  const dt = new Date(utcDate);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dt);
}

function normalizeStatus(raw: string): GameDTO['status'] {
  if (raw === 'IN_PLAY') return 'LIVE';
  if (raw === 'TIMED') return 'SCHEDULED';
  if (raw === 'SUSPENDED') return 'PAUSED';
  const allowed: GameDTO['status'][] = ['SCHEDULED', 'LIVE', 'FINISHED', 'PAUSED', 'POSTPONED', 'CANCELLED'];
  return allowed.includes(raw as any) ? (raw as GameDTO['status']) : 'SCHEDULED';
}

function normalizeGame(group: MatchGroup, displayName: string | null | undefined, match: any): GameDTO {
  return {
    id: match.id,
    group,
    competition: {
      id: match.competition.id,
      name: displayName || match.competition.name,
      areaName: match.competition.area?.name ?? '',
      areaCode: match.competition.area?.code
    },
    status: normalizeStatus(match.status),
    kickoffUTC: match.utcDate,
    kickoffBRT: toBrt(match.utcDate),
    home: {
      id: match.homeTeam?.id ?? 0,
      name: match.homeTeam?.name ?? 'Time da casa',
      crest: match.homeTeam?.crest
    },
    away: {
      id: match.awayTeam?.id ?? 0,
      name: match.awayTeam?.name ?? 'Visitante',
      crest: match.awayTeam?.crest
    },
    score: {
      home: match.score?.fullTime?.home ?? undefined,
      away: match.score?.fullTime?.away ?? undefined
    }
  };
}

async function getEnabledCompetitions(group: MatchGroup) {
  const rows = await query<CompetitionConfig>(
    'SELECT competition_id, `group`, enabled, display_name FROM football_competitions_config WHERE enabled = 1 AND `group` = ?',
    [group]
  );
  return rows;
}

async function getCache(group: MatchGroup, date: string): Promise<GameDTO[] | null> {
  const [row] = await query<any>(
    'SELECT payload_json FROM football_matches_cache WHERE `group` = ? AND `date` = ? AND expires_at > NOW()',
    [group, date]
  );
  return row ? (JSON.parse(row.payload_json) as GameDTO[]) : null;
}

async function getStaleCache(group: MatchGroup, date: string): Promise<GameDTO[] | null> {
  const [row] = await query<any>('SELECT payload_json FROM football_matches_cache WHERE `group` = ? AND `date` = ? ORDER BY id DESC LIMIT 1', [
    group,
    date
  ]);
  return row ? (JSON.parse(row.payload_json) as GameDTO[]) : null;
}

async function saveCache(group: MatchGroup, date: string, games: GameDTO[], day: MatchDay) {
  const minutes = day === 'today' ? 8 : 120;
  await query(
    'INSERT INTO football_matches_cache (`group`, `date`, payload_json, fetched_at, expires_at) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE)) ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), fetched_at = NOW(), expires_at = VALUES(expires_at)',
    [group, date, JSON.stringify(games), minutes]
  );
}

function sortByKickoffBrt(games: GameDTO[]) {
  return games.sort((a, b) => a.kickoffBRT.localeCompare(b.kickoffBRT));
}

export function buildGuideText(games: GameDTO[]) {
  const byCompetition = new Map<string, GameDTO[]>();
  for (const game of games) {
    const key = game.competition.name;
    if (!byCompetition.has(key)) byCompetition.set(key, []);
    byCompetition.get(key)!.push(game);
  }

  const blocks: string[] = [];
  for (const [competition, items] of byCompetition) {
    const sorted = [...items].sort((a, b) => a.kickoffBRT.localeCompare(b.kickoffBRT));
    const lines = sorted.map((game) => {
      const hhmm = game.kickoffBRT.split(' ')[1] ?? '--:--';
      return `🕒 ${hhmm} (BRT)\n⚽ ${game.home.name} x ${game.away.name}\n📌 ${game.status}`;
    });
    blocks.push(`🏆 ${competition}\n${lines.join('\n\n')}`);
  }

  return blocks.join('\n\n');
}

export async function getMatchesByDay(group: MatchGroup, day: MatchDay): Promise<GameDTO[]> {
  const date = dayToDate(day);

  const cached = await getCache(group, date);
  if (cached) return sortByKickoffBrt(cached);

  const competitions = await getEnabledCompetitions(group);
  if (competitions.length === 0) return [];

  const all: GameDTO[] = [];
  try {
    for (const competition of competitions) {
      const matches = await getCompetitionMatches(competition.competition_id, date, date);
      const normalized = matches.map((m) => normalizeGame(group, competition.display_name, m));
      all.push(...normalized);
    }

    const sorted = sortByKickoffBrt(all);
    await saveCache(group, date, sorted, day);
    return sorted;
  } catch (err: any) {
    if (err?.code === 429) {
      const stale = await getStaleCache(group, date);
      if (stale) return sortByKickoffBrt(stale);
    }
    throw err;
  }
}

export async function getLiveMatches(group: MatchGroup) {
  const today = await getMatchesByDay(group, 'today');
  return today.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED');
}

export async function refreshCacheJobs() {
  for (const group of ['BR', 'INT'] as MatchGroup[]) {
    await getMatchesByDay(group, 'today');
    await getMatchesByDay(group, 'tomorrow');
  }
}
