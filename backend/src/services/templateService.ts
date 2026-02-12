import fs from 'fs/promises';

export async function loadTemplate(path: string) {
  const raw = await fs.readFile(path, 'utf-8');
  return JSON.parse(raw);
}
