import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function LogoutPage() {
  const nav = useNavigate();

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    api.post('/auth/logout', { refreshToken }).catch(() => undefined).finally(() => {
      localStorage.clear();
      nav('/login', { replace: true });
    });
  }, [nav]);

  return null;
}
