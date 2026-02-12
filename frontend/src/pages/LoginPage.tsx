import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const nav = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    nav('/dashboard');
  }
  return <div className="min-h-screen grid place-items-center bg-slate-950"><form onSubmit={submit} className="card w-80 space-y-3"><h1 className="text-xl">Entrar</h1><input className="w-full bg-slate-800 p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} /><input type="password" className="w-full bg-slate-800 p-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} /><button className="bg-indigo-600 rounded px-3 py-2">Login</button></form></div>;
}
