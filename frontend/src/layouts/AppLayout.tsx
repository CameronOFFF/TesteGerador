import { Outlet } from 'react-router-dom';
import { SidebarNav } from '../components/SidebarNav';
import { TopBar } from '../components/TopBar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SidebarNav />
      <main className="ml-72 p-6">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
