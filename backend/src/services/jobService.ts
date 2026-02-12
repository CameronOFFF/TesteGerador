import { query } from '../db/pool.js';

export async function createJob(tenantId: number, type: string, payload: unknown) {
  await query('INSERT INTO jobs (tenant_id, type, payload_json, status, progress) VALUES (?, ?, ?, "pending", 0)', [tenantId, type, JSON.stringify(payload)]);
  const [row] = await query<any>('SELECT LAST_INSERT_ID() as id');
  return row.id as number;
}
