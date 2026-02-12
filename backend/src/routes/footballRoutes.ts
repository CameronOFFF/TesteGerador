import { Router } from 'express';
import { requireActiveTenant, requireAuth } from '../middleware/auth.js';
import { buildGuideText, getLiveMatches, getMatchesByDay } from '../modules/football/football.service.js';
import { listCompetitions } from '../providers/footballDataProvider.js';
import { MatchGroup } from '../modules/football/types.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth, requireActiveTenant);

function parseGroup(input: unknown): MatchGroup {
  return input === 'INT' ? 'INT' : 'BR';
}

function mapFootballError(err: any) {
  const msg = String(err?.message ?? err ?? 'Erro desconhecido');
  if (msg.includes('FOOTBALL_DATA_TOKEN')) {
    return { status: 503, message: 'Provider de futebol não configurado (FOOTBALL_DATA_TOKEN).' };
  }
  if (err?.code === 429 || msg.includes('429')) {
    return { status: 429, message: 'Limite de requisições do provider atingido. Tente novamente em instantes.' };
  }
  return { status: 500, message: 'Falha ao carregar dados de futebol.' };
}

router.get('/competitions', asyncHandler(async (_req, res) => {
  try {
    const competitions = await listCompetitions();
    res.json(competitions);
  } catch (err: any) {
    const mapped = mapFootballError(err);
    res.status(mapped.status).json({ message: mapped.message });
  }
}));

router.get('/today', asyncHandler(async (req, res) => {
  const group = parseGroup(req.query.group);
  try {
    const games = await getMatchesByDay(group, 'today');
    res.json({ group, day: 'today', games, guideText: buildGuideText(games) });
  } catch (err: any) {
    const mapped = mapFootballError(err);
    res.status(mapped.status).json({ message: mapped.message, games: [], guideText: '' });
  }
}));

router.get('/tomorrow', asyncHandler(async (req, res) => {
  const group = parseGroup(req.query.group);
  try {
    const games = await getMatchesByDay(group, 'tomorrow');
    res.json({ group, day: 'tomorrow', games, guideText: buildGuideText(games) });
  } catch (err: any) {
    const mapped = mapFootballError(err);
    res.status(mapped.status).json({ message: mapped.message, games: [], guideText: '' });
  }
}));

router.get('/live', asyncHandler(async (req, res) => {
  const group = parseGroup(req.query.group);
  try {
    const games = await getLiveMatches(group);
    res.json({ group, day: 'today', games, guideText: buildGuideText(games) });
  } catch (err: any) {
    const mapped = mapFootballError(err);
    res.status(mapped.status).json({ message: mapped.message, games: [], guideText: '' });
  }
}));

export default router;
