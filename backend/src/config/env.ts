import dotenv from 'dotenv';

dotenv.config();

function normalizeEmpty(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

const mysqlHost = process.env.MYSQL_HOST ?? '127.0.0.1';
const mysqlPort = Number(process.env.MYSQL_PORT ?? 3306);
const mysqlUser = process.env.MYSQL_USER ?? 'root';
const mysqlPassword = process.env.MYSQL_PASSWORD ?? '';
const mysqlDatabase = process.env.MYSQL_DATABASE ?? 'geradorpro';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTtlDays: Number(process.env.JWT_REFRESH_DAYS ?? 30),
  mysqlUrl: normalizeEmpty(process.env.MYSQL_URL),
  mysqlHost,
  mysqlPort,
  mysqlUser,
  mysqlPassword,
  mysqlDatabase,
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  generatedDir: process.env.GENERATED_DIR ?? 'generated',
  ffmpegPath: process.env.FFMPEG_PATH ?? 'ffmpeg'
};
