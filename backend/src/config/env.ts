import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTtlDays: Number(process.env.JWT_REFRESH_DAYS ?? 30),
  mysqlUrl: process.env.MYSQL_URL ?? 'mysql://root:root@localhost:3306/geradorpro',
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  generatedDir: process.env.GENERATED_DIR ?? 'generated',
  ffmpegPath: process.env.FFMPEG_PATH ?? 'ffmpeg'
};
