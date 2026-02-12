import { useState } from 'react';
import { api } from '../api/client';
import { TemplateGallery } from '../components/TemplateGallery';

export function GeneratorPage({title,category,models}:{title:string;category:string;models:string[]}){
  const [model,setModel]=useState(models[0]); const [text,setText]=useState(''); const [result,setResult]=useState('');
  async function gen(){const {data}=await api.post(`/generate/banner/${category}`,{title:`${title} ${model}`,shortText:text}); setResult(data.resultUrl);}
  return <div className="space-y-4"><h3 className="text-xl">{title}</h3><TemplateGallery models={models} onSelect={setModel}/><div className="card"><input className="w-full bg-slate-800 p-2 rounded mb-2" placeholder="WhatsApp ou texto" value={text} onChange={e=>setText(e.target.value)} /><button className="bg-indigo-600 px-3 py-2 rounded" onClick={gen}>Gerar</button>{result&&<p className="mt-2 text-green-400">Gerado: {result}</p>}</div></div>
}
