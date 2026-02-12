import { query } from '../../db/pool.js';
import { getCompetitionMatches } from '../../providers/footballDataProvider.js';
import { GameDTO, MatchDay, MatchGroup } from './types.js';

type CompetitionConfig = {
  competition_id: number;
  group: MatchGroup;
  enabled: 0 | 1;
  display_name?: string | null;
};

const BRT_TZ = 'America/Sao_Paulo';

function formatBrtParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');

  return {
    ymd: `${year}-${month}-${day}`,
    hhmm: `${hour}:${minute}`,
    full: `${year}-${month}-${day} ${hour}:${minute}`
  };
}

function addDays(ymd: string, days: number) {
  const base = new Date(`${ymd}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

function dayToDate(day: MatchDay) {
  const todayBrt = formatBrtParts(new Date()).ymd;
  return day === 'today' ? todayBrt : addDays(todayBrt, 1);
}

function normalizeStatus(raw: string): GameDTO['status'] {
  if (raw === 'IN_PLAY') return 'LIVE';
  if (raw === 'TIMED') return 'SCHEDULED';
  if (raw === 'SUSPENDED') return 'PAUSED';
  const allowed: GameDTO['status'][] = ['SCHEDULED', 'LIVE', 'FINISHED', 'PAUSED', 'POSTPONED', 'CANCELLED'];
  return allowed.includes(raw as any) ? (raw as GameDTO['status']) : 'SCHEDULED';
}

function normalizeGame(group: MatchGroup, displayName: string | null | undefined, match: any): GameDTO {
  const brt = formatBrtParts(new Date(match.utcDate));

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
    kickoffBRT: brt.full,
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

function isGameInBrtDate(game: GameDTO, expectedYmd: string) {
  return formatBrtParts(new Date(game.kickoffUTC)).ymd === expectedYmd;
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
  if (!row) return null;

  const games = JSON.parse(row.payload_json) as GameDTO[];
  // proteção contra cache antigo calculado em UTC incorreto
  if (games.some((game) => !isGameInBrtDate(game, date))) {
    return null;
  }

  return games;
}

async function getStaleCache(group: MatchGroup, date: string): Promise<GameDTO[] | null> {
  const [row] = await query<any>('SELECT payload_json FROM football_matches_cache WHERE `group` = ? AND `date` = ? ORDER BY id DESC LIMIT 1', [
    group,
    date
  ]);
  if (!row) return null;

  const games = JSON.parse(row.payload_json) as GameDTO[];
  return games.filter((game) => isGameInBrtDate(game, date));
}

async function saveCache(group: MatchGroup, date: string, games: GameDTO[], day: MatchDay) {
  const minutes = day === 'today' ? 8 : 120;
  await query(
    'INSERT INTO football_matches_cache (`group`, `date`, payload_json, fetched_at, expires_at) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE)) ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), fetched_at = NOW(), expires_at = VALUES(expires_at)',
    [group, date, JSON.stringify(games), minutes]
  );
}

function sortByKickoff(games: GameDTO[]) {
  return games.sort((a, b) => new Date(a.kickoffUTC).getTime() - new Date(b.kickoffUTC).getTime());
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
    const sorted = [...items].sort((a, b) => new Date(a.kickoffUTC).getTime() - new Date(b.kickoffUTC).getTime());
    const lines = sorted.map((game) => {
      const hhmm = formatBrtParts(new Date(game.kickoffUTC)).hhmm;
      return `🕒 ${hhmm} (BRT)\n⚽ ${game.home.name} x ${game.away.name}\n📌 ${game.status}`;
    });
    blocks.push(`🏆 ${competition}\n${lines.join('\n\n')}`);
  }

  return blocks.join('\n\n');
}

export async function getMatchesByDay(group: MatchGroup, day: MatchDay): Promise<GameDTO[]> {
  const date = dayToDate(day);

  const cached = await getCache(group, date);
  if (cached) return sortByKickoff(cached);

  const competitions = await getEnabledCompetitions(group);
  if (competitions.length === 0) return [];

  const all: GameDTO[] = [];
  try {
    for (const competition of competitions) {
      const matches = await getCompetitionMatches(competition.competition_id, date, date);
      const normalized = matches.map((m) => normalizeGame(group, competition.display_name, m));
      all.push(...normalized.filter((game) => isGameInBrtDate(game, date)));
    }

    const sorted = sortByKickoff(all);
    await saveCache(group, date, sorted, day);
    return sorted;
  } catch (err: any) {
    if (err?.code === 429) {
      const stale = await getStaleCache(group, date);
      if (stale && stale.length) return sortByKickoff(stale);
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
