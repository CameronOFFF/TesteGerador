import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CopyToClipboardButton } from '../components/CopyToClipboardButton';
import { WhatsAppSendButton } from '../components/WhatsAppSendButton';

export function GuideFootballPage() {
  const [tab, setTab] = useState<'today' | 'tomorrow'>('today');
  const [group, setGroup] = useState<'BR' | 'INT'>('BR');
  const [text, setText] = useState('');

  useEffect(() => {
    api.get(`/football/${tab}?group=${group}`).then(({ data }) => {
      setText(data.guideText || 'Sem jogos para este filtro.');
    });
  }, [tab, group]);

  return (
    <div className="card">
      <h3>GERADOR DE JOGOS</h3>
      <div className="space-x-2 my-2">
        <button className="bg-slate-700 px-2" onClick={() => setTab('today')}>Jogos de Hoje</button>
        <button className="bg-slate-700 px-2" onClick={() => setTab('tomorrow')}>Jogos de Amanhã</button>
      </div>
      <div className="space-x-2 my-2">
        <button className="bg-indigo-700 px-2" onClick={() => setGroup('BR')}>Nacionais (BR)</button>
        <button className="bg-slate-700 px-2" onClick={() => setGroup('INT')}>Internacionais (INT)</button>
      </div>
      <textarea className="w-full h-80 bg-slate-900 p-3 rounded" value={text} readOnly />
      <div className="mt-3 flex gap-2">
        <CopyToClipboardButton text={text} />
        <WhatsAppSendButton text={text} />
      </div>
    </div>
  );
}
