import { useAuth } from '../context/AuthContext';

export function TopBar() {
  const { tenant } = useAuth();
  return (
    <header className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Bem-vindo, {tenant?.nome_da_marca ?? 'Marca'}!</h2>
      <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700">Vence em: {tenant?.vencimento_em?.slice(0, 10) ?? '--/--/----'}</div>
    </header>
  );
}
