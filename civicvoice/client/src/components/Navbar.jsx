import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'mr', label: 'म',  name: 'Marathi' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const { i18n }  = useTranslation();
  const navigate  = useNavigate();
  const [open, setOpen]       = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const roleBadge = {
    citizen:    { label: 'Citizen',    color: 'bg-civic-100 text-civic-700 dark:bg-civic-900/30' },
    department: { label: 'Department', color: 'bg-blue-100 text-blue-700' },
    admin:      { label: 'Admin',      color: 'bg-purple-100 text-purple-700' },
  }[user?.role] || {};

  return (
    <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-stone-600 dark:text-stone-300 hidden md:block">
          Smart Municipal Transparency Platform
        </h1>
        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full font-medium">
          🟢 Live
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Points */}
        <div className="hidden md:flex items-center gap-1.5 bg-civic-50 dark:bg-civic-900/20 border border-civic-200 dark:border-civic-800 text-civic-700 dark:text-civic-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          ⭐ {user?.civicPoints || 0} pts
        </div>

        {/* Language switcher */}
        <div className="relative">
          <button onClick={() => setLangOpen(o => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-bold text-stone-600 dark:text-stone-300 transition">
            🌐
          </button>
          {langOpen && (
            <div className="absolute right-0 top-11 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg overflow-hidden z-50 w-36">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 ${
                    i18n.language === l.code ? 'font-bold text-civic-600' : 'text-stone-700 dark:text-stone-300'
                  }`}>
                  <span className="font-bold w-5">{l.label}</span> {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition text-lg">
          {dark ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile dropdown */}
        <div className="relative">
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg px-2 py-1.5 transition">
            <div className="w-8 h-8 rounded-full bg-civic-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-stone-800 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-stone-400">{user?.email}</p>
            </div>
            <span className="text-stone-400 text-xs">▼</span>
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                <p className="text-sm font-semibold text-stone-800 dark:text-white">{user?.name}</p>
                <p className="text-xs text-stone-400">{user?.email}</p>
                <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}{user?.role === 'department' && ` · ${user?.department}`}
                </span>
              </div>
              <div className="p-1">
                <Link to="/profile" onClick={() => setOpen(false)}
                  className="block text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 px-3 py-2 rounded-lg transition">
                  👤 My Profile
                </Link>
                <button onClick={() => { setOpen(false); handleLogout(); }}
                  className="w-full text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition">
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
