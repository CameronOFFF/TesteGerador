import { createCanvas, loadImage } from '@napi-rs/canvas';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';

export async function renderBanner(outputName: string, title: string, subtitle: string, logoPath?: string) {
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0B1020';
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = '#8B5CF6';
  ctx.fillRect(0, 0, 1080, 220);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 72px Sans';
  ctx.fillText(title.slice(0, 24), 80, 150);
  ctx.font = '46px Sans';
  ctx.fillText(subtitle.slice(0, 40), 80, 300);

  if (logoPath) {
    try {
      const logo = await loadImage(logoPath);
      ctx.drawImage(logo as any, 760, 1600, 240, 240);
    } catch {
      // skip logo
    }
  }

  const dir = path.join(env.generatedDir, 'banners');
  await fs.mkdir(dir, { recursive: true });
  const output = path.join(dir, `${outputName}.png`);
  const png = canvas.toBuffer('image/png');
  await sharp(png).png({ quality: 90 }).toFile(output);
  return output;
}
