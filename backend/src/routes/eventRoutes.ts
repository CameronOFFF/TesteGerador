import { Router } from 'express';
import { requireActiveTenant, requireAuth } from '../middleware/auth.js';
import { getFootballEvents } from '../providers/footballProvider.js';
import { getNbaEvents } from '../providers/nbaProvider.js';
import { getUfcEvents } from '../providers/ufcProvider.js';
import { getF1Events } from '../providers/f1Provider.js';
import { getCached, setCached } from '../services/cacheService.js';

const router = Router();
router.use(requireAuth, requireActiveTenant);

async function fromCacheOr<T>(sport: string, key: string, fn: () => Promise<T>) {
  const cached = await getCached<T>(sport, key);
  if (cached) return cached;
  const fresh = await fn();
  await setCached(sport, key, fresh);
  return fresh;
}

router.get('/football', async (req, res) => {
  const day = (req.query.day as 'today' | 'tomorrow') || 'today';
  res.json(await fromCacheOr('football', day, () => getFootballEvents(day)));
});

router.get('/nba', async (req, res) => {
  const day = (req.query.day as 'today' | 'tomorrow') || 'today';
  res.json(await fromCacheOr('nba', day, () => getNbaEvents(day)));
});

router.get('/ufc', async (_req, res) => {
  res.json(await fromCacheOr('ufc', 'upcoming', () => getUfcEvents()));
});

router.get('/f1', async (_req, res) => {
  res.json(await fromCacheOr('f1', 'next', () => getF1Events()));
});

export default router;
