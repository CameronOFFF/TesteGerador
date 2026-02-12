import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

type AuthState = {
  user?: any;
  tenant?: any;
  loading: boolean;
  refresh: () => Promise<{ user?: any; tenant?: any }>;
};

const Ctx = createContext<AuthState>({
  loading: true,
  refresh: async () => ({})
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, 'refresh'>>({ loading: true });

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setState({ user: data.user, tenant: data.tenant, loading: false });
      return { user: data.user, tenant: data.tenant };
    } catch {
      setState({ loading: false });
      return {};
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
