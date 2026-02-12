import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { renderBanner } from './renderService.js';
import { env } from '../config/env.js';

const execAsync = promisify(execFile);

export async function renderVideo(jobId: number, title: string, logoPath?: string) {
  const frame = await renderBanner(`job-${jobId}-frame`, title, 'Gerado por GERADORPRO', logoPath);
  const videosDir = path.join(env.generatedDir, 'videos');
  await fs.mkdir(videosDir, { recursive: true });
  const out = path.join(videosDir, `${jobId}.mp4`);

  await execAsync(env.ffmpegPath, [
    '-y',
    '-loop', '1',
    '-i', frame,
    '-t', '6',
    '-vf', 'scale=1080:1920,format=yuv420p',
    '-pix_fmt', 'yuv420p',
    out
  ]);

  return out;
}
