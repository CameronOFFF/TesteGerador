export type JwtUser = {
  userId: number;
  tenantId: number;
  role: 'admin' | 'cliente';
};

export type ProviderEvent = {
  league: string;
  eventDate: string;
  startTime: string;
  home: string;
  away: string;
  whereToWatch: string[];
  country: string;
  notes?: string;
};
