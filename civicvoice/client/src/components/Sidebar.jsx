import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-civic-500 text-white shadow-sm shadow-civic-500/30'
          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
      }`
    }
  >
    <span className="text-lg w-6 text-center">{icon}</span>
    <span className="flex-1">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();
  const { t }    = useTranslation();

  return (
    <aside className="w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center shadow-md shadow-civic-500/30">
            <span className="text-white font-display text-sm tracking-wider">CV</span>
          </div>
          <div>
            <div className="font-display text-xl tracking-wider text-stone-900 dark:text-white">CivicVoice</div>
            <div className="text-xs text-stone-400 -mt-0.5">📍 {user?.city || 'Amravati'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2">Main</p>
        <NavItem to="/dashboard"   icon="🏠" label={t('nav.dashboard')} />
        <NavItem to="/complaints"  icon="📋" label={t('nav.complaints')} />
        <NavItem to="/map"         icon="🗺"  label={t('nav.map')} />

        {(user?.role === 'citizen' || user?.role === 'admin') && (
          <NavItem to="/complaints/new" icon="✏️" label={t('nav.report')} />
        )}

        <NavItem to="/profile" icon="👤" label="My Profile" />

        {(user?.role === 'department' || user?.role === 'admin') && (
          <>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2 mt-3">Department</p>
            <NavItem to="/dept-dashboard" icon="🏛" label={t('nav.dept')} />
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2 mt-3">Admin</p>
            <NavItem to="/admin" icon="⚙️" label={t('nav.admin')} />
          </>
        )}
      </nav>

      {/* User info footer */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-civic-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-stone-400 capitalize">{user?.role} · ⭐{user?.civicPoints || 0}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
