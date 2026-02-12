import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';

export async function login(email: string, password: string) {
  const [user] = await query<any>('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.senha_hash);
  if (!ok) return null;

  const accessToken = jwt.sign({ userId: user.id, tenantId: user.tenant_id, role: user.role }, env.jwtSecret, {
    expiresIn: env.accessTtl
  });

  const refreshToken = jwt.sign({ userId: user.id, tenantId: user.tenant_id, role: user.role }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTtlDays}d`
  });

  const expiresAt = new Date(Date.now() + env.refreshTtlDays * 24 * 60 * 60 * 1000);
  await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);

  return { user, accessToken, refreshToken };
}
