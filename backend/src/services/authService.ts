import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
type JwtExpires = jwt.SignOptions['expiresIn'];
import { env } from '../config/env.js';
import { query } from '../db/pool.js';

export async function login(email: string, password: string) {
  const [user] = await query<any>('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return null;

  const bcryptOk = await bcrypt.compare(password, user.senha_hash).catch(() => false);
  const plainTextOk = user.senha_hash === password;
  const demoFallbackOk =
    email === env.demoAdminEmail &&
    password === env.demoAdminPassword &&
    user.email === env.demoAdminEmail;

  if (!bcryptOk && !plainTextOk && !demoFallbackOk) return null;

  if (plainTextOk) {
    const hashed = await bcrypt.hash(password, 10);
    await query('UPDATE users SET senha_hash = ? WHERE id = ?', [hashed, user.id]);
    user.senha_hash = hashed;
  }

  const accessToken = jwt.sign({ userId: user.id, tenantId: user.tenant_id, role: user.role }, env.jwtSecret, {
    expiresIn: env.accessTtl as JwtExpires
  });

  const refreshToken = jwt.sign({ userId: user.id, tenantId: user.tenant_id, role: user.role }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTtlDays}d`
  });

  const expiresAt = new Date(Date.now() + env.refreshTtlDays * 24 * 60 * 60 * 1000);
  await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);

  return { user, accessToken, refreshToken };
}
