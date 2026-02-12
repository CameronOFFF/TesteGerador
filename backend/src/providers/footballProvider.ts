import { makeEvents } from './mockData.js';
export async function getFootballEvents(day: 'today' | 'tomorrow') {
  const events = makeEvents('Brasileirão', 'Flamengo', 'Palmeiras');
  return events.map((e) => ({ ...e, notes: `day=${day}` }));
}
