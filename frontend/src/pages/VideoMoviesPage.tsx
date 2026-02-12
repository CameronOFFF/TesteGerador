import { useState } from 'react';
import { api } from '../api/client';
import { JobStatusModal } from '../components/JobStatusModal';

export function VideoMoviesPage(){
  const [type,setType]=useState<'movie'|'series'>('movie'); const [title,setTitle]=useState(''); const [shortText,setShort]=useState(''); const [job,setJob]=useState<any>(); const [top,setTop]=useState<any[]>([]);
  async function loadTop(){const {data}=await api.get('/analytics/top-searches?tenantId=1'); setTop(data);} 
  async function gen(){const {data}=await api.post(`/generate/video/${type}`,{type,title,shortText}); setJob({id:data.jobId,status:'pending',progress:0}); loadTop();}
  return <div className="space-y-4"><div className="card space-y-2"><h3>Gerador de Vídeos de Filmes</h3><div className="space-x-2"><button className="bg-slate-700 px-2" onClick={()=>setType('movie')}>Filme</button><button className="bg-slate-700 px-2" onClick={()=>setType('series')}>Série</button></div><input className="w-full bg-slate-800 p-2 rounded" placeholder="Nome" value={title} onChange={e=>setTitle(e.target.value)} /><input className="w-full bg-slate-800 p-2 rounded" placeholder="Texto curto máx 13" value={shortText} onChange={e=>setShort(e.target.value)} /><button className="bg-indigo-600 rounded px-3 py-2" onClick={gen}>GERAR VIDEO</button></div><div className="card"><h4>Top 5 Filmes Buscados</h4>{top.map((t)=><div key={t.query}>{t.query} ({t.total})</div>)}</div><JobStatusModal job={job}/></div>
}
