import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireActiveTenant, requireAuth } from '../middleware/auth.js';
import { renderBanner } from '../services/renderService.js';
import { createJob } from '../services/jobService.js';
import { query } from '../db/pool.js';

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });
router.use(requireAuth, requireActiveTenant, limiter);

async function saveSearch(tenantId: number, type: string, q: string) {
  await query('INSERT INTO searches (tenant_id, type, query) VALUES (?, ?, ?)', [tenantId, type, q]);
}

router.post('/banner/:category', async (req, res) => {
  const { category } = req.params;
  const title = req.body.title ?? `Banner ${category.toUpperCase()}`;
  const subtitle = req.body.shortText ?? req.tenant.texto_curto_padrao ?? req.tenant.whatsapp_texto_padrao ?? '';
  const path = await renderBanner(`${category}-${Date.now()}`, title, subtitle, req.tenant.logo_url);
  if (category === 'movie' || category === 'series') await saveSearch(req.auth!.tenantId, category, req.body.title ?? '');
  res.json({ resultUrl: path, message: `Confira: ${title}` });
});

router.post('/video/:category', async (req, res) => {
  const id = await createJob(req.auth!.tenantId, `video-${req.params.category}`, req.body);
  if (req.body.title && (req.params.category === 'movie' || req.params.category === 'series')) {
    await saveSearch(req.auth!.tenantId, req.params.category, req.body.title);
  }
  res.status(202).json({ jobId: id });
});

export default router;
