import { ProviderEvent } from '../types/index.js';

export function makeEvents(league: string, homeA: string, awayA: string): ProviderEvent[] {
  return [
    {
      league,
      eventDate: new Date().toISOString().slice(0, 10),
      startTime: '19:00',
      home: homeA,
      away: awayA,
      whereToWatch: ['ESPN', 'Star+'],
      country: 'BR',
      notes: 'Fonte legal: grade oficial da emissora'
    },
    {
      league,
      eventDate: new Date().toISOString().slice(0, 10),
      startTime: '21:30',
      home: `${homeA} B`,
      away: `${awayA} B`,
      whereToWatch: ['SporTV', 'Globoplay'],
      country: 'BR'
    }
  ];
}
