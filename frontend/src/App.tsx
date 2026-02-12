import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConfigWhatsAppPage } from './pages/ConfigWhatsAppPage';
import { ConfigLogoPage } from './pages/ConfigLogoPage';
import { VideoMoviesPage } from './pages/VideoMoviesPage';
import { VideoPromoPage } from './pages/VideoPromoPage';
import { GuideFootballPage } from './pages/GuideFootballPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { LogoutPage } from './pages/LogoutPage';
import { ExpiredPage } from './pages/ExpiredPage';

function Protected() {
  const { user, tenant, loading } = useAuth();
  if (loading) return <div className="p-6">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (tenant?.vencimento_em && new Date(tenant.vencimento_em) < new Date()) return <ExpiredPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/config/whatsapp" element={<ConfigWhatsAppPage />} />
        <Route path="/config/logo" element={<ConfigLogoPage />} />
        <Route path="/videos/filmes-series" element={<VideoMoviesPage />} />
        <Route path="/videos/divulgacao" element={<VideoPromoPage />} />
        <Route path="/banners/futebol" element={<GeneratorPage title="Futebol" category="football" models={['Modelo 1','Modelo 2','Modelo 3','Modelo 4','Modelo 5','Modelo 6']} />} />
        <Route path="/guia/futebol" element={<GuideFootballPage />} />
        <Route path="/banners/nba" element={<GeneratorPage title="NBA" category="nba" models={['NBA 1 Amarelo','NBA 1 Vermelho','NBA 1 Roxo','NBA 1 Azul','NBA 1 Verde','NBA 2 Azul']} />} />
        <Route path="/banners/ufc" element={<GeneratorPage title="UFC" category="ufc" models={['UFC 1','UFC 2','UFC Azul','UFC Cinza','UFC Roxo','UFC Verde']} />} />
        <Route path="/banners/esportes" element={<GeneratorPage title="Todos esportes" category="sports" models={['Padrão','Roxo','Azul','Vermelho','Cinza','Laranja']} />} />
        <Route path="/banners/filmes" element={<GeneratorPage title="Banner Filme" category="movie" models={['Filme Default']} />} />
        <Route path="/banners/series" element={<GeneratorPage title="Banner Série/Novela" category="series" models={['Série Default']} />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Protected />} />
      </Routes>
    </AuthProvider>
  );
}
