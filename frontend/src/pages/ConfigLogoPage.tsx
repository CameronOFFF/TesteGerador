import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function ConfigLogoPage() {
  const [file, setFile] = useState<File>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { tenant, refresh } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    alert('Uso exclusivo da sua marca. Tentativas de universalizar podem levar a exclusão.');
  }, []);

  async function upload() {
    if (!file) {
      setError('Selecione um arquivo PNG antes de enviar.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('logo', file);
      await api.post('/tenant/logo', form);
      await refresh();
      nav('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao enviar logo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card max-w-xl space-y-3">
      <h3>Logo Atual / Upload PNG</h3>
      {tenant?.logo_url && <p className="text-slate-400 text-sm">Logo atual: {tenant.logo_url}</p>}
      <input
        id="tenant-logo"
        name="tenant-logo"
        type="file"
        accept="image/png"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      <p className="text-slate-400">Você tem 2 trocas por dia.</p>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button disabled={saving} onClick={upload} className="bg-indigo-600 px-3 py-2 rounded disabled:opacity-60">
        {saving ? 'Enviando...' : 'Enviar logo'}
      </button>
    </div>
  );
}
