import { Link } from 'react-router-dom';
const cards = [
  ['Suporte Revendedor', 'Chamar no WhatsApp', '/config/whatsapp'],
  ['Banner Futebol', 'Criar Arte', '/banners/futebol'],
  ['Gerador de Vídeo', 'Criar Vídeo', '/videos/filmes-series'],
  ['Banner Filmes', 'Montar Banner', '/banners/filmes'],
  ['Banner Séries/Novelas', 'Criar Divulgação', '/banners/series'],
  ['Logo', 'Configurar', '/config/logo'],
  ['Canal Telegram', 'Entrar', '/dashboard'],
  ['Sair', 'Deslogar', '/logout']
];
export function DashboardPage(){return <div className="grid md:grid-cols-4 gap-4">{cards.map(([t,b,l])=><div key={t} className="card"><h3>{t}</h3><Link className="text-indigo-400" to={l}>{b}</Link></div>)}</div>;}
