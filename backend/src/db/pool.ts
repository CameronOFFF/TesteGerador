import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool(env.mysqlUrl);

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}
