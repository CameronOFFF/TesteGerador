import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireActiveTenant, requireAuth } from '../middleware/auth.js';
import { renderBanner, renderFootballBanner } from '../services/renderService.js';
import { createJob } from '../services/jobService.js';
import { query } from '../db/pool.js';
import { getMatchesByDay } from '../modules/football/football.service.js';
import { MatchGroup } from '../modules/football/types.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });
router.use(requireAuth, requireActiveTenant, limiter);

async function saveSearch(tenantId: number, type: string, q: string) {
  await query('INSERT INTO searches (tenant_id, type, query) VALUES (?, ?, ?)', [tenantId, type, q]);
}

router.post('/banner/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (category === 'football') {
    const day = req.body.day === 'tomorrow' ? 'tomorrow' : 'today';
    const group: MatchGroup = req.body.group === 'INT' ? 'INT' : 'BR';

    try {
      const games = await getMatchesByDay(group, day);
      const title = req.body.title ?? (day === 'today' ? 'JOGOS DE HOJE' : 'JOGOS DE AMANHÃ');
      const output = await renderFootballBanner({
        outputName: `${category}-${Date.now()}`,
        title,
        games,
        logoPath: req.tenant.logo_url,
        contactText: req.body.contactText ?? req.body.shortText,
        modelId: req.body.templateId ?? req.body.modelId
      });

      return res.json({ resultUrl: output, message: `Banner de futebol gerado (${day}/${group})`, totalGames: games.length });
    } catch (err: any) {
      const msg = String(err?.message ?? err ?? 'Erro desconhecido');
      if (msg.includes('FOOTBALL_DATA_TOKEN')) {
        return res.status(503).json({ message: 'Provider de futebol não configurado. Defina FOOTBALL_DATA_TOKEN no backend/.env.' });
      }
      return res.status(500).json({ message: 'Falha ao gerar banner de futebol. Tente novamente em instantes.' });
    }
  }

  const title = req.body.title ?? `Banner ${category.toUpperCase()}`;
  const subtitle = req.body.shortText ?? req.tenant.texto_curto_padrao ?? req.tenant.whatsapp_texto_padrao ?? '';
  const output = await renderBanner(`${category}-${Date.now()}`, title, subtitle, req.tenant.logo_url);
  if (category === 'movie' || category === 'series') await saveSearch(req.auth!.tenantId, category, req.body.title ?? '');
  res.json({ resultUrl: output, message: `Confira: ${title}` });
}));

router.post('/video/:category', asyncHandler(async (req, res) => {
  const id = await createJob(req.auth!.tenantId, `video-${req.params.category}`, req.body);
  if (req.body.title && (req.params.category === 'movie' || req.params.category === 'series')) {
    await saveSearch(req.auth!.tenantId, req.params.category, req.body.title);
  }
  res.status(202).json({ jobId: id });
}));

export default router;
