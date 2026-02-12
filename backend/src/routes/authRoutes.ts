import { Router } from 'express';
import jwt from 'jsonwebtoken';
type JwtExpires = jwt.SignOptions['expiresIn'];
import { z } from 'zod';
import { login } from '../services/authService.js';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(4) }).safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());
  const session = await login(body.data.email, body.data.password);
  if (!session) return res.status(401).json({ message: 'Credenciais inválidas' });
  res.json({ accessToken: session.accessToken, refreshToken: session.refreshToken });
});

router.post('/refresh', async (req, res) => {
  const token = req.body.refreshToken;
  if (!token) return res.status(400).json({ message: 'Refresh token ausente' });
  const [stored] = await query<any>('SELECT * FROM refresh_tokens WHERE token = ? AND revoked_at IS NULL AND expires_at > NOW()', [token]);
  if (!stored) return res.status(401).json({ message: 'Refresh inválido' });
  const payload = jwt.verify(token, env.jwtRefreshSecret) as any;
  const accessToken = jwt.sign({ userId: payload.userId, tenantId: payload.tenantId, role: payload.role }, env.jwtSecret, {
    expiresIn: env.accessTtl as JwtExpires
  });
  res.json({ accessToken });
});

router.post('/logout', async (req, res) => {
  if (req.body.refreshToken) {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?', [req.body.refreshToken]);
  }
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const [user] = await query<any>('SELECT id, email, role, tenant_id FROM users WHERE id = ?', [req.auth!.userId]);
  const [tenant] = await query<any>('SELECT * FROM tenants WHERE id = ?', [req.auth!.tenantId]);
  res.json({ user, tenant });
});

export default router;
