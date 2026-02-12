import { query } from '../db/pool.js';
import { renderVideo } from '../services/videoService.js';

let dbUnavailableLogged = false;

function isDbConnectionError(error: any) {
  return ['ER_ACCESS_DENIED_ERROR', 'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST'].includes(error?.code);
}

async function tick() {
  let job: any;

  try {
    [job] = await query<any>('SELECT * FROM jobs WHERE status = "pending" ORDER BY id ASC LIMIT 1');
    if (dbUnavailableLogged) {
      console.log('Worker: conexão com MySQL restabelecida.');
      dbUnavailableLogged = false;
    }
  } catch (err: any) {
    if (isDbConnectionError(err)) {
      if (!dbUnavailableLogged) {
        console.error(
          'Worker: não foi possível conectar no MySQL. Verifique MYSQL_URL ou MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD no .env. Erro:',
          err.message
        );
        dbUnavailableLogged = true;
      }
      return;
    }

    throw err;
  }

  if (!job) return;

  try {
    await query('UPDATE jobs SET status = "processing", progress = 10 WHERE id = ?', [job.id]);
    const payload = JSON.parse(job.payload_json || '{}');
    const title = payload.title ?? payload.templateId ?? 'Vídeo GERADORPRO';
    await query('UPDATE jobs SET progress = 60 WHERE id = ?', [job.id]);
    const out = await renderVideo(job.id, title);
    await query('UPDATE jobs SET status = "done", progress = 100, result_url = ?, updated_at = NOW() WHERE id = ?', [out, job.id]);
  } catch (err: any) {
    try {
      await query('UPDATE jobs SET status = "failed", error = ?, updated_at = NOW() WHERE id = ?', [String(err.message || err), job.id]);
    } catch {
      console.error('Worker: falha ao atualizar erro do job no banco.');
    }
  }
}

setInterval(() => {
  tick().catch((err) => console.error('worker error', err));
}, 3000);

console.log('Worker iniciado');
