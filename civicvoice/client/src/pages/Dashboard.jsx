import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import StatsPanel from '../components/StatsPanel';
import ComplaintCard from '../components/ComplaintCard';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const { t }    = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/complaints?limit=6').then(({data})=>setComplaints(data.complaints||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-civic-500 to-civic-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wider mb-1">
              {t('dashboard.welcome')}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-civic-100 text-sm">
              {user?.city} · {user?.civicPoints||0} Civic Points · <span className="capitalize">{user?.role}</span>
            </p>
          </div>
          {(user?.role==='citizen'||user?.role==='admin') && (
            <Link to="/complaints/new" className="bg-white text-civic-600 font-bold px-5 py-2.5 rounded-xl hover:bg-civic-50 transition text-sm shadow">
              + {t('nav.report')}
            </Link>
          )}
        </div>
      </div>

      {/* City Stats */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
          🏙 {t('dashboard.liveStats')}
        </h2>
        <StatsPanel/>
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            📋 {t('dashboard.recentIssues')}
          </h2>
          <Link to="/complaints" className="text-sm text-civic-600 font-semibold hover:underline">{t('dashboard.viewAll')}</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2"/>
                <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-full mb-1"/>
                <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-2/3"/>
              </div>
            ))}
          </div>
        ) : complaints.length>0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map(c=><ComplaintCard key={c._id} complaint={c}/>)}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-stone-500 font-medium">{t('dashboard.noComplaints')}</p>
            {user?.role==='citizen' && (
              <Link to="/complaints/new" className="btn-primary inline-block mt-4">{t('dashboard.reportFirst')}</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
