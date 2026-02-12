import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { env } from '../config/env.js';

const router = Router();
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } });

router.use(requireAuth);

router.get('/', async (req, res) => {
  const [tenant] = await query<any>('SELECT * FROM tenants WHERE id = ?', [req.auth!.tenantId]);
  res.json(tenant);
});

router.put('/whatsapp', async (req, res) => {
  const { whatsappPadrao, textoCurtoPadrao } = req.body;
  if ((textoCurtoPadrao ?? '').length > 13) return res.status(400).json({ message: 'Texto curto máximo 13 caracteres' });
  await query('UPDATE tenants SET whatsapp_texto_padrao = ?, texto_curto_padrao = ? WHERE id = ?', [whatsappPadrao, textoCurtoPadrao, req.auth!.tenantId]);
  res.json({ ok: true });
});

router.put('/links', async (req, res) => {
  const { suporteWhatsappUrl, telegramUrl } = req.body;
  await query('UPDATE tenants SET suporte_whatsapp_url = ?, canal_telegram_url = ? WHERE id = ?', [suporteWhatsappUrl, telegramUrl, req.auth!.tenantId]);
  res.json({ ok: true });
});

router.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Arquivo obrigatório' });
  if (req.file.mimetype !== 'image/png') return res.status(400).json({ message: 'Apenas PNG' });
  const tenantId = req.auth!.tenantId;
  const today = new Date().toISOString().slice(0, 10);

  const [row] = await query<any>('SELECT * FROM logo_changes WHERE tenant_id = ? AND change_date = ?', [tenantId, today]);
  const [tenant] = await query<any>('SELECT limite_troca_logo_dia FROM tenants WHERE id = ?', [tenantId]);
  const limit = tenant?.limite_troca_logo_dia ?? 2;
  const current = row?.change_count ?? 0;
  if (current >= limit) return res.status(429).json({ message: `Limite diário de ${limit} trocas atingido` });

  await fs.mkdir(env.uploadsDir, { recursive: true });
  const filename = `tenant-${tenantId}-${Date.now()}.png`;
  const filePath = path.join(env.uploadsDir, filename);
  await fs.writeFile(filePath, req.file.buffer);

  await query('UPDATE tenants SET logo_url = ? WHERE id = ?', [filePath, tenantId]);
  await query(
    `INSERT INTO logo_changes (tenant_id, change_date, change_count)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE change_count = change_count + 1`,
    [tenantId, today]
  );

  res.json({ ok: true, logoUrl: filePath });
});

export default router;
