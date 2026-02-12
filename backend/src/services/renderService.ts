import { createCanvas, loadImage } from '@napi-rs/canvas';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';
import { GameDTO } from '../modules/football/types.js';

function sanitizeText(input: string | undefined, max = 48) {
  return (input ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function normalizePhoneCandidate(input: string | undefined) {
  const raw = (input ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  const valid = digits.length >= 10 && digits.length <= 13;
  return { raw, digits, valid };
}

function drawWhatsappIcon(ctx: any, x: number, y: number, size: number) {
  ctx.fillStyle = '#25D366';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Sans`;
  ctx.fillText('W', x + size * 0.28, y + size * 0.7);
}

async function exportCanvasPng(canvas: any, outputName: string) {
  const dir = path.join(env.generatedDir, 'banners');
  await fs.mkdir(dir, { recursive: true });
  const output = path.join(dir, `${outputName}.png`);
  const png = canvas.toBuffer('image/png');
  await sharp(png).png({ quality: 92 }).toFile(output);
  return output;
}

async function drawLogo(ctx: any, logoPath: string | undefined, x: number, y: number, w: number, h: number) {
  if (!logoPath) return;
  try {
    const logo = await loadImage(logoPath);
    ctx.drawImage(logo as any, x, y, w, h);
  } catch {
    // skip logo draw
  }
}

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

  await drawLogo(ctx, logoPath, 760, 1600, 240, 240);

  return exportCanvasPng(canvas, outputName);
}

export async function renderFootballBanner(params: {
  outputName: string;
  title: string;
  games: GameDTO[];
  logoPath?: string;
  contactText?: string;
  modelId?: string;
}) {
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');

  const title = sanitizeText(params.title, 30) || 'JOGOS DO DIA';
  const model = params.modelId ?? 'Modelo 1';
  const contact = sanitizeText(params.contactText, 32);
  const phone = normalizePhoneCandidate(contact);

  // background theme
  ctx.fillStyle = '#2d0b53';
  ctx.fillRect(0, 0, 1080, 1920);
  const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
  grad.addColorStop(0, 'rgba(127, 29, 224, 0.7)');
  grad.addColorStop(1, 'rgba(17, 24, 39, 0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 92px Sans';
  ctx.fillText('JOGOS', 80, 150);
  ctx.font = 'bold 48px Sans';
  ctx.fillText(title, 80, 210);
  ctx.font = '30px Sans';
  ctx.fillStyle = '#d8b4fe';
  ctx.fillText(model, 80, 250);

  // right image area placeholder (onde ficaria jogador)
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(600, 260, 420, 1180);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = 'bold 34px Sans';
  ctx.fillText('ÁREA DA IMAGEM', 650, 850);

  // event list
  const games = params.games.slice(0, 7);
  let y = 340;
  for (const game of games) {
    const lineLeague = sanitizeText(game.competition.name, 26);
    const lineMatch = `${sanitizeText(game.home.name, 14)} x ${sanitizeText(game.away.name, 14)}`;
    const hhmm = game.kickoffBRT.split(' ')[1] ?? '--:--';
    const maybeScore = game.status === 'LIVE' || game.status === 'FINISHED' ? ` ${game.score?.home ?? '-'}-${game.score?.away ?? '-'}` : '';
    const lineTime = `${hhmm}${maybeScore}`;

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(70, y, 520, 56);
    ctx.fillStyle = '#2d0b53';
    ctx.font = 'bold 26px Sans';
    ctx.fillText(lineMatch, 90, y + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Sans';
    ctx.fillText(lineLeague, 72, y - 8);

    ctx.fillStyle = '#d8b4fe';
    ctx.font = 'bold 24px Sans';
    ctx.fillText(lineTime, 72, y + 88);

    y += 150;
  }

  // logo obrigatória canto superior direito
  await drawLogo(ctx, params.logoPath, 900, 28, 150, 150);

  // logo central inferior (embaixo da imagem)
  await drawLogo(ctx, params.logoPath, 460, 1460, 170, 170);

  // contato: ícone do whatsapp só para número válido
  if (contact) {
    const baseY = 1710;
    if (phone.valid) {
      drawWhatsappIcon(ctx, 220, baseY - 45, 52);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Sans';
      ctx.fillText(phone.raw, 285, baseY);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Sans';
      ctx.fillText(contact, 220, baseY);
    }
  }

  return exportCanvasPng(canvas, params.outputName);
}
