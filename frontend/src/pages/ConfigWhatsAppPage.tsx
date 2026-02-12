import { useState } from 'react';
import { api } from '../api/client';

export function ConfigWhatsAppPage(){
  const [whatsappPadrao,setW]=useState(''); const [textoCurtoPadrao,setT]=useState('');
  async function save(){await api.put('/tenant/whatsapp',{whatsappPadrao,textoCurtoPadrao}); alert('Salvo');}
  return <div className="card max-w-xl space-y-3"><h3>Configurar WhatsApp</h3><input className="w-full bg-slate-800 p-2 rounded" id="whatsapp-padrao" name="whatsapp-padrao" placeholder="WhatsApp" value={whatsappPadrao} onChange={e=>setW(e.target.value)} /><input className="w-full bg-slate-800 p-2 rounded" id="texto-curto-padrao" name="texto-curto-padrao" placeholder="Texto curto máx 13" value={textoCurtoPadrao} onChange={e=>setT(e.target.value)} /><p className="text-sm text-slate-400">{textoCurtoPadrao.length}/13</p><button onClick={save} className="bg-indigo-600 px-3 py-2 rounded">Salvar</button></div>
}
