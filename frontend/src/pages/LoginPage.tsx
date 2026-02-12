import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);

      const me = await api.get('/auth/me');
      const hasLogo = Boolean(me?.data?.tenant?.logo_url);
      nav(hasLogo ? '/dashboard' : '/config/logo');
    } catch (err: any) {
      if (err?.code === 'ERR_NETWORK') {
        setError('Servidor backend indisponível. Inicie o backend em http://localhost:4000.');
      } else {
        const message = err?.response?.data?.message ?? 'Falha no login. Verifique email e senha.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950">
      <form onSubmit={submit} className="card w-80 space-y-3">
        <h1 className="text-xl">Entrar</h1>
        <input className="w-full bg-slate-800 p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          className="w-full bg-slate-800 p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="bg-indigo-600 rounded px-3 py-2 disabled:opacity-60">
          {loading ? 'Entrando...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
