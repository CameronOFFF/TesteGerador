import { query } from '../db/pool.js';
import { renderVideo } from '../services/videoService.js';

async function tick() {
  const [job] = await query<any>('SELECT * FROM jobs WHERE status = "pending" ORDER BY id ASC LIMIT 1');
  if (!job) return;

  try {
    await query('UPDATE jobs SET status = "processing", progress = 10 WHERE id = ?', [job.id]);
    const payload = JSON.parse(job.payload_json || '{}');
    const title = payload.title ?? payload.templateId ?? 'Vídeo GERADORPRO';
    await query('UPDATE jobs SET progress = 60 WHERE id = ?', [job.id]);
    const out = await renderVideo(job.id, title);
    await query('UPDATE jobs SET status = "done", progress = 100, result_url = ?, updated_at = NOW() WHERE id = ?', [out, job.id]);
  } catch (err: any) {
    await query('UPDATE jobs SET status = "failed", error = ?, updated_at = NOW() WHERE id = ?', [String(err.message || err), job.id]);
  }
}

setInterval(() => {
  tick().catch((err) => console.error('worker error', err));
}, 3000);

console.log('Worker iniciado');
