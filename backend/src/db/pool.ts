import mysql, { PoolOptions } from 'mysql2/promise';
import { env } from '../config/env.js';

const poolConfig: string | PoolOptions = env.mysqlUrl
  ? env.mysqlUrl
  : {
      host: env.mysqlHost,
      port: env.mysqlPort,
      user: env.mysqlUser,
      password: env.mysqlPassword,
      database: env.mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

export const pool = mysql.createPool(poolConfig);

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}
