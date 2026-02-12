import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CopyToClipboardButton } from '../components/CopyToClipboardButton';
import { WhatsAppSendButton } from '../components/WhatsAppSendButton';

export function GuideFootballPage() {
  const [tab, setTab] = useState<'today' | 'tomorrow'>('today');
  const [group, setGroup] = useState<'BR' | 'INT'>('BR');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api
      .get(`/football/${tab}?group=${group}`)
      .then(({ data }) => {
        setText(data.guideText || 'Sem jogos para este filtro.');
      })
      .catch((err) => {
        if (err?.code === 'ERR_NETWORK') {
          setError('Servidor backend indisponível. Inicie o backend na porta 4000.');
        } else {
          setError(err?.response?.data?.message ?? 'Falha ao carregar guia de jogos.');
        }
        setText('');
      });
  }, [tab, group]);

  return (
    <div className="card">
      <h3>GERADOR DE JOGOS</h3>
      <div className="space-x-2 my-2">
        <button className={`px-2 ${tab === 'today' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setTab('today')}>Jogos de Hoje</button>
        <button className={`px-2 ${tab === 'tomorrow' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setTab('tomorrow')}>Jogos de Amanhã</button>
      </div>
      <div className="space-x-2 my-2">
        <button className={`px-2 ${group === 'BR' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setGroup('BR')}>Nacionais (BR)</button>
        <button className={`px-2 ${group === 'INT' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setGroup('INT')}>Internacionais (INT)</button>
      </div>

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <textarea className="w-full h-80 bg-slate-900 p-3 rounded" value={text} readOnly />
      <div className="mt-3 flex gap-2">
        <CopyToClipboardButton text={text} />
        <WhatsAppSendButton text={text} />
      </div>
    </div>
  );
}
