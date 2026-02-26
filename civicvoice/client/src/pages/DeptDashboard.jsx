import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import ComplaintCard from '../components/ComplaintCard';
import HeatmapChart from '../components/HeatmapChart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = { Pending:'#eab308','In Progress':'#3b82f6',Resolved:'#22c55e',Overdue:'#ef4444',Escalated:'#a855f7' };

const StatCard = ({ label, value, icon, border }) => (
  <div className={`card p-4 border-l-4 ${border}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-stone-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-xs text-stone-400 mt-0.5 font-medium">{label}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

export default function DeptDashboard() {
  const { user } = useAuth();
  const dept = user?.department;
  const [stats, setStats]           = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [tab, setTab]               = useState('complaints');
  const [dlLoading, setDlLoading]   = useState(false);

  useEffect(() => {
    if (!dept) return;
    api.get(`/stats/department/${encodeURIComponent(dept)}`).then(({data})=>setStats(data)).catch(()=>{});
    api.get(`/complaints?department=${encodeURIComponent(dept)}&limit=100`).then(({data})=>setComplaints(data.complaints||[])).catch(()=>{});
  }, [dept]);

  const downloadPDF = async () => {
    setDlLoading(true);
    try {
      const res = await fetch(`/api/reports/weekly/${encodeURIComponent(dept)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cv_token')}` },
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `CivicVoice_Weekly_${dept.replace(/\s+/g,'_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('📄 Weekly report downloaded!');
    } catch { toast.error('PDF generation failed'); }
    setDlLoading(false);
  };

  const pieData = stats ? [
    { name:'Pending',     value:stats.pending },
    { name:'In Progress', value:stats.inProgress },
    { name:'Resolved',    value:stats.resolved },
    { name:'Overdue',     value:stats.overdue },
  ].filter(d=>d.value>0) : [];

  const barData = complaints.reduce((acc,c) => {
    const day = new Date(c.createdAt).toLocaleDateString('en',{weekday:'short'});
    const ex  = acc.find(a=>a.day===day);
    if (ex) ex.count++; else acc.push({day,count:1});
    return acc;
  },[]).slice(-7);

  const TABS = ['complaints','analytics','heatmap'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider mb-1">🏛 {dept}</h1>
          <p className="text-blue-200 text-sm">Department Dashboard · {user?.city}</p>
        </div>
        <button onClick={downloadPDF} disabled={dlLoading}
          className="flex items-center gap-2 bg-white text-blue-700 font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition text-sm shadow disabled:opacity-60">
          {dlLoading ? '⏳' : '📄'} Weekly PDF Report
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total"          value={stats?.total}       icon="📋" border="border-stone-300" />
        <StatCard label="Pending"        value={stats?.pending}     icon="⏳" border="border-yellow-400" />
        <StatCard label="In Progress"    value={stats?.inProgress}  icon="🔧" border="border-blue-400" />
        <StatCard label="Resolved"       value={stats?.resolved}    icon="✅" border="border-green-400" />
        <StatCard label="Overdue"        value={stats?.overdue}     icon="🚨" border="border-red-400" />
        <StatCard label="Escalated"      value={stats?.escalated}   icon="⚡" border="border-purple-400" />
        <StatCard label="Resolution Rate" value={stats?`${stats.resolutionRate}%`:null} icon="📈" border="border-cyan-400" />
        <StatCard label="Avg Resolution" value={stats?.avgResolutionHours!=='N/A'?`${stats?.avgResolutionHours}h`:'—'} icon="⏱" border="border-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition border-b-2 -mb-px ${
              tab===t ? 'border-civic-500 text-civic-600' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}>
            {t==='complaints'?'📋 Complaints':t==='analytics'?'📊 Analytics':'🌡 Heatmap'}
          </button>
        ))}
      </div>

      {/* Tab: Complaints */}
      {tab==='complaints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {complaints.map(c=><ComplaintCard key={c._id} complaint={c}/>)}
          {complaints.length===0 && (
            <div className="col-span-3 card p-16 text-center text-stone-400">📭 No complaints for your department yet.</div>
          )}
        </div>
      )}

      {/* Tab: Analytics */}
      {tab==='analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map(e=><Cell key={e.name} fill={PIE_COLORS[e.name]||'#999'}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Complaints — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis dataKey="day" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:12}}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#e8820c" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-stone-700 dark:text-stone-300 mb-3">Citizen Satisfaction</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-civic-500">{stats?.avgRating||'—'}</div>
              <div>
                <p className="text-sm text-stone-500">Average Rating</p>
                <p className="text-xs text-stone-400">from {stats?.resolved||0} resolved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Heatmap */}
      {tab==='heatmap' && (
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-stone-900 dark:text-white">🌡 Complaint Activity Heatmap</h3>
            <p className="text-xs text-stone-400 mt-0.5">Day × Hour distribution of all {dept} complaints</p>
          </div>
          <HeatmapChart complaints={complaints}/>
        </div>
      )}
    </div>
  );
}
