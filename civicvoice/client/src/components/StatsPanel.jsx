import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const StatBox = ({ icon, label, value, color }) => (
  <div className="card p-4 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-stone-900 dark:text-white leading-none">{value ?? '—'}</p>
      <p className="text-xs text-stone-400 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const load = () => api.get('/stats/city').then(({data})=>setStats(data)).catch(()=>{});
    load();
    const tid = setInterval(load, 60_000);
    return () => clearInterval(tid);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatBox icon="📋" label={t('stats.issuestoday')}   value={stats?.todayTotal}          color="bg-amber-50 dark:bg-amber-900/20"/>
      <StatBox icon="✅" label={t('stats.resolvedToday')} value={stats?.resolvedToday}        color="bg-green-50 dark:bg-green-900/20"/>
      <StatBox icon="⏱"  label={t('stats.avgResolution')} value={stats?.avgResolutionHours}   color="bg-blue-50  dark:bg-blue-900/20"/>
      <StatBox icon="👥" label={t('stats.activeUsers')}   value={stats?.activeUsers}          color="bg-purple-50 dark:bg-purple-900/20"/>
      <StatBox icon="📊" label={t('stats.total')}         value={stats?.total}                color="bg-stone-100 dark:bg-stone-800"/>
      <StatBox icon="🚨" label={t('stats.overdue')}       value={stats?.overdue}              color="bg-red-50   dark:bg-red-900/20"/>
      <StatBox icon="⚡" label={t('stats.escalated')}     value={stats?.escalated}            color="bg-orange-50 dark:bg-orange-900/20"/>
      <StatBox icon="📈" label={t('stats.resolutionRate')} value={stats?`${stats.resolutionRate}%`:null} color="bg-cyan-50 dark:bg-cyan-900/20"/>
    </div>
  );
}
