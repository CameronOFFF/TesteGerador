import { useState } from 'react';
import { api } from '../api/client';
import { JobStatusModal } from '../components/JobStatusModal';
import { WhatsAppSendButton } from '../components/WhatsAppSendButton';

const categories=['Divulgação','Indicações','UFC','Futebol'];
export function VideoPromoPage(){
  const [shortText,setShort]=useState(''); const [category,setCategory]=useState(categories[0]); const [job,setJob]=useState<any>();
  async function gen(templateId:string){const {data}=await api.post('/generate/video/promo',{templateId,category,shortText}); setJob({id:data.jobId,status:'pending',progress:0,result_url:''});}
  return <div className="space-y-4"><div className="card"><input className="w-full bg-slate-800 p-2 rounded mb-2" value={shortText} onChange={e=>setShort(e.target.value)} placeholder="Seu WhatsApp ou Texto" /><div className="flex gap-2 mb-3">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className="px-2 py-1 bg-slate-700 rounded">{c}</button>)}</div><div className="grid md:grid-cols-3 gap-3">{['template-1','template-2','template-3'].map(t=><div key={t} className="card"><div>{t}</div><button className="bg-indigo-600 rounded px-2 py-1 mt-2" onClick={()=>gen(t)}>Gerar Vídeo</button></div>)}</div></div>{job&&<div className="card"><JobStatusModal job={job}/><WhatsAppSendButton text={`Confira o vídeo ${job.result_url??''}`}/></div>}</div>
}
