import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import footballRoutes from './routes/footballRoutes.js';
import { query } from './db/pool.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/analytics/top-searches', async (req, res) => {
  const tenantId = Number(req.query.tenantId ?? 1);
  const rows = await query<any>(
    `SELECT query, COUNT(*) as total FROM searches WHERE tenant_id = ? AND type IN ('movie','series')
     GROUP BY query ORDER BY total DESC LIMIT 5`,
    [tenantId]
  );
  res.json(rows);
});

app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/football', footballRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/jobs', jobRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API error:', err?.message || err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

export default app;
