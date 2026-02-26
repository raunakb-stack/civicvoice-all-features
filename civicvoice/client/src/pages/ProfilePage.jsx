import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

const BADGE_DEFS = [
  { id: 'first_report',  icon: '📝', label: 'First Report',    desc: 'Filed your first complaint',  threshold: 1   },
  { id: 'reporter_5',    icon: '🗣️', label: 'Active Reporter', desc: '5+ complaints filed',          threshold: 5   },
  { id: 'points_100',    icon: '⭐', label: 'Rising Star',     desc: '100+ civic points',            threshold: 100 },
  { id: 'points_500',    icon: '🏅', label: 'Civic Hero',      desc: '500+ civic points',            threshold: 500 },
  { id: 'voter',         icon: '👍', label: 'Community Voice', desc: 'Voted on 10+ complaints',      threshold: 10  },
];

const LEVEL_CONFIG = [
  { label: 'Bronze',  icon: '🥉', min: 0,   color: 'text-amber-700',  bar: 'bg-amber-600' },
  { label: 'Silver',  icon: '🥈', min: 100,  color: 'text-stone-500',  bar: 'bg-stone-400' },
  { label: 'Gold',    icon: '🥇', min: 300,  color: 'text-yellow-600', bar: 'bg-yellow-500' },
  { label: 'Diamond', icon: '💎', min: 700,  color: 'text-cyan-600',   bar: 'bg-cyan-500'  },
  { label: 'Legend',  icon: '🏆', min: 1500, color: 'text-purple-600', bar: 'bg-purple-500' },
];

function getLevel(pts) {
  let lvl = LEVEL_CONFIG[0];
  for (const l of LEVEL_CONFIG) { if (pts >= l.min) lvl = l; }
  return lvl;
}

function getLevelProgress(pts) {
  const idx = LEVEL_CONFIG.findIndex(l => pts < l.min);
  if (idx <= 0) return { pct: 100, next: null, needed: 0 };
  const cur = LEVEL_CONFIG[idx - 1];
  const nxt = LEVEL_CONFIG[idx];
  const pct = ((pts - cur.min) / (nxt.min - cur.min)) * 100;
  return { pct, next: nxt, needed: nxt.min - pts };
}

export default function ProfilePage() {
  const { user }   = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/complaints?limit=50').then(({ data }) => {
      setComplaints((data.complaints || []).filter(c =>
        c.citizen?._id === user?._id || c.citizen === user?._id
      ));
    }).finally(() => setLoading(false));
  }, []);

  const pts   = user?.civicPoints || 0;
  const level = getLevel(pts);
  const prog  = getLevelProgress(pts);
  const totalResolved = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-civic-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-civic-500/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold dark:text-white">{user?.name}</h1>
              <span className={`flex items-center gap-1 text-sm font-bold ${level.color}`}>
                {level.icon} {level.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user?.role === 'department' ? 'bg-blue-100 text-blue-700' :
                'bg-civic-100 text-civic-700'
              }`}>{user?.role}</span>
            </div>
            <p className="text-sm text-stone-400 mt-1">📍 {user?.city} · {user?.email}</p>
          </div>
        </div>

        {/* Points + Progress */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
              ⭐ {pts.toLocaleString()} Civic Points
            </span>
            {prog.next && (
              <span className="text-xs text-stone-400">{prog.needed} pts to {prog.next.label} {prog.next.icon}</span>
            )}
          </div>
          <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${level.bar}`}
              style={{ width: `${Math.min(100, prog.pct)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Complaints Filed', value: complaints.length, icon: '📋' },
            { label: 'Resolved',         value: totalResolved,      icon: '✅' },
            { label: 'Civic Points',     value: pts,                icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="text-center bg-stone-50 dark:bg-stone-800 rounded-xl py-3">
              <p className="text-xl font-bold text-stone-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.icon} {s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="card p-5">
        <h2 className="font-bold text-stone-900 dark:text-white mb-4">🏅 Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BADGE_DEFS.map(b => {
            const earned =
              (b.id === 'first_report'  && complaints.length >= 1)  ||
              (b.id === 'reporter_5'    && complaints.length >= 5)  ||
              (b.id === 'points_100'    && pts >= 100)               ||
              (b.id === 'points_500'    && pts >= 500)               ||
              (b.id === 'voter'         && pts >= 50);
            return (
              <div key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                earned ? 'border-civic-300 bg-civic-50 dark:bg-civic-900/20' : 'border-stone-200 dark:border-stone-700 opacity-40 grayscale'
              }`}>
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-xs font-bold text-stone-800 dark:text-white">{b.label}</p>
                  <p className="text-xs text-stone-400">{b.desc}</p>
                  {earned && <span className="text-xs text-civic-600 font-semibold">✓ Earned</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complaint History */}
      <div className="card p-5">
        <h2 className="font-bold text-stone-900 dark:text-white mb-4">📋 My Complaint History</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-stone-100 rounded animate-pulse" />)}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-400 text-sm mb-3">No complaints filed yet.</p>
            <Link to="/complaints/new" className="btn-primary">Report First Issue</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {complaints.map(c => (
              <Link key={c._id} to={`/complaints/${c._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-stone-400">{c.department} · {format(new Date(c.createdAt), 'MMM d, yyyy')}</p>
                </div>
                <StatusBadge status={c.status} />
                <span className="text-xs text-civic-600 font-mono">▲{c.priorityScore}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
