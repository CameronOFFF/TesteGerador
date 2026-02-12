import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CopyToClipboardButton } from '../components/CopyToClipboardButton';
import { WhatsAppSendButton } from '../components/WhatsAppSendButton';

export function GuideFootballPage(){
 const [tab,setTab]=useState<'today'|'tomorrow'>('today'); const [text,setText]=useState('');
 useEffect(()=>{api.get(`/events/football?day=${tab}`).then(({data})=>setText(data.map((e:any)=>`🏆 ${e.league}\n⚽ ${e.home} x ${e.away}\n🕒 ${e.startTime}\n📺 ${e.whereToWatch.join(', ')}`).join('\n\n')));},[tab]);
 return <div className="card"><h3>GERADOR DE JOGOS</h3><div className="space-x-2 my-2"><button className="bg-slate-700 px-2" onClick={()=>setTab('today')}>Jogos de Hoje</button><button className="bg-slate-700 px-2" onClick={()=>setTab('tomorrow')}>Jogos de Amanhã</button></div><textarea className="w-full h-80 bg-slate-900 p-3 rounded" value={text} readOnly /><div className="mt-3 flex gap-2"><CopyToClipboardButton text={text}/><WhatsAppSendButton text={text}/></div></div>
}
