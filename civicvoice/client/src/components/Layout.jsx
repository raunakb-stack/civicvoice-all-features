import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import PWAInstallBanner from './PWAInstallBanner';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <PWAInstallBanner />
    </div>
  );
}
