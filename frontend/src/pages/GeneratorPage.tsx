import { useState } from 'react';
import { api } from '../api/client';
import { TemplateGallery } from '../components/TemplateGallery';

export function GeneratorPage({ title, category, models }: { title: string; category: string; models: string[] }) {
  const [model, setModel] = useState(models[0]);
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');
  const [group, setGroup] = useState<'BR' | 'INT'>('BR');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function gen() {
    setError('');
    setLoading(true);
    try {
      const payload: any = { title: `${title} ${model}`, shortText: text };
      if (category === 'football') {
        payload.title = day === 'today' ? 'JOGOS DE HOJE' : 'JOGOS DE AMANHÃ';
        payload.day = day;
        payload.group = group;
        payload.modelId = model;
        payload.contactText = text;
        payload.templateId = model;
      }

      const { data } = await api.post(`/generate/banner/${category}`, payload);
      setResult(data.resultUrl);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.code === 'ERR_NETWORK') {
        setError('Servidor backend indisponível. Verifique se o backend está rodando na porta 4000.');
      } else {
        setError(msg ?? 'Falha ao gerar banner');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl">{title}</h3>
      <TemplateGallery models={models} onSelect={setModel} />
      <div className="card space-y-3">
        {category === 'football' && (
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded ${day === 'today' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setDay('today')}>
              Jogos de Hoje
            </button>
            <button className={`px-3 py-2 rounded ${day === 'tomorrow' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setDay('tomorrow')}>
              Jogos de Amanhã
            </button>
          </div>
        )}

        {category === 'football' && (
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded ${group === 'BR' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setGroup('BR')}>
              Nacional (BR)
            </button>
            <button className={`px-3 py-2 rounded ${group === 'INT' ? 'bg-indigo-600' : 'bg-slate-700'}`} onClick={() => setGroup('INT')}>
              Internacional (INT)
            </button>
          </div>
        )}

        <input
          className="w-full bg-slate-800 p-2 rounded"
          placeholder={category === 'football' ? 'WhatsApp (número) ou texto opcional' : 'WhatsApp ou texto'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {category === 'football' && (
          <p className="text-xs text-slate-400">
            O cliente seleciona apenas: Hoje/Amanhã e Nacional/Internacional. Ícone WhatsApp aparece só para número válido.
          </p>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="bg-indigo-600 px-3 py-2 rounded disabled:opacity-60" onClick={gen}>
          {loading ? 'Gerando...' : 'Gerar'}
        </button>
        {result && <p className="mt-2 text-green-400">Gerado: {result}</p>}
      </div>
    </div>
  );
}
