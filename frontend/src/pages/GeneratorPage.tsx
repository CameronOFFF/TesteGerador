import { useState } from 'react';
import { api } from '../api/client';
import { TemplateGallery } from '../components/TemplateGallery';

export function GeneratorPage({ title, category, models }: { title: string; category: string; models: string[] }) {
  const [model, setModel] = useState(models[0]);
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function gen() {
    setError('');
    try {
      const payload: any = { title: `${title} ${model}`, shortText: text };
      if (category === 'football') {
        payload.title = day === 'today' ? 'DE HOJE' : 'DE AMANHÃ';
        payload.day = day;
        payload.modelId = model;
        payload.contactText = text;
      }

      const { data } = await api.post(`/generate/banner/${category}`, payload);
      setResult(data.resultUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao gerar banner');
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

        <input
          className="w-full bg-slate-800 p-2 rounded"
          placeholder={category === 'football' ? 'WhatsApp (número) ou texto opcional' : 'WhatsApp ou texto'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {category === 'football' && (
          <p className="text-xs text-slate-400">
            Regra: ícone do WhatsApp aparece apenas quando for número válido (10 a 13 dígitos). Para texto, mostra sem ícone.
          </p>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="bg-indigo-600 px-3 py-2 rounded" onClick={gen}>Gerar</button>
        {result && <p className="mt-2 text-green-400">Gerado: {result}</p>}
      </div>
    </div>
  );
}
