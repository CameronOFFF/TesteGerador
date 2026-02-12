import { query } from '../db/pool.js';

export async function getCached<T>(sport: string, dateKey: string): Promise<T | null> {
  const [row] = await query<any>('SELECT * FROM cached_events WHERE sport = ? AND date_key = ? AND expires_at > NOW()', [sport, dateKey]);
  return row ? (JSON.parse(row.data_json) as T) : null;
}

export async function setCached(sport: string, dateKey: string, payload: unknown, minutes = 30) {
  await query(
    `INSERT INTO cached_events (sport, date_key, data_json, fetched_at, expires_at)
     VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))
     ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), fetched_at = NOW(), expires_at = VALUES(expires_at)`,
    [sport, dateKey, JSON.stringify(payload), minutes]
  );
}
