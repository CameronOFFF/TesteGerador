import { env } from '../config/env.js';

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const base = (env.footballDataBaseUrl ?? 'https://api.football-data.org/v4').replace(/\/$/, '');
  const url = new URL(`${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && `${value}` !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function footballDataRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!env.footballDataToken) {
    throw new Error('FOOTBALL_DATA_TOKEN não configurado');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(buildUrl(path, options.query), {
      headers: {
        'X-Auth-Token': env.footballDataToken,
        Accept: 'application/json'
      },
      signal: controller.signal
    });

    if (res.status === 429) {
      const err = new Error('football-data rate limit (429)');
      (err as any).code = 429;
      throw err;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`football-data request failed (${res.status}): ${body}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
