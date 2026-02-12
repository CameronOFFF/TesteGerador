import { makeEvents } from './mockData.js';
export async function getUfcEvents() {
  return makeEvents('UFC', 'Main Event Fighter', 'Challenger').map((e, idx) => ({ ...e, notes: idx === 0 ? 'Main Event' : 'Co-main' }));
}
