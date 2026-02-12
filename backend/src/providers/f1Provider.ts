import { makeEvents } from './mockData.js';
export async function getF1Events() {
  return makeEvents('F1', 'GP do Brasil', 'Interlagos').map((e) => ({ ...e, away: 'Corrida' }));
}
