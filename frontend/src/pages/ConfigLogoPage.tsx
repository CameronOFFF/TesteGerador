import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function ConfigLogoPage(){
  const [file,setFile]=useState<File>();
  useEffect(()=>{alert('Uso exclusivo da sua marca. Tentativas de universalizar podem levar a exclusão.');},[]);
  async function upload(){if(!file)return; const form=new FormData(); form.append('logo',file); await api.post('/tenant/logo',form); alert('Logo enviada');}
  return <div className="card max-w-xl space-y-3"><h3>Logo Atual / Upload PNG</h3><input type="file" accept="image/png" onChange={e=>setFile(e.target.files?.[0])}/><p className="text-slate-400">Você tem 2 trocas por dia.</p><button onClick={upload} className="bg-indigo-600 px-3 py-2 rounded">Enviar logo</button></div>
}
