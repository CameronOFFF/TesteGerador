import { makeEvents } from './mockData.js';
export async function getNbaEvents(day: 'today' | 'tomorrow') {
  return makeEvents('NBA', 'Lakers', 'Celtics').map((e) => ({ ...e, notes: `day=${day}` }));
}
