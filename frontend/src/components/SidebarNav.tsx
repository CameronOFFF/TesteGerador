import { NavLink } from 'react-router-dom';

const items = [
  ['Dashboard', '/dashboard'],
  ['Configurar WhatsApp', '/config/whatsapp'],
  ['Mercado Pago (em breve)', '#'],
  ['Gerar Vídeo', '/videos/filmes-series'],
  ['Vídeo divulgação', '/videos/divulgacao'],
  ['Gerar Futebol', '/banners/futebol'],
  ['Guia Futebol', '/guia/futebol'],
  ['Gerar NBA', '/banners/nba'],
  ['Gerar UFC', '/banners/ufc'],
  ['Todos esportes', '/banners/esportes'],
  ['Gerar Banner Filme', '/banners/filmes'],
  ['Gerar Banner Séries/Novelas', '/banners/series'],
  ['Sair', '/logout']
];

export function SidebarNav() {
  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 p-4 fixed h-screen overflow-auto">
      <h1 className="text-xl font-bold mb-4">GERADORPRO</h1>
      <nav className="space-y-2">
        {items.map(([label, href]) =>
          href === '#' ? (
            <div key={label} className="text-slate-500 px-3 py-2 rounded-lg bg-slate-900">{label}</div>
          ) : (
            <NavLink key={label} to={href} className={({ isActive }) => `block px-3 py-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}
