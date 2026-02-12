import { Router } from 'express';
import { requireActiveTenant, requireAuth } from '../middleware/auth.js';
import { buildGuideText, getLiveMatches, getMatchesByDay } from '../modules/football/football.service.js';
import { listCompetitions } from '../providers/footballDataProvider.js';
import { MatchGroup } from '../modules/football/types.js';

const router = Router();
router.use(requireAuth, requireActiveTenant);

function parseGroup(input: unknown): MatchGroup {
  return input === 'INT' ? 'INT' : 'BR';
}

router.get('/competitions', async (_req, res) => {
  const competitions = await listCompetitions();
  res.json(competitions);
});

router.get('/today', async (req, res) => {
  const group = parseGroup(req.query.group);
  const games = await getMatchesByDay(group, 'today');
  res.json({ group, day: 'today', games, guideText: buildGuideText(games) });
});

router.get('/tomorrow', async (req, res) => {
  const group = parseGroup(req.query.group);
  const games = await getMatchesByDay(group, 'tomorrow');
  res.json({ group, day: 'tomorrow', games, guideText: buildGuideText(games) });
});

router.get('/live', async (req, res) => {
  const group = parseGroup(req.query.group);
  const games = await getLiveMatches(group);
  res.json({ group, day: 'today', games, guideText: buildGuideText(games) });
});

export default router;
