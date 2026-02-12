import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../db/pool.js';

const router = Router();
router.use(requireAuth);

router.get('/:id', async (req, res) => {
  const [job] = await query<any>('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, req.auth!.tenantId]);
  if (!job) return res.status(404).json({ message: 'Job não encontrado' });
  res.json(job);
});

router.get('/', async (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  const jobs = await query<any>('SELECT * FROM jobs WHERE tenant_id = ? ORDER BY id DESC LIMIT ?', [req.auth!.tenantId, limit]);
  res.json(jobs);
});

export default router;
