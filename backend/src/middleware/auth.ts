import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtUser } from '../types/index.js';
import { query } from '../db/pool.js';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtUser;
      tenant?: any;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token ausente' });

  try {
    req.auth = jwt.verify(token, env.jwtSecret) as JwtUser;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

export async function requireActiveTenant(req: Request, res: Response, next: NextFunction) {
  const auth = req.auth;
  if (!auth) return res.status(401).json({ message: 'Não autenticado' });

  const [tenant] = await query<any>('SELECT * FROM tenants WHERE id = ?', [auth.tenantId]);
  if (!tenant) return res.status(404).json({ message: 'Tenant não encontrado' });

  const now = new Date();
  if (new Date(tenant.vencimento_em) < now) {
    return res.status(402).json({ message: 'Assinatura vencida', expired: true });
  }

  req.tenant = tenant;
  next();
}
