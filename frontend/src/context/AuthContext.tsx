import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

type AuthState = { user?: any; tenant?: any; loading: boolean; refresh: () => Promise<void> };
const Ctx = createContext<AuthState>({ loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ loading: true, refresh });

  async function refresh() {
    try {
      const { data } = await api.get('/auth/me');
      setState({ user: data.user, tenant: data.tenant, loading: false, refresh });
    } catch {
      setState({ loading: false, refresh });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
